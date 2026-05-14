import apiConfig from "../config/apiConfig";
export const generateWorkflow = async (workflowSpec: any): Promise<any> => {
    try{
    const response = await fetch(`${apiConfig.WORKFLOW_BASE_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ workflow_spec: workflowSpec }),
    });
    const data = await response.json();
    return data;
    }catch(error){
        console.log(error);
        throw error;
    }
};

export const getWorkflowSpec = async (workflowID: string): Promise<any> => {
    try{
    const response = await fetch(`${apiConfig.WORKFLOW_BASE_URL}/workflowSpec/${workflowID}`);
    const data = await response.json();
    return data;
    }catch(error){
        console.log(error);
        throw error;
    }
};