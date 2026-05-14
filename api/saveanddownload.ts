import apiConfig from "../config/apiConfig";
import { Application } from "./applications";
import { Page } from "./pages";

export interface SaveApplicationData {
    application: {
        name?: string;
        description?: string;
    };
    pages?: {
        id: string;
        pageName?: string;
        pageContent?: JSON;
    }[];
}

export interface SaveApplicationResponse {
    application: Application;
    pages: Page[];
}

export const saveApplication = async (
  id: string,
  data: SaveApplicationData
): Promise<SaveApplicationResponse> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/api/saveApp/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save application");
  }

  return response.json();
};

export interface DownloadData {
}

export const downloadApplication = async (
  id: string,
  data: DownloadData
): Promise<Blob> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/download/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to download application");
  }

  return response.blob();
};

export interface SaveAndDownloadData extends SaveApplicationData {
}

export const saveAndDownloadApplication = async (
  id: string,
  data: SaveAndDownloadData
): Promise<Blob> => {
  const response = await fetch(`${apiConfig.API_BASE_URL}/api/save-then-download/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to save and download application");
  }

  return response.blob();
};