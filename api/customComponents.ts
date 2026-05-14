import apiConfig from "../config/apiConfig";

export interface CustomComponent {
  id: string;
  userId: string;
  componentName: string;
  componentContent: JSON;
  createdAt: Date;
}

export interface CreateCustomComponentData {
  componentName: string;
  componentContent: JSON;
}

export interface UpdateCustomComponentData {
  componentName?: string;
  componentContent?: JSON;
}

// Fetch custom components for a user
export const fetchCustomComponents = async (
  userId: string
): Promise<CustomComponent[]> => {
  const res = await fetch(
    `${apiConfig.API_BASE_URL}/customComponents/${userId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!res.ok) throw new Error("Failed to fetch custom components");

  const data = await res.json();
  return data.data || [];
};

// Create new custom component
export const createCustomComponent = async (
  data: CreateCustomComponentData
): Promise<CustomComponent> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/customComponents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create custom component");
  }

  return response.json();
};

// Fetch custom component by ID
export const fetchCustomComponentById = async (id: string): Promise<CustomComponent> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/customComponents/component/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch custom component");
  }

  return response.json();
};

// Update custom component
export const updateCustomComponent = async (
  id: string,
  data: UpdateCustomComponentData
): Promise<CustomComponent> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/customComponents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update custom component");
  }

  return response.json();
};

// Delete custom component
export const deleteCustomComponent = async (id: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/customComponents/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete custom component");
  }

  return id;
};

