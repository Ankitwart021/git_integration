import apiConfig from "../config/apiConfig";

export interface TemplateEnumEntity {
  id: string;
  templateId?: string;
  enumName: string;
  createdAt: Date;
  enums: JSON;
}

export interface CreateTemplateEnumData {
  templateId?: string;
  enumName: string;
  enums: JSON;
}

export interface UpdateTemplateEnumData {
  enumName?: string;
  enums?: JSON;
}

// Create new template enum
export const createTemplateEnum = async (data: CreateTemplateEnumData): Promise<TemplateEnumEntity> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-enums`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create template enum");
  }

  return response.json();
};

// Fetch all enums for a template
export const fetchTemplateEnums = async (templateId: string): Promise<TemplateEnumEntity[]> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/templates/${templateId}/enums`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch template enums");
  }

  const data = await response.json();
  return data.data || [];
};

// Fetch template enum by ID
export const fetchTemplateEnumById = async (id: string): Promise<TemplateEnumEntity> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-enums/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch template enum");
  }

  return response.json();
};

// Update template enum
export const updateTemplateEnum = async (
  id: string,
  data: UpdateTemplateEnumData
): Promise<TemplateEnumEntity> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-enums/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update template enum");
  }

  return response.json();
};

// Delete template enum
export const deleteTemplateEnum = async (id: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-enums/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete template enum");
  }

  return id;
};