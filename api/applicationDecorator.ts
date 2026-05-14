import apiConfig from "../config/apiConfig";

export interface ApplicationDecorator {
  id: string;
  applicationId: string;
  decoratorName: string;
  decoratorAttributes: JSON; // JSON content
}

export interface CreateApplicationDecoratorData {
  applicationId: string;
  decoratorName: string;
  decoratorAttributes: JSON;
}

export interface UpdateApplicationDecoratorData {
  decoratorName?: string;
  decoratorAttributes?: JSON;
}

// Create new application decorator
export const createApplicationDecorator = async (data: CreateApplicationDecoratorData): Promise<ApplicationDecorator> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/application-decorators`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create application decorator");
  }

  return response.json();
};

// Fetch application decorator by ID
export const fetchApplicationDecoratorById = async (id: string): Promise<ApplicationDecorator> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/application-decorators/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch application decorator");
  }

  return response.json();
};

// Update application decorator
export const updateApplicationDecorator = async (
  id: string,
  data: UpdateApplicationDecoratorData
): Promise<ApplicationDecorator> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/application-decorators/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update application decorator");
  }

  return response.json();
};

// Delete application decorator
export const deleteApplicationDecorator = async (id: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/application-decorators/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete application decorator");
  }

  return id;
};
