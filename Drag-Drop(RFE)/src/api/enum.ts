import apiConfig from "../config/apiConfig";
import { getCookieValue } from "../utils/utils";

export const fetchEnums = async (appId: string | undefined) => {
  const token = getCookieValue("jwt");
  if (!token) {
    alert('No JWT found in cookies!');
    return;
  }
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${appId}/getEnums`,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // send JWT in header
      },
      credentials: "include",
    }
  );
  if(response.status === 401){
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok) throw new Error("Failed to fetch enums");

  return response.json();
};

// src/api/enums.ts

export const deleteEnum = async (appId: string, enumId: string, enumName: string): Promise<any> => {
  const token = getCookieValue("jwt");
  if (!token) {
    alert('No JWT found in cookies!');
    return;
  }
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${appId}/deleteEnum/${enumId}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // send JWT in header
    },
    credentials: "include",
  });
  if (response.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok) {
    throw new Error("Failed to delete enum");
  }

  return enumName;
};


// src/api/enums.ts

export const saveEnum = async (data: {
  // applicationName: string;
  applicationId: string | undefined;
  enumName: string;
  enums: {
    enum_name: string;
    fieldValues: any;
  };
}): Promise<any> => {
  const token = getCookieValue("jwt");
  if (!token) {
    alert('No JWT found in cookies!');
    return;
  }
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${data.applicationId}/createEnum`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // send JWT in header
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if(response.status === 401){
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save enum");
  }

  return response.json();
};
export const updateEnum = async (data: {
  applicationId: string;
  enumId: string;
  enumName: string;
  enums: {
    enum_name: string;
    fieldValues: any;
  };
}): Promise<any> => {
  const token = getCookieValue("jwt");
  if (!token) {
    alert('No JWT found in cookies!');
    return;
  }
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${data.applicationId}/updateEnum/${data.enumId}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // send JWT in header
    },
    credentials: "include",
    body: JSON.stringify({enumName: data.enumName, enums: data.enums }),
  });
  if(response.status === 401){
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save enum");
  }

  return response.json();
};
