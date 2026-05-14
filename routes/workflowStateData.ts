import { Router, Request, Response } from "express";
import { WorkflowStateDataService } from "../services/WorkflowStateDataService";
import { PrismaClient } from "@prisma/client";
import { WorkflowStateDataRepository } from "../repository/WorkflowStateDataRepository";
import { authenticateJWT, checkApplicationOwnership } from "../middleware/auth";


const router = Router();
const prisma = new PrismaClient();
const workflowStateDataRepository = new WorkflowStateDataRepository(prisma);
const workflowStateDataService = new WorkflowStateDataService(workflowStateDataRepository);

router.post("/:applicationId/workflows/:workflowId/workflowStateData", [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
    const { applicationId, workflowId } = req.params;
    const { nodes, edges } = req.body;
    await workflowStateDataService.createOrUpdate(workflowId, applicationId, nodes, edges);
    res.status(200).json({ message: "Workflow state data created successfully" });
});

router.get("/:applicationId/workflows/:workflowID/workflowStateData", [authenticateJWT, checkApplicationOwnership], async (req: Request, res: Response) => {
    const { workflowID } = req.params;
    const workflowStateData = await workflowStateDataService.findByWorkflowId(workflowID);
    res.status(200).json(workflowStateData);
});

export default router;
