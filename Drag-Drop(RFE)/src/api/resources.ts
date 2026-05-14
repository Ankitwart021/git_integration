import apiConfig from "../config/apiConfig";
import { getCookieValue } from "../utils/utils";
export const fetchResources = async (appId: any) => {
  const token = getCookieValue("jwt");
  if (!token) {
    alert('No JWT found in cookies!');
    return;
  }
  const response = await fetch(
    `${apiConfig.API_BASE_URL}/applications/${appId}/getResources`,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // send JWT in header
      },
      credentials: "include",
    }
  );
  if (response.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }

  if (!response.ok) throw new Error("Failed to fetch resources");

  return response.json();
};

export const deleteResource = async (appId: string, resourceId: string): Promise<any> => {
  const token = getCookieValue("jwt");
  if (!token) {
    alert('No JWT found in cookies!');
    return;
  }
  const response = await fetch(
    `${apiConfig.API_BASE_URL}/applications/${appId}/deleteResource/${resourceId}`,
    {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // send JWT in header
      },
      credentials: "include",
    }
  );
  if (response.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok) {
    throw new Error("Failed to delete resource");
  }

  return resourceId; // return deleted name
};

export const saveResource = async (data: {
  // applicationName: string;
  applicationId: string;
  resourceName: string;
  attributes: {
    resource: string;
    fieldValues: any;
  };
}): Promise<any> => {
  const token = getCookieValue("jwt");
  if (!token) {
    alert('No JWT found in cookies!');
    return;
  }
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${data.applicationId}/createResource`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // send JWT in header
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (response.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save resource");
  }

  return response.json();
};
export const updateResource = async (data: {
  applicationId: string;
  resourceId: string;
  resourceName: string;
  attributes: {
    resource: string;
    fieldValues: any;
  };
}): Promise<any> => {
  const token = getCookieValue("jwt");
  if (!token) {
    alert('No JWT found in cookies!');
    return;
  }
  // const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${data.applicationId}/updateResource/${data.resourceId}`, {

  console.log("resource data for update", data)
  const response = await fetch(`${apiConfig.API_BASE_URL}/applications/${data.applicationId}/updateResource/${data.resourceId}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // send JWT in header
    },
    credentials: "include",
    body: JSON.stringify({
      resourceName: data.resourceName,
      attributes: data.attributes,
    }),
  });
  if (response.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save resource");
  }

  return response.json();
};

//  Generate resource for an app
export const generateResource = async (applicationId: string | undefined) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/generateResource`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ applicationId }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to generate resource: ${errText}`);
  }

  const data = await res.json();
  return data; // { message: "path/to/generated/resource" }
};
