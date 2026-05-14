import express, { Request, Response } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import prisma from '../src/utils/prisma';
import { authenticateJWT } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
// Limit upload size to 10 MB to prevent DoS via oversized payloads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

interface ApplicationData {
    id: string;
    name: string;
    description?: string;
}

interface PageData {
    id: string;
    pageName: string;
    pageContent: any;
}

interface ResourceData {
    id: string;
    resourceName: string;
    attributes: any;
}

interface EnumData {
    id: string;
    enumName: string;
    enums: any;
}

/**
 * @swagger
 * /import:
 *   post:
 *     summary: Import an application from a ZIP file
 *     tags: [Import]
 *     description: Imports an application including pages, resources, and enums from a ZIP file.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application imported successfully.
 *       400:
 *         description: Invalid request or file.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.post('/import', authenticateJWT, upload.single('file'), async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).send('User not authenticated');
    }

    if (!(req as any).file) {
        return res.status(400).send('No file uploaded');
    }

    const { name: appName, description: appDescription } = req.body;

    // Version Validation
    try {
        const zip = new AdmZip((req as any).file.buffer);
        const zipEntries = zip.getEntries();

        const getJsonData = (filename: string) => {
            const entry = zipEntries.find(entry => entry.entryName === filename);
            if (!entry) return null;
            return JSON.parse(entry.getData().toString('utf8'));
        };

        // Version Validation
        const currentVersion = process.env.RASP_VERSION || '1.0.0';
        const metaData = getJsonData('meta.json');

        if (metaData && metaData.version) {
            if (Number(metaData.version) > Number(currentVersion)) {
                return res.status(400).send(`Version mismatch. Imported version: ${metaData.version}, System version: ${currentVersion}. Import is only allowed for the matching system version.`);
            }
        } else {
            // Fallback to filename check for legacy exports
            const originalName = (req as any).file.originalname;
            if (originalName) {
                const nameWithoutExt = originalName.replace(/\.zip$/i, '');
                const parts = nameWithoutExt.split('_');
                let importedVersion = parts[parts.length - 1];

                // Remove trailing 'v' or 'V' if present, as per new export format
                if (importedVersion.toLowerCase().endsWith('v')) {
                    importedVersion = importedVersion.slice(0, -1);
                }

                if (importedVersion === currentVersion) {
                    // matches, good.
                } else {
                    if (importedVersion !== currentVersion) {
                        return res.status(400).send(`Version mismatch (Filename). Imported version: ${importedVersion}, System version: ${currentVersion}. Import is only allowed for the matching system version.`);
                    }
                }
            }
        }

        const appData: ApplicationData | null = getJsonData('application.json');
        const pagesData: PageData[] | null = getJsonData('page.json');
        const resourcesData: ResourceData[] | null = getJsonData('resource.json');
        const enumsData: EnumData[] | null = getJsonData('enum.json');

        if (!appData || !pagesData || !resourcesData || !enumsData) {
            return res.status(400).send('Invalid ZIP structure: formatted JSON files missing');
        }

        // Use provided name/desc if available, else fallback to JSON data
        const finalAppName = appName || appData.name;
        const finalAppDesc = appDescription || appData.description;

        // Create a map for ID replacement (Old ID -> New ID)
        const idMap: Record<string, string> = {};

        // 1. Remap Application ID
        const oldAppId = appData.id;
        const newAppId = uuidv4();
        idMap[oldAppId] = newAppId;

        // 2. Remap Page IDs
        const remappedPages = pagesData.map(p => {
            const newPageId = uuidv4();
            idMap[p.id] = newPageId;
            return { ...p, id: newPageId };
        });

        // 3. Remap Resource IDs
        const remappedResources = resourcesData.map(r => {
            const newResourceId = uuidv4();
            idMap[r.id] = newResourceId;
            return { ...r, id: newResourceId };
        });

        // 4. Remap Enum IDs
        const remappedEnums = enumsData.map(e => {
            const newEnumId = uuidv4();
            idMap[e.id] = newEnumId;
            return { ...e, id: newEnumId };
        });

        const workflowsData: any[] | null = getJsonData('workflow.json');
        // const workflowStateData: any[] | null = getJsonData('workflow_state_data.json');

        // 5. Remap Workflow IDs
        const remappedWorkflows = (workflowsData || []).map((w: any) => {
            const newWorkflowId = uuidv4();
            idMap[w.id] = newWorkflowId;
            return { ...w, id: newWorkflowId };
        });

        // 6. Remap Workflow State Data IDs
        // const remappedWorkflowStateData = (workflowStateData || []).map((wsd: any) => {
        //     const newWsdId = uuidv4();
        //     idMap[wsd.id] = newWsdId;
        //     return { ...wsd, id: newWsdId };
        // });

        // Function to perform global replacement in an object
        const replaceIdsInObject = (obj: any): any => {
            let str = JSON.stringify(obj);
            Object.keys(idMap).forEach(oldId => {
                // Use a global regex to replace all occurrences
                // We need to escape special regex characters in keys if any, though UUIDs are safe.
                const regex = new RegExp(oldId, 'g');
                str = str.replace(regex, idMap[oldId]);
            });
            return JSON.parse(str);
        };


        await prisma.$transaction(async (tx: any) => {
            // 1. Create Application with NEW ID
            await tx.application.create({
                data: {
                    id: newAppId,
                    name: finalAppName,
                    description: finalAppDesc,
                    createdAt: new Date(),
                }
            });

            // 2. Link User to Application
            await tx.userApplicationMap.create({
                data: {
                    userId: userId,
                    applicationID: newAppId
                }
            });

            // 3. Create Pages with Remapped IDs and Content
            if (remappedPages.length > 0) {
                const processedPages = remappedPages.map(p => ({
                    id: p.id,
                    applicationID: newAppId,
                    pageName: p.pageName,
                    pageContent: replaceIdsInObject(p.pageContent), // Replace refs inside content
                    createdAt: new Date()
                }));

                await tx.page.createMany({
                    data: processedPages
                });
            }

            // 4. Create Resources with Remapped IDs and Attributes
            if (remappedResources.length > 0) {
                const processedResources = remappedResources.map(r => ({
                    id: r.id,
                    applicationID: newAppId,
                    resourceName: r.resourceName,
                    attributes: replaceIdsInObject(r.attributes), // Replace refs inside attributes
                    createdAt: new Date()
                }));

                await tx.resource.createMany({
                    data: processedResources
                });
            }

            // 5. Create Enums with Remapped IDs and Values
            if (remappedEnums.length > 0) {
                const processedEnums = remappedEnums.map(e => ({
                    id: e.id,
                    applicationID: newAppId,
                    enumName: e.enumName,
                    enums: replaceIdsInObject(e.enums), // Replace refs inside enums
                    createdAt: new Date()
                }));

                await tx.applicationEnum.createMany({
                    data: processedEnums
                });
            }

            // 6. Create Workflows
            if (remappedWorkflows.length > 0) {
                const processedWorkflows = remappedWorkflows.map((w: any) => ({
                    id: w.id,
                    applicationID: newAppId,
                    workflowName: w.workflowName,
                    workflowData: replaceIdsInObject(w.workflowData),
                    generatedWorkflowIds: replaceIdsInObject(w.generatedWorkflowIds),
                    createdAt: new Date()
                }));

                await tx.workflow.createMany({
                    data: processedWorkflows
                });
            }

            // 7. Create Workflow State Data
            // if (remappedWorkflowStateData.length > 0) {
            //     const processedStateData = remappedWorkflowStateData.map((wsd: any) => ({
            //         id: wsd.id,
            //         workflowID: idMap[wsd.workflowID] || wsd.workflowID, // Ensure workflowID is remapped
            //         applicationID: newAppId,
            //         nodes: replaceIdsInObject(wsd.nodes),
            //         edges: replaceIdsInObject(wsd.edges),
            //         createdAt: new Date()
            //     }));

            //     await tx.workflowStateData.createMany({
            //         data: processedStateData
            //     });
            // }
        });

        res.status(200).json({ message: 'Application imported successfully', newApplicationId: newAppId , oldApplicationId:oldAppId});

    } catch (error) {
        console.error('Error importing application:', error);
        res.status(500).send('Failed to import application: ' + (error instanceof Error ? error.message : 'Unknown error'));
        // If transaction fails, everything is rolled back
    }
});

export default router;
