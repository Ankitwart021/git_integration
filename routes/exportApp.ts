import express, { Request, Response } from 'express';
import { authenticateJWT, checkApplicationOwnership } from '../middleware/auth';
import { applicationService, pageService, resourceService, applicationEnumService, customComponentService } from '../services';
import archiver from 'archiver';
import prisma from '../src/utils/prisma';
import dotenv from 'dotenv';
import { Application, Page, Resource, ApplicationEnum, CustomComponent, User } from '@prisma/client';

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /export/{id}:
 *   get:
 *     summary: Export application data as a portable ZIP package
 *     tags: [Export]
 *     description: Exports all application metadata (application, pages, resources, enums) and the logged-in user's custom components into a ZIP file.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the application to export.
 *     responses:
 *       200:
 *         description: A ZIP file containing the application data.
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Authentication failed.
 *       403:
 *         description: Forbidden - User does not own the application.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Error processing request.
 */
router.get('/export/:id', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
    const { id: applicationId } = req.params;
    const userId = req.user?.id;
    const version = process.env.RASP_VERSION || '1.0.0';
    console.log('RASP version used for export:', version);

    if (!userId) {
        return res.status(401).send('User not authenticated');
    }

    try {
        // 1. Fetch Data
        const application: Application = await applicationService.getApplicationById(applicationId);
        const pages: Page[] = await pageService.getPagesByApplicationId(applicationId);
        const resources: Resource[] = await resourceService.getResourcesByApplicationId(applicationId);
        const enums: ApplicationEnum[] = await applicationEnumService.getApplicationEnumsByApplicationId(applicationId);
        // const customComponents: CustomComponent[] = await customComponentService.getCustomComponentsByUserId(userId);

        // Fetch Workflows and WorkflowStateData directly via Prisma
        const workflows = await prisma.workflow.findMany({ where: { applicationID: applicationId } });
        // const workflowStateData = await prisma.workflowStateData.findMany({ where: { applicationID: applicationId } });
        
        // 2. Prepare JSON content
        const applicationData = {
            id: application.id,
            name: application.name,
            description: application.description
        };

        const pagesData = pages.map(p => ({
            id: p.id,
            pageName: p.pageName,
            pageContent: p.pageContent // structure only
        }));

        const resourcesData = resources.map(r => ({
            id: r.id,
            resourceName: r.resourceName,
            attributes: r.attributes // structure only
        }));

        const enumsData = enums.map(e => ({
            id: e.id,
            enumName: e.enumName,
            enums: e.enums // structure only
        }));


        const workflowsData = workflows.map((w: any) => ({
            id: w.id,
            workflowName: w.workflowName,
            workflowData: w.workflowData,
            generatedWorkflowIds: w.generatedWorkflowIds
        }));

        // const workflowStateDataExport = workflowStateData.map((wsd: any) => ({
        //     id: wsd.id,
        //     workflowID: wsd.workflowID,
        //     nodes: wsd.nodes,
        //     edges: wsd.edges
        // }));

        // Meta Data
        const metaData = {
            version: version,
            exportedAppName: application.name
        };

        // const customComponentsData = customComponents.map(c => ({
        //     id: c.id,
        //     componentName: c.componentName,
        //     componentContent: c.componentContent // structure only
        // }));

        // 3. Create ZIP
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // Set the response headers
        const zipFilename = `${application.name.replace(/[^a-z0-9]/gi, '_')}_${version}v.zip`;
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.attachment(zipFilename);

        // Pipe archive data to the response
        archive.pipe(res);

        // Append files
        archive.append(JSON.stringify(metaData, null, 2), { name: 'meta.json' });
        archive.append(JSON.stringify(applicationData, null, 2), { name: 'application.json' });
        archive.append(JSON.stringify(pagesData, null, 2), { name: 'page.json' });
        archive.append(JSON.stringify(resourcesData, null, 2), { name: 'resource.json' });
        archive.append(JSON.stringify(enumsData, null, 2), { name: 'enum.json' });
        archive.append(JSON.stringify(workflowsData, null, 2), { name: 'workflow.json' });
        // archive.append(JSON.stringify(workflowStateDataExport, null, 2), { name: 'workflow_state_data.json' });
        // archive.append(JSON.stringify(customComponentsData, null, 2), { name: 'Custom_component.json' });

        // Finalize the archive (ie we are done appending files but streams have to finish yet)
        await archive.finalize();

    } catch (error) {
        console.error('Error exporting application:', error);
        if (!res.headersSent) {
            res.status(500).send('Failed to export application: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
});

export default router;
