import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WorkflowNodeRepository } from '../repository/WorkflowNodeRepository';
import { WorkflowNodeService } from '../services/WorkflowNodeService';
import { authenticateJWT, checkApplicationOwnership } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = express.Router();
const workflowNodeService = new WorkflowNodeService(new WorkflowNodeRepository());

/* ----------------------------------------------
   ZOD SCHEMAS
----------------------------------------------- */

// Create node config
const createNodeConfigSchema = z.object({
  body: z.object({
    nodeId: z.string().min(1),
    nodeConfig: z.any().optional(),
  }),
});

// Update node config
const updateNodeConfigSchema = z.object({
  body: z.object({
    nodeConfig: z.any().optional(),
  }),
  params: z.object({
    nodeId: z.string().min(1),
  }),
});

/* ----------------------------------------------
   CREATE NODE CONFIG
----------------------------------------------- */
router.post(
  "/:applicationId/workflows/:workflowId/nodeConfigs",
  [authenticateJWT, checkApplicationOwnership],
  validate(createNodeConfigSchema),
  async (req: Request, res: Response) => {
    try {
      const { nodeId, nodeConfig } = req.body;

      const newNodeConfig = await workflowNodeService.createOrUpdateNodeConfig(nodeId, nodeConfig);

      res.status(201).json(newNodeConfig);
    } catch (error) {
      console.error("Error creating node config:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


/* ----------------------------------------------
   GET ALL NODE CONFIGS
----------------------------------------------- */
router.get(
  "/:applicationId/workflows/:workflowId/nodeConfigs/:nodeId",
  [authenticateJWT, checkApplicationOwnership],
  async (req: Request, res: Response) => {
    try {
      const { nodeId } = req.params;

      const nodeConfig = await workflowNodeService.getNodeConfig(nodeId);
      res.status(200).json(nodeConfig);
    } catch (error) {
      console.error("Error fetching node configs:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);



/* ----------------------------------------------
   DELETE NODE CONFIG
----------------------------------------------- */
router.delete(
  "/:applicationId/workflows/:workflowId/nodeConfigs/:nodeId",
  [authenticateJWT, checkApplicationOwnership],
  async (req: Request, res: Response) => {
    try {
      const { nodeId } = req.params;

      await workflowNodeService.deleteNodeConfig(nodeId);
      res.status(200).json({ message: "Node config deleted successfully" });
    } catch (error) {
      console.error("Error deleting node config:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
