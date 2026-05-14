import apiConfig from "../config/apiConfig";
import { getCookieValue } from "../utils/utils";

export const generateFullAppZip = async (applicationId: string): Promise<Blob> => {
  const url = `${apiConfig.API_BASE_URL}/generateApp/${applicationId}`;

  // Assumes the token is stored and accessible, e.g., in localStorage
  const token = getCookieValue('jwt');
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json', // Even if no body, it's good practice
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Attempt to parse as JSON for more structured error info
    try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Failed to generate backend app: ${errorJson.error || errorText}`);
    } catch(e) {
        throw new Error(`Failed to generate backend app: ${errorText}`);
    }
  }

  return response.blob();
};
