import express, { Request, Response } from 'express';
import { applicationEnumService } from '../services';
import { authenticateJWT, checkApplicationOwnership } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { hashUnitContent } from '../src/utils/hashUtils';
const router = express.Router();

//this is for validating create enum request
const createEnumSchema = z.object({
  body: z.object({
    enumName: z.string({
      required_error: 'Enum name is required',
    }).min(1, { message: 'Enum name cannot be empty' }),
    enums: z.object({}).optional(),
  }),
  params: z.object({
    applicationId: z.string().min(1, { message: 'Application ID is required' }),
  }),
});

//this is for validating update enum request
const updateEnumSchema = z.object({
  body: z.object({
    enumName: z.string().min(1, { message: 'Enum name cannot be empty' }).optional(),
    enums: z.object({}).optional(),
  }),
  params: z.object({
    applicationId: z.string().min(1, { message: 'Application ID is required' }),
    enumId: z.string().min(1, { message: 'Enum ID is required' }),
  }),
});

/**
 * @swagger
 * /applications/{applicationId}/createEnum:
 *   post:
 *     summary: Create an enum
 *     tags: [Enums]
 *     description: Creates a new enum for a specific application.
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
 *               enumName:
 *                 type: string
 *               enums:
 *                 type: object
 *     responses:
 *       201:
 *         description: Enum created successfully.
 *       400:
 *         description: Bad request. enumName and enums are required.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error creating enum.
 */
router.post('/applications/:applicationId/createEnum', [authenticateJWT, checkApplicationOwnership],validate(createEnumSchema) ,async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const { enumName, enums } = req.body;
  const hashContent = {enumName,enums};
  const localHash = hashUnitContent(hashContent);
  const timestamp: number = Date.now();
// const lastSyncedAt: Date = new Date(timestamp);
const serverHash = null; // This can be generated on the server side after saving the page
const syncVersion = 0; // Initial sync version, can be incremented on each update

  const newEnum = await applicationEnumService.createApplicationEnum({
    enumName,
    enums,
    localHash,
    serverHash,
    syncVersion,
    lastSyncedAt: null,
    application: {
      connect: { id: applicationId },
    },
  });
  console.log('Enum saved successfully');
  res.status(201).json(newEnum);
});

/**
 * @swagger
 * /applications/{applicationId}/updateEnum/{enumId}:
 *   put:
 *     summary: Update an enum
 *     tags: [Enums]
 *     description: Updates an existing enum.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: enumId
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
 *               enumName:
 *                 type: string
 *               enums:
 *                 type: object
 *     responses:
 *       200:
 *         description: Enum updated successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error updating enum.
 */
router.put('/applications/:applicationId/updateEnum/:enumId', [authenticateJWT, checkApplicationOwnership], validate(updateEnumSchema),async (req: Request, res: Response) => {
  const { applicationId, enumId } = req.params;
  const { enumName, enums } = req.body;
  const hashContent = {enumName,enums};
  const localHash = hashUnitContent(hashContent);

  const updatedEnum = await applicationEnumService.updateApplicationEnum(enumId, applicationId, { enumName, enums ,localHash});
  console.log('Enum updated successfully');
  res.status(200).json(updatedEnum);
});

/**
 * @swagger
 * /applications/{applicationId}/getEnums:
 *   get:
 *     summary: Get enums by application ID
 *     tags: [Enums]
 *     description: Retrieves all enums for a specific application.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of enums.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error getting enums.
 */
router.get('/applications/:applicationId/getEnums', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { applicationId } = req.params;

  const enums = await applicationEnumService.getApplicationEnumsByApplicationId(applicationId);
  res.status(200).send(enums);
});

/**
 * @swagger
 * /applications/{applicationId}/deleteEnum/{enumId}:
 *   delete:
 *     summary: Delete an enum by ID
 *     tags: [Enums]
 *     description: Deletes an enum by its unique ID.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: enumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enum deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Error deleting enum.
 */
router.delete('/applications/:applicationId/deleteEnum/:enumId', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { applicationId, enumId } = req.params;

  await applicationEnumService.deleteApplicationEnum(enumId, applicationId);
  console.log('Enum deleted successfully');
  res.status(200).send({ message: 'Enum deleted successfully' });
});

export = router;