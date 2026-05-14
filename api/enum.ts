import apiConfig from "../config/apiConfig";

export interface ApplicationEnum {
  id: string;
  applicationId: string;
  enumName: string;
  createdAt: Date;
  enums: JSON;
}

export interface CreateEnumData {
  applicationId: string;
  enumName: string;
  enums: JSON;
}

export interface UpdateEnumData {
  enumName: string;
  enums: JSON;
}
export const fetchEnums = async (applicationId: string) => {
  const response = await fetch(
    `${apiConfig.API_BASE_URL}/applications/${applicationId}/getEnums`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!response.ok) throw new Error("Failed to fetch enums");

  return response.json();
};





export const deleteEnum = async (applicationId: string,enumId: string): Promise<string> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/deleteEnum/${enumId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete enum");
  }

  return enumId;
};


// src/api/enums.ts

export const createEnum = async (applicationId: string,data: {
  applicationId: string;
  enumName: string;
  enums: JSON;
}): Promise<any> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/createEnum`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create enum");
  }

  return response.json();
};

export const updateEnum = async (applicationId: string,data: {
  enumId: string;
  enumName: string;
  enums: JSON;
}): Promise<any> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/updateEnum/${data.enumId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ enumName: data.enumName, enums: data.enums }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update enum");
  }

  return response.json();
};
