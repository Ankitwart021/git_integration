import apiConfig from "../config/apiConfig";

export interface Application {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface CreateApplicationData {
  name: string;
  description?: string;
}

export interface UpdateApplicationData {
  name?: string;
  description?: string;
}

// Create new application
export const createApplication = async (data: CreateApplicationData): Promise<Application> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create application");
  }

  return response.json();
};

// Fetch all applications
export const fetchApplications = async (): Promise<Application[]> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  const data = await response.json();
  return data.data || [];
};

// Fetch application by ID
export const fetchApplicationById = async (id: string): Promise<Application> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch application");
  }

  return response.json();
};

// Update application
export const updateApplication = async (
  id: string,
  data: UpdateApplicationData
): Promise<Application> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update application");
  }

  return response.json();
};

// Delete application
export const deleteApplication = async (id: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete application");
  }

  return id;
}; 