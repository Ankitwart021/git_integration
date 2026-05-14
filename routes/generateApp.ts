import express from "express";
import { applicationService, resourceService, applicationEnumService } from "../services";
import { generateFrontendProject, generateProject } from "../utils/project-generator"; // New function
import { createAndDownloadZip } from "../utils/zipanddownload"; // Modified function
import { GenerateBackendAppService } from "../services/GenerateCombinedZip"; // New service
import { Request, Response } from "express";
import { authenticateJWT, checkApplicationOwnership } from "../middleware/auth";
import { z } from "zod";
import { validate } from "../middleware/validation";
import path from "path"; // Needed for path.join
import { Prisma, ApplicationEnum, Resource } from '@prisma/client'; // Import Prisma and ApplicationEnum

const router = express.Router();

// Interfaces copied from GenerateAppService.ts
interface Field {
  foreign?: boolean;
  isEnum?: boolean;
  [key: string]: Prisma.JsonValue | undefined;
}
interface FormattedEnums {
  enum_name: string;
  fieldValues: Field[];
}


interface FormattedResource {
  resource: string;
  fieldValues: Field[];
}

interface ResourcesAndEnums {
  resourceDtos: FormattedResource[];
  enumDtos: FormattedEnums[];
}

// Validation schema for generateApp endpoint
const generateAppSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'Application ID is required' }),
  }),
});

/**
 * @swagger
 * /generateApp/{id}:
 *   post:
 *     summary: Generate and download a combined frontend and backend application zip
 *     tags: [App Generation]
 *     description: Generates both the frontend React application and the backend application, then combines them into a single zip file for download.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the application to generate.
 *     responses:
 *       200:
 *         description: A zip file containing the generated frontend and backend applications.
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Error processing request.
 */
router.post("/generateApp/:id", [authenticateJWT, checkApplicationOwnership], validate(generateAppSchema), async (req: Request, res: Response) => {
  const { id: applicationId } = req.params;

  try {
    // 1. Prepare payload for backend generation
    const allResources = await resourceService.getResourcesByApplicationId(applicationId);
    const allEnums = await applicationEnumService.getApplicationEnumsByApplicationId(applicationId);

    const formattedResources: FormattedResource[] = allResources.map((item: Resource) => {
      const attributes = item.attributes as any;
      let fieldValues: Field[] = [];

      if (Array.isArray(attributes)) {
        fieldValues = attributes;
      } else if (attributes && typeof attributes === 'object' && Array.isArray(attributes.fieldValues)) {
        fieldValues = attributes.fieldValues;
      }

      return {
        resource: item.resourceName,
        fieldValues: fieldValues.map((field: Field) => ({ ...field }))
      };
    });
    const formattedEnums: FormattedEnums[] = allEnums.map((item: ApplicationEnum) => {
      const values = item.enums as any;
      let fieldValues: Field[] = [];
 
      if (Array.isArray(values)) {
        fieldValues = values;
      } else if (values && typeof values === 'object' && Array.isArray(values.fieldValues)) {
        fieldValues = values.fieldValues;
      }
 
      return {
        enum_name: item.enumName,
        fieldValues: fieldValues.map((field: Field) => ({ ...field }))
      };
    });
    const resourcesAndEnums: ResourcesAndEnums = {
      resourceDtos: formattedResources,
      enumDtos: formattedEnums,
    };

    // 2. Generate Backend Zip
    const generateBackendAppService = new GenerateBackendAppService();
    const backendZipBuffer = await generateBackendAppService.generateBackendAppZip(resourcesAndEnums);

    // 3. Generate Frontend App
    // loginPageId is hardcoded to '1' as per saveThenDownload.ts
    const frontendProjectDir = await generateFrontendProject(applicationId, '1');

    // 4. Define additional files (dockerfiles)
    const dockerfilesDir = path.join(__dirname, "..", "dockerfiles");
    const filesToAdd = [
      {
        source: path.join(dockerfilesDir, 'docker-compose.yml'),
        dest: 'docker-compose.yml'
      },
      {
        source: path.join(dockerfilesDir, 'frontend.Dockerfile'),
        dest: 'frontend/Dockerfile'
      },
      {
        source: path.join(dockerfilesDir, 'backend.Dockerfile'),
        dest: 'backend/Dockerfile'
      }
    ];

    // 5. Create and Download Combined Zip
    // The createAndDownloadZip function now handles sending the response
    createAndDownloadZip(frontendProjectDir, applicationId, res, filesToAdd, backendZipBuffer);

  } catch (err: any) {
    console.error("Error generating combined app zip:", err);
    if (err.statusCode) {
      return res.status(err.statusCode).send(err.message);
    }
    return res.status(500).send("Error processing request: " + err.message);
  }
});

export default router;
