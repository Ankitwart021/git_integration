import { createOrUpdateNodeConfig, deleteNodeConfig, getNodeConfig } from "../api/nodeConfig";
export class WorkflowNodeRepository {
    async CreateOrUpdateNodeConfig(nodeId:string,nodeConfig: any): Promise<any> {
        try {
            const data = await createOrUpdateNodeConfig(nodeId,nodeConfig);
            return data;
        }
        catch(Error){
            console.log(Error);
            throw Error;
        }
    };

    async deleteNodeConfig(id:string) {
        try {
            const data = await deleteNodeConfig(id);
            return data;
        }
        catch(Error){
            console.log(Error);
            throw Error;
        }
    };
    
    async getNodeConfig(id:string) {
        try {
            const data = await getNodeConfig(id);
            return data;
        }
        catch(Error){
            console.log(Error);
            throw Error;
        }
    };
}
