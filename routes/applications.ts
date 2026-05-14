import express, { Request, Response } from 'express';
import { applicationService } from '../services';
import { authenticateJWT, checkApplicationOwnership } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validation';

const router = express.Router();

//this is for validating create application request
const createApplicationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }).min(1, { message: 'Name cannot be empty' }),
    description: z.string().optional(),
  }),
});
//this is for validating update application request
const updateApplicationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name cannot be empty' }).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, { message: 'Application ID is required' }),
  }),
});

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create a new application
 *     tags:
 *       - Application
 *     description: Creates a new application and links it to the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created successfully.
 *       400:
 *         description: Bad request. Invalid input.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to create application.
 */

router.post('/applications', authenticateJWT, validate(createApplicationSchema), async (req: Request, res: Response) => {
  console.log("Creating application with data:", req.body);
  const lastSyncedAt: Date | null = null;
  const { name, description, isShared, remoteAppId, baseVersion } = req.body;
  const userId = req.user?.id;

  const application = await applicationService.createApplicationWithUserMapping(userId, { name, description, isShared, remoteAppId, baseVersion, lastSyncedAt });
  res.status(201).json(application);
});

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Fetch all applications for the authenticated user
 *     tags:
 *       - Application
 *     description: Retrieves a list of all applications associated with the authenticated user.
 *     responses:
 *       200:
 *         description: A list of applications.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to fetch applications.
 */
router.get('/applications', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const applications = await applicationService.getApplicationsByUserId(userId);
  res.status(200).json({ data: applications });
});

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Fetch an application by ID
 *     tags:
 *       - Application
 *     description: Retrieves a single application by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single application.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Failed to fetch application.
 */
router.get('/applications/:id', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { id } = req.params;

  const application = await applicationService.getApplicationById(id);
  res.status(200).json(application);
});

/**
 * @swagger
 * /applications/{id}:
 *   put:
 *     summary: Update an application
 *     tags:
 *       - Application
 *     description: Updates an existing application's details.
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application updated successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to update application.
 */
router.put('/applications/:id', [authenticateJWT, checkApplicationOwnership, validate(updateApplicationSchema)], async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const application = await applicationService.updateApplication(id, { name, description });
  res.status(200).json(application);
});

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: Delete an application
 *     tags:
 *       - Application
 *     description: Deletes an application by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application deleted successfully.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Failed to delete application.
 */
router.delete('/applications/:id', [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const deletedApp = await applicationService.deleteApplication(id, userId);
    res.status(200).json({ message: 'Application deleted successfully', application: deletedApp });
  } catch (error: any) {
    console.error("Delete application route error:", error);
    res.status(400).json({ message: error.message || 'Failed to delete application' });
  }
});

// --- Share Application ---

const shareApplicationSchema = z.object({
  body: z.object({
    applicationId: z.string({
      required_error: 'applicationId is required',
    }).min(1, { message: 'applicationId cannot be empty' }),
  }),
});

/**
 * @swagger
 * /apps/share:
 *   post:
 *     summary: Share an application (prepare central server payload)
 *     tags:
 *       - Application
 *     description: >
 *       Collects all units (pages, resources, enums, custom components) belonging
 *       to the application, builds the payload expected by the Central Collaboration
 *       Server, marks the application as shared locally, and returns the payload.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payload ready to be sent to central server.
 *       400:
 *         description: Bad request. Invalid input.
 *       401:
 *         description: Authentication failed.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Failed to share application.
 */
router.post('/apps/share', authenticateJWT, validate(shareApplicationSchema), async (req: Request, res: Response) => {
  const { applicationId } = req.body;
  const userId = req.user?.id;

  const result = await applicationService.shareApplication(applicationId, userId);
  res.status(200).json(result);
});

const inviteCollaboratorSchema = z.object({
  body: z.object({
    applicationId: z.string({
      required_error: 'applicationId is required',
    }).min(1, { message: 'applicationId cannot be empty' }),
    userId: z.string().min(1, { message: 'Collaborator userId is required' }),
    role: z.string().default('EDITOR'),
  }),
});

/**
 * @swagger
 * /apps/invite:
 *   post:
 *     summary: Invite a collaborator to a shared application
 *     tags:
 *       - Application
 *     description: Sends an invitation request to the central server for a specific user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicationId:
 *                 type: string
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Collaborator invited successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Failed to invite collaborator.
 */
router.post('/apps/invite', authenticateJWT, validate(inviteCollaboratorSchema), async (req: Request, res: Response) => {
  const { applicationId, userId, role } = req.body;
  const invited_by = req.user?.id;

  try {
    const result = await applicationService.inviteCollaborator(applicationId, { userId, role, invited_by });
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Invite collaborator route error:", error);
    res.status(400).json({ message: error.message || 'Failed to invite collaborator' });
  }
});

