import { WorkflowStateDataRepository } from "../repository/WorkflowStateDataRepository";

export class WorkflowStateDataService {
    private workflowStateDataRepository: WorkflowStateDataRepository;
    
    constructor(workflowStateDataRepository: WorkflowStateDataRepository) {
        this.workflowStateDataRepository = workflowStateDataRepository;
    }
    async createOrUpdate(workflowID: string, applicationID: string, nodes: any, edges: any) {
        return await this.workflowStateDataRepository.createOrUpdate(workflowID, applicationID, nodes, edges);
    }
    async findById(workflowID: string) {
        return await this.workflowStateDataRepository.findById(workflowID);
    }
    async findAll() {
        return await this.workflowStateDataRepository.findAll();
    }
    async findByWorkflowId(workflowID: string) {
        return await this.workflowStateDataRepository.findByWorkflowId(workflowID);
    }
}