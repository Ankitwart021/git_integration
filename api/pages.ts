import apiConfig from "../config/apiConfig";


export interface Page {
  id: string;
  applicationId: string;
  pageName: string;
  pageContent: JSON; // JSON content
  createdAt: Date;
}

export interface CreatePageData {
  applicationId: string;
  pageName: string;
  pageContent: JSON;
}

export interface UpdatePageData {
  pageName?: string;
  pageContent?: JSON;
}

// Create new page
export const createPage = async (applicationId: string,data: CreatePageData): Promise<Page> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create page");
  }

  return response.json();
};

// Fetch all pages for an application
export const fetchPages = async (applicationId: string): Promise<Page[]> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/pages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch pages");
  }

  const data = await response.json();
  return data.data || [];
};

// Fetch page by ID
export const fetchPageById = async (applicationId: string,id: string): Promise<{ pageContent: JSON }> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/pages/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch page");
  }

  return response.json();
};

// Update page
export const updatePage = async (applicationId: string,id: string,data: UpdatePageData): Promise<Page> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/pages/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update page");
  }

  return response.json();
};

// Delete page
export const deletePage = async (applicationId: string,id: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/pages/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete page");
  }

  return response.json();
};

 