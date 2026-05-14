import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WorkflowRepository } from '../repository/WorkflowRepository';
import { WorkflowService } from '../services/WorkflowService';
import { SyncQueueService } from '../services/SyncQueueService';
import { SyncQueueRepository } from '../repository/SyncQueueRepository';
import { authenticateJWT, checkApplicationOwnership } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();
const workflowRepository = new WorkflowRepository(prisma);
const syncQueueRepository = new SyncQueueRepository(prisma);
const syncQueueService = new SyncQueueService(syncQueueRepository);
const workflowService = new WorkflowService(workflowRepository, syncQueueService);

/* ----------------------------------------------
   ZOD SCHEMAS
---------------------------------------------- */

// Create workflow
const createWorkflowSchema = z.object({
  body: z.object({
    workflowName: z.string().min(1, "Workflow name is required"),
    workflowData: z.any(), // flexible JSON
  }),
  params: z.object({
    applicationId: z.string().min(1, "Application ID is required"),
  }),
});

// Update workflow
const updateWorkflowSchema = z.object({
  body: z.object({
    workflowName: z.string().min(1).optional(),
    workflowData: z.any().optional(),
  }),
  params: z.object({
    applicationId: z.string().min(1),
    workflowId: z.string().min(1),
  }),
});

/* ----------------------------------------------
   CREATE WORKFLOW
---------------------------------------------- */
/**
 * @swagger
 * /:applicationId/workflows:
 *   post:
 *     summary: Create a workflow
 *     tags: [Workflow]
 *     description: Creates a workflow for the specified application.
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
 *               workflowName:
 *                 type: string
 *               workflowData:
 *                 type: object
 *     responses:
 *       201:
 *         description: Workflow created successfully.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Authentication failed.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/:applicationId/workflows",
  [authenticateJWT, checkApplicationOwnership],
  validate(createWorkflowSchema),
  async (req: Request, res: Response) => {
    try {
      const { applicationId } = req.params;
      const { workflowName, workflowData } = req.body;

      const newWorkflow = await workflowService.createWorkflow({
        workflowName,
        workflowData,
        applicationID: applicationId,
        generatedWorkflowIds: ''
      });

      res.status(201).json(newWorkflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/* ----------------------------------------------
   UPDATE WORKFLOW
---------------------------------------------- */
/**
 * @swagger
 * /:applicationId/workflows/{workflowId}:
 *   put:
 *     summary: Update an existing workflow
 *     tags: [Workflow]
 *     description: Update workflow details.
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *       - in: path
 *         name: workflowId
 *         required: true
 *     responses:
 *       200:
 *         description: Workflow updated successfully.
 *       404:
 *         description: Workflow not found.
 *       500:
 *         description: Internal server error.
 */
router.put(
  "/:applicationId/workflows/:workflowId",
  [authenticateJWT, checkApplicationOwnership],
  validate(updateWorkflowSchema),
  async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.params;
      const { workflowName, workflowData } = req.body;

      const updated = await workflowService.updateWorkflow(workflowId, {
        workflowName,
        workflowData,
      });

      res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating workflow:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/* ----------------------------------------------
   GET ALL WORKFLOWS FOR AN APPLICATION
---------------------------------------------- */
router.get(
  "/:applicationId/workflows",
  [authenticateJWT, checkApplicationOwnership],
  async (req: Request, res: Response) => {
    try {
      const { applicationId } = req.params;

      const workflows = await workflowService.getAllWorkflows(applicationId);
      res.status(200).json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/* ----------------------------------------------
   GET SINGLE WORKFLOW
---------------------------------------------- */
router.get(
  "/applications/:applicationId/workflows/:workflowId",
  [authenticateJWT, checkApplicationOwnership],
  async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.params;

      const workflow = await workflowService.getWorkflowById(workflowId);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      res.status(200).json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

/* ----------------------------------------------
   DELETE WORKFLOW
---------------------------------------------- */
router.delete(
  "/applications/:applicationId/workflows/:workflowId",
  [authenticateJWT, checkApplicationOwnership],
  async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.params;

      await workflowService.deleteWorkflow(workflowId);
      res.status(200).json({ message: "Workflow deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post("/applications/:applicationId/workflows/:workflowId/generate",
    [authenticateJWT, checkApplicationOwnership],
    async (req: Request, res: Response) => {
        try {
            const {workflowSpec } = req.body;
            if(workflowSpec){
                 const generatedWorkflow = await workflowService.generateWorkflow(workflowSpec,req.params.workflowId);
                return res.status(201).json(generatedWorkflow);
            }
            return res.status(201).json({});
        } catch (error) {
            console.error("Error creating workflow:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
)

router.get("/applications/:applicationId/workflows/:workflowId/spec",
    [authenticateJWT, checkApplicationOwnership],
    async (req: Request, res: Response) => {
        try {
            const { workflowId } = req.params;
            const workflowSpec = await workflowService.getWorkflowSpec(workflowId);
            return res.status(200).json(workflowSpec);
        } catch (error) {
            console.error("Error fetching workflow spec:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
)

export = router;

