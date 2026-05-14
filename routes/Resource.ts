import express, { Request, Response } from 'express';
import { resourceService, generateAppService } from '../services';
import { authenticateJWT, checkApplicationOwnership } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { hashUnitContent } from '../src/utils/hashUtils';

const router = express.Router();

//this is for validating create resource request
const createResourceSchema = z.object({
  body: z.object({
    resourceName: z.string({
      required_error: 'Resource name is required',
    }).min(1, { message: 'Resource name cannot be empty' }),
    attributes: z.object({}).optional(),
  }),
  params: z.object({
    applicationId: z.string().min(1, { message: 'Application ID is required' }),
  }),
});
//this is for validating update resource request
const updateResourceSchema = z.object({
  body: z.object({
    resourceName: z.string().min(1, { message: 'Resource name cannot be empty' }).optional(),
    attributes: z.object({}).optional(),
  }),
  params: z.object({
    applicationId: z.string().min(1, { message: 'Application ID is required' }),
    resourceId: z.string().min(1, { message: 'Resource ID is required' }),
  }),
});

/**
 * @swagger
 * /applications/{applicationId}/createResource:
 *   post:
 *     summary: Create a resource
 *     tags: [Resources]
 *     description: Creates a new resource for a specific application.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resourceName:
 *                 type: string
 *               attributes:
 *                 type: object
 *     responses:
 *       201:
 *         description: Resource created successfully.
 *       400:
 *         description: Bad request. resourceName and attributes are required.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error creating resource.
 */
router.post('/applications/:applicationId/createResource', [authenticateJWT, checkApplicationOwnership],validate(createResourceSchema) ,async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const { resourceName, attributes } = req.body;
  const dataToHash = { resourceName, attributes };

    const localHash = hashUnitContent(dataToHash);
    
  
console.log('Creating resource with name:', attributes);
  const newResource = await resourceService.createResource({
    resourceName: resourceName,
    attributes,
    localHash,
    application: {
      connect: { id: applicationId },
    },
  });
  console.log('Resource created successfully');
  res.status(201).json(newResource);
});

/**
 * @swagger
 * /applications/{applicationId}/updateResource/{resourceId}:
 *   put:
 *     summary: Update a resource
 *     tags: [Resources]
 *     description: Updates an existing resource.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resourceName:
 *                 type: string
 *               attributes:
 *                 type: object
 *     responses:
 *       200:
 *         description: Resource updated successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error updating resource.
 */
router.put('/applications/:applicationId/updateResource/:resourceId', [authenticateJWT, checkApplicationOwnership],validate(updateResourceSchema) , async (req: Request, res: Response) => {
  const { applicationId, resourceId } = req.params;
  const { resourceName, attributes } = req.body;
    const dataToHash = { resourceName, attributes };
    const localHash = hashUnitContent(dataToHash);


  const updatedResource = await resourceService.updateResource(resourceId, applicationId, { resourceName: resourceName, attributes, localHash });
  console.log('Resource updated successfully');
  res.status(200).json(updatedResource);
});

/**
 * @swagger
 * /applications/{applicationId}/getResources:
 *   get:
 *     summary: Get resources by application ID
 *     tags: [Resources]
 *     description: Retrieves all resources for a specific application.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of resources.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error getting resources.
 */
router.get('/applications/:applicationId/getResources', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { applicationId } = req.params;

  const resources = await resourceService.getResourcesByApplicationId(applicationId);
  res.status(200).send(resources);
});

/**
 * @swagger
 * /applications/{applicationId}/deleteResource/{resourceId}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
 *     description: Deletes a resource by its unique ID.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error deleting resource.
 */
router.delete('/applications/:applicationId/deleteResource/:resourceId', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { applicationId, resourceId } = req.params;

  await resourceService.deleteResource(resourceId, applicationId);
  console.log('Resource deleted successfully');
  res.status(200).send({ message: 'Resource deleted successfully' });
});

/**
 * @swagger
 * /applications/{applicationId}/generateResource:
 *   post:
 *     summary: Generate resource and enums
 *     tags: [Resources]
 *     description: Generate resource and enums based on applicationId.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource generated successfully.
 *       400:
 *         description: Bad request. applicationId is required.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Failed to generate resource.
 */
router.post('/applications/:applicationId/generateResource', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { applicationId } = req.params;

  const result = await generateAppService.generateApp(applicationId);

  res.status(200).json({ message: result });
});

export = router;