const syncApplicationSchema = z.object({
  body: z.object({
    applicationId: z.string({
      required_error: 'applicationId is required',
    }).min(1, { message: 'applicationId cannot be empty' }),
    comment: z.string().optional(),
  }),
});

/**
 * @swagger
 * /apps/sync:
 *   post:
 *     summary: Synchronize application changes with the central server
 *     tags:
 *       - Application
 *     description: Collects all local units and synchronizes with the central collaboration backend.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application synchronized successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Failed to sync application.
 */
router.post('/apps/sync', authenticateJWT, validate(syncApplicationSchema), async (req: Request, res: Response) => {
  const { applicationId, comment } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const omitUnits = req.query.omitUnits === 'true';
    const result = await applicationService.syncApplication(applicationId, userId, omitUnits, comment);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.status === 409) {
      return res.status(409).json(error.conflicts);
    }
    console.error("Sync route error:", error);
    res.status(500).json({ message: error.message || 'Failed to sync application' });
  }
});

const forceSyncSchema = z.object({
  body: z.object({
    applicationId: z.string({
      required_error: 'applicationId is required',
    }).min(1, { message: 'applicationId cannot be empty' }),
    unitIds: z.array(z.string()).min(1, { message: 'At least one unitId is required' }),
  }),
});

/**
 * @swagger
 * /apps/force-sync:
 *   post:
 *     summary: Forcefully synchronize specific application units
 *     tags:
 *       - Application
 *     description: Overwrites server-side changes with local versions for the specified units.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicationId:
 *                 type: string
 *               unitIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Application forcefully synchronized successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Failed to force-sync application.
 */
router.post('/apps/force-sync', authenticateJWT, validate(forceSyncSchema), async (req: Request, res: Response) => {
  const { applicationId, unitIds } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const result = await applicationService.forceSyncApplication(applicationId, userId, unitIds);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Force sync route error:", error);
    res.status(500).json({ message: error.message || 'Failed to force-sync application' });
  }
});

const syncToServerSchema = z.object({
  body: z.object({
    applicationId: z.string({
      required_error: 'applicationId is required',
    }).min(1, { message: 'applicationId cannot be empty' }),
    conflict_unit_ids: z.array(z.string()).min(1, { message: 'At least one conflict_unit_id is required' }),
  }),
});

/**
 * @swagger
 * /apps/syncToServer:
 *   post:
 *     summary: Synchronize specific conflicting units from the server
 *     tags:
 *       - Application
 *     description: Requests the central server for the latest versions of the specified units.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicationId:
 *                 type: string
 *               conflict_unit_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Sync successful.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Failed to sync from server.
 */
router.post('/apps/syncToServer', authenticateJWT, validate(syncToServerSchema), async (req: Request, res: Response) => {
  const { applicationId, conflict_unit_ids } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const result = await applicationService.syncToServer(applicationId, userId, conflict_unit_ids);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("SyncToServer route error:", error);
    res.status(500).json({ message: error.message || 'Failed to sync from server' });
  }
});

/**
 * @swagger
 * /apps/{id}/versions:
 *   get:
 *     summary: Fetch version history for a shared application
 *     tags:
 *       - Application
 *     description: Retrieves the list of historical versions for a shared application from the central backend.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of versions.
 *       500:
 *         description: Failed to fetch versions.
 */
router.get('/apps/:id/versions', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const versions = await applicationService.getApplicationVersions(id);
    res.status(200).json(versions);
  } catch (error: any) {
    console.error("Versions route error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch versions' });
  }
});

const rollbackSchema = z.object({
  body: z.object({
    version: z.string({
      required_error: 'version is required',
    }),
  }),
});

/**
 * @swagger
 * /apps/{id}/rollback:
 *   post:
 *     summary: Rollback a shared application to a specific version
 *     tags:
 *       - Application
 *     description: Requests a rollback to a historical version and updates local application state.
 *     parameters:
 *       - in: path
 *         name: id
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
 *               version:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rollback successful.
 *       500:
 *         description: Rollback failed.
 */
router.post('/apps/:id/rollback', authenticateJWT, validate(rollbackSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { version } = req.body;
  try {
    const result = await applicationService.rollbackApplication(id, version);
    res.status(200).json({ message: 'Rollback successful', result });
  } catch (error: any) {
    console.error("Rollback route error:", error);
    res.status(500).json({ message: error.message || 'Failed to perform rollback' });
  }
});

export = router;