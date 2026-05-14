import apiConfig from "../config/apiConfig";

export interface Template {
  id: string;
  userId?: string;
  templateName: string;
  description?: string;
  createdAt: Date;
}

export interface TemplatePage {
  id: string;
  templateId: string;
  tpName: string;
  tpContent: JSON;
}

export interface TemplateResource {
  id: string;
  templateId?: string;
  resourceName: string;
  resources: JSON;
}

export interface TemplateEnum {
  id: string;
  templateId?: string;
  enumName: string;
  createdAt: Date;
}

export interface CreateTemplateData {
  templateName: string;
  description?: string;
  pages?: Omit<TemplatePage, 'id' | 'templateId'>[];
  resources?: Omit<TemplateResource, 'id' | 'templateId'>[];
  enums?: Omit<TemplateEnum, 'id' | 'templateId' | 'createdAt'>[];
}

export interface UpdateTemplateData {
  templateName?: string;
  description?: string;
}

// Create new template
export const createTemplate = async (data: CreateTemplateData): Promise<Template> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create template");
  }

  return response.json();
};

// Fetch all templates for a user
export const fetchTemplates = async (): Promise<Template[]> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/templates`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch templates");
  }

  const data = await response.json();
  return data.data || [];
};

// Fetch template by ID with all related data
export const fetchTemplateById = async (id: string): Promise<{
  template: Template;
  pages: TemplatePage[];
  resources: TemplateResource[];
  enums: TemplateEnum[];
}> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/templates/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch template");
  }

  return response.json();
};

// Update template
export const updateTemplate = async (
  id: string,
  data: UpdateTemplateData
): Promise<Template> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update template");
  }

  return response.json();
};

// Delete template
export const deleteTemplate = async (id: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/templates/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete template");
  }

  return id;
};







 