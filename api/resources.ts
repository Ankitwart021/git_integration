import apiConfig from "../config/apiConfig";

export interface Resource {
  id: string;
  applicationId: string;
  resourceName: string;
  attributes: JSON; // JSON content
}

export interface CreateResourceData {
  applicationId: string;
  resourceName: string;
  attributes: JSON;
}

export interface UpdateResourceData {
  resourceName: string;
  attributes: JSON;
}

export const fetchResources = async (applicationId: string) => {
  const response = await fetch(
    `${apiConfig.API_BASE_URL}/applications/${applicationId}/getResources`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!response.ok) throw new Error("Failed to fetch resources");

  return response.json();
};



export const deleteResource = async (
  applicationId: string,resourceId: string
): Promise<string> => {
  const response = await fetch(
    `${apiConfig.API_BASE_URL}/applications/${applicationId}/deleteResource/${resourceId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete resource");
  }

  return resourceId; // return deleted name
};

export const createResource = async (applicationId: string,data: {applicationId: string;resourceName: string;attributes: JSON;}): Promise<any> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/createResource`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create resource");
  }

  return response.json();
};

export const updateResource = async (applicationId: string,data: {
  resourceId: string;
  resourceName: string;
  attributes: JSON;}): Promise<any> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/updateResource/${data.resourceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ resourceName: data.resourceName, attributes: data.attributes }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update resource");
  }

  return response.json();
};

export const generateResource = async (applicationId: string): Promise<any> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/generateResource`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to generate resource");
  }

  return response.json();
};


