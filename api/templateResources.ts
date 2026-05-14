import apiConfig from "../config/apiConfig";


export interface TemplateResourceEntity {
  id: string;
  templateId?: string;
  resourceName: string;
  resources: JSON; // JSON content
}

export interface CreateTemplateResourceData {
  templateId?: string;
  resourceName: string;
  resources: JSON;
}

export interface UpdateTemplateResourceData {
  resourceName?: string;
  resources?: JSON;
}

// Create new template resource
export const createTemplateResource = async (data: CreateTemplateResourceData): Promise<TemplateResourceEntity> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-resources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create template resource");
  }

  return response.json();
};

// Fetch all resources for a template
export const fetchTemplateResources = async (templateId: string): Promise<TemplateResourceEntity[]> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/templates/${templateId}/resources`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch template resources");
  }

  const data = await response.json();
  return data.data || [];
};

// Fetch template resource by ID
export const fetchTemplateResourceById = async (id: string): Promise<TemplateResourceEntity> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-resources/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch template resource");
  }

  return response.json();
};

// Update template resource
export const updateTemplateResource = async (
  id: string,
  data: UpdateTemplateResourceData
): Promise<TemplateResourceEntity> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-resources/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update template resource");
  }

  return response.json();
};

// Delete template resource
export const deleteTemplateResource = async (id: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-resources/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete template resource");
  }

  return id;
};







 