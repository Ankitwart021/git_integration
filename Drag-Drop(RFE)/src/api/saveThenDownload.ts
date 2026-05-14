import { getCookieValue } from "../utils/utils";
import apiConfig from "../config/apiConfig";

/**
 * Save the app JSON and download the ZIP in a single call
 */
export const saveThenDownloadApp = async (appId: string, appjson: any) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const response = await fetch(`${apiConfig.API_BASE_URL}/save-then-download/${appId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appjson),
    credentials: "include",
  });
  if (response.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok)
    throw new Error(`Failed to save & download app: ${response.statusText}`);
  return response;
};
