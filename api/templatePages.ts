import apiConfig from "../config/apiConfig";


export interface TemplatePageEntity {
  id: string;
  templateId: string;
  tpName: string;
  tpContent: JSON; // JSON content
}

export interface CreateTemplatePageData {
  templateId: string;
  tpName: string;
  tpContent: JSON;
}

export interface UpdateTemplatePageData {
  tpName?: string;
  tpContent?: JSON;
}

// Create new template page
export const createTemplatePage = async (data: CreateTemplatePageData): Promise<TemplatePageEntity> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create template page");
  }

  return response.json();
};

// Fetch all pages for a template
export const fetchTemplatePages = async (templateId: string): Promise<TemplatePageEntity[]> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/templates/${templateId}/pages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch template pages");
  }

  const data = await response.json();
  return data.data || [];
};

// Fetch template page by ID
export const fetchTemplatePageById = async (id: string): Promise<TemplatePageEntity> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-pages/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch template page");
  }

  return response.json();
};

// Update template page
export const updateTemplatePage = async (
  id: string,
  data: UpdateTemplatePageData
): Promise<TemplatePageEntity> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-pages/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update template page");
  }

  return response.json();
};

// Delete template page
export const deleteTemplatePage = async (id: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/template-pages/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete template page");
  }

  return id;
};


    

 