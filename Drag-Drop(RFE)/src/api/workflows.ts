import apiConfig from "../config/apiConfig";
import { getCookieValue } from "../utils/utils";

//  Fetch all workflows
export const fetchWorkflows = async (applicationId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/${applicationId}/workflows`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }

  if (!res.ok) throw new Error("Failed to fetch workflows");
  const data = await res.json();
  return data;
};

// Create a new workflow
export const createWorkflow = async (applicationId: string, workflowName: string, workflowData: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/${applicationId}/workflows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ workflowName, workflowData }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  
  if (!res.ok) throw new Error(`Error creating app: ${res.statusText}`);
  return await res.json();
};

export const updateWorkflow = async (applicationId: string, workflowId: string, workflowName: string, workflowData: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/${applicationId}/workflows/${workflowId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ workflowName, workflowData }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error updating app: ${res.statusText}`);
  return await res.json();
};

// delete a workflow
export const deleteWorkflow = async (applicationId: string, workflowId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");
  const res = await fetch(`${apiConfig.API_BASE_URL}/${applicationId}/workflows/${workflowId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error deleting app: ${res.statusText}`);
  return workflowId ;
}

export const generateWorkflow = async (applicationId: string, workflowId: string, workflowSpec: any) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/workflows/${workflowId}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({workflowSpec}),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error generating app: ${res.statusText}`);
  return await res.json();
}

export const fetchWorkflowInstance = async (workflowId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/${workflowId}/instance`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error fetching app: ${res.statusText}`);
  return await res.json();
}

export const updateNodeConfig = async (applicationId: string, workflowId: string, nodeId: string, nodeConfig: any) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res =  await fetch(`${apiConfig.API_BASE_URL}/${applicationId}/workflows/${workflowId}/nodeConfigs`, {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({nodeId, nodeConfig}),
        credentials: "include",
      });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error updating app: ${res.statusText}`);
  return await res.json();
}

export const getNodeConfig = async (applicationId: string, workflowId: string, nodeId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/${applicationId}/workflows/${workflowId}/nodeConfigs/${nodeId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`},
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error fetching app: ${res.statusText}`);
  return await res.json();
}

export const getWorkflowSpec = async (applicationId: string, workflowId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/workflows/${workflowId}/spec`, {
    method: "GET",
    headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`},
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error fetching app: ${res.statusText}`);
  return await res.json();
}

export const getWorkflowStateData = async (applicationId: string, workflowId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/${applicationId}/workflows/${workflowId}/workflowStateData`, {
    method: "GET",
    headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`},
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error fetching app: ${res.statusText}`);
  return await res.json();
}

export const updateWorkflowStateData = async (applicationId: string, workflowId: string, nodes: any, edges: any) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/${applicationId}/workflows/${workflowId}/workflowStateData`, {
    method: "POST",
    headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`},
    credentials: "include",
    body: JSON.stringify({nodes, edges}),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error updating app: ${res.statusText}`);
  return await res.json();
}

