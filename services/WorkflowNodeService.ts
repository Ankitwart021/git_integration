import { WorkflowNodeRepository } from "../repository/WorkflowNodeRepository";


export class WorkflowNodeService {
     private readonly repository: WorkflowNodeRepository;
    
        constructor(repository: WorkflowNodeRepository) {
            this.repository = repository;
        }
            
        async createOrUpdateNodeConfig(nodeId:string,nodeConfig: any) {
            return this.repository.CreateOrUpdateNodeConfig(nodeId,nodeConfig);
        }

        async deleteNodeConfig(id:string) {
            return this.repository.deleteNodeConfig(id);
        }

        async getNodeConfig(id:string) {
            return this.repository.getNodeConfig(id);
        }
}