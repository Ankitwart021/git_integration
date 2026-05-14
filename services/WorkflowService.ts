import { Prisma, Workflow } from "@prisma/client";
import { NotFoundError } from "../src/errors/customErrors";
import { WorkflowRepository } from "../repository/WorkflowRepository";
import { SyncQueueService } from "./SyncQueueService";
import { computeContentHash } from "../utils/hashUtils";


export class WorkflowService {
    private readonly repository: WorkflowRepository;
    private readonly syncQueueService: SyncQueueService;

    constructor(repository: WorkflowRepository, syncQueueService: SyncQueueService) {
        this.repository = repository;
        this.syncQueueService = syncQueueService;
    }

    async createWorkflow(data: Prisma.WorkflowUncheckedCreateInput): Promise<Workflow> {
        // Compute hash of workflow data (if provided)
        let localHash: string | undefined;
        if (data.workflowData) {
            localHash = await computeContentHash(data.workflowData);
        }

        const workflow = await this.repository.create({
            ...data,
            ...(localHash && { localHash }),
        });

        // Enqueue sync for the newly created workflow
        await this.syncQueueService.enqueueSync(workflow.applicationID, 'WORKFLOW', workflow.id, 'CREATE');

        return workflow;
    }

    async getWorkflowById(id: string): Promise<Workflow> {
        const resource = await this.repository.findById(id);
        if (!resource) {
            throw new NotFoundError("Workflow not found");
        }
        return resource;
    }

    async getWorkflowsByApplicationId(applicationID: string): Promise<Workflow[]> {
        return this.repository.findByApplicationId(applicationID);
    }

    async getAllWorkflows(applicationID: string): Promise<Workflow[]> {
        return this.repository.findAll(applicationID);
    }

    async updateWorkflow(id: string, data: Prisma.WorkflowUpdateInput): Promise<Workflow> {
        // 1. Compute hash of workflow data (if provided)
        let localHash: string | undefined;
        if (data.workflowData) {
            localHash = await computeContentHash(data.workflowData);
        }

        // 2. Update the workflow (include localHash)
        const updatedWorkflow = await this.repository.update(id, {
            ...data,
            ...(localHash && { localHash }),
        });

        // 3. Enqueue sync (use applicationID from the updated record)
        await this.syncQueueService.enqueueSync(
            updatedWorkflow.applicationID, 'WORKFLOW', id, 'UPDATE'
        );

        return updatedWorkflow;
    }

    async deleteWorkflow(id: string): Promise<Workflow> {
        return this.repository.delete(id);
    }
    async generateWorkflow(workflowSpec: any,workflowId:string): Promise<any> {
        return this.repository.generateWorkflow(workflowSpec,workflowId);
    }
    async getWorkflowSpec(workflowID: string): Promise<any> {
        return this.repository.getWorkflowSpec(workflowID);
    }
}