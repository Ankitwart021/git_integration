import apiConfig from "../config/apiConfig";
import { getCookieValue } from "../utils/utils";

// Fetch pages for a specific app
export const fetchPagesByAppId = async (appId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/applications/${appId}/pages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error fetching pages for app ${appId}`);
  const data = await res.json();
  return data.data;
};

// Create default page for an app
export const createPage = async (applicationId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      applicationId,
      pageName: "Page1",
      pageContent: {
        html: "",
        cssData: {},
        componentMap: {},
        apis: {},
      },
    }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error("Error creating default page");
  return await res.json();
};

// Create a new page with a custom name
export const createNewPage = async (applicationId: string, pageName: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      applicationId,
      pageName,
      pageContent: {
        htmlContent: "",
        cssData: {},
        componentMap: {},
        apis: {},
      },
    }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Failed to create page: ${res.statusText}`);
  return await res.json();
};



// delete page by ID
export const deletePage = async (applicationId: string, pageId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");
  const res = await fetch(`${apiConfig.API_BASE_URL}/applications/${applicationId}/pages/${pageId}`, {
    method: "DELETE",
    headers: {  
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },

    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error deleting page ${pageId}`);
  return await res.json();
}
