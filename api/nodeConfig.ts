import apiConfig from "../config/apiConfig";

// ------------------------------
// GET NODE CONFIG
// ------------------------------
export const getNodeConfig = async (nodeId: string): Promise<any> => {
    try {
        const response = await fetch(
            `${apiConfig.WORKFLOW_BASE_URL}/workflow/nodeConfigs/${nodeId}`
        );

        return await response.json();
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// ------------------------------
// CREATE / UPDATE NODE CONFIG
// ------------------------------
// nodeConfig MUST be an array → "properties"
export const createOrUpdateNodeConfig = async (
    nodeId: string,
    properties: any[]
): Promise<any> => {
    try {
        const response = await fetch(
            `${apiConfig.WORKFLOW_BASE_URL}/workflow/nodeConfigs`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nodeId,
                    properties,   // must be named `properties`
                }),
            }
        );

        return await response.json();
    } catch (error) {
        console.log(error);
        throw error;
    }
};

// ------------------------------
// DELETE NODE CONFIG
// ------------------------------
export const deleteNodeConfig = async (nodeId: string): Promise<any> => {
    try {
        const response = await fetch(
            `${apiConfig.WORKFLOW_BASE_URL}/workflow/nodeConfigs/${nodeId}`,
            {
                method: "DELETE",
            }
        );

        return await response.json();
    } catch (error) {
        console.log(error);
        throw error;
    }
};
