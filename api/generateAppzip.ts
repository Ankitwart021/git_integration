import apiConfig from "../config/apiConfig";

export const generateFullAppZip = async (applicationId: string): Promise<Blob> => {
  const url = `${apiConfig.API_HOST}/api/generateApp/${applicationId}`;

  // Assumes the token is stored and accessible, e.g., in localStorage
  const token = localStorage.getItem('token');
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
        throw new Error(`Failed to generate full app: ${errorJson.error || errorText}`);
    } catch(e) {
        throw new Error(`Failed to generate full app: ${errorText}`);
    }
  }

  return response.blob();
};
