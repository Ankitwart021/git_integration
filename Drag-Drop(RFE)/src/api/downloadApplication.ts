import { getCookieValue } from "../utils/utils";
import apiConfig from "../config/apiConfig";

/**
 * Download the application ZIP from backend
 */
export const downloadApp = async (appId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const response = await fetch(`${apiConfig.API_BASE_URL}/download/${appId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  if (response.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok) throw new Error(`Failed to download app: ${response.statusText}`);
  return response;
};
