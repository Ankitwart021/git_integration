import dotenv from 'dotenv';

dotenv.config();

// Define the host and port separately
const API_PROTOCOL = process.env.API_PROTOCOL || "http";
const API_HOSTNAME = process.env.SERVER_HOSTNAME || "localhost";
const API_PORT = process.env.SERVER_PORT || "8000";
const API_VERSION = process.env.API_VERSION || "v1";
const GENERATOR_BASE_URL = process.env.GENERATOR_URL || "http://localhost:8082/api";


const WORKFLOW_HOST = process.env.WORKFLOW_HOST || "localhost";
const WORKFLOW_PORT = process.env.WORKFLOW_PORT || "9000";
const WORKFLOW_BASE_URL = `${API_PROTOCOL}://${WORKFLOW_HOST}:${WORKFLOW_PORT}/api`;

// Construct the full base URL dynamically
const API_HOST = `${API_PROTOCOL}://${API_HOSTNAME}:${API_PORT}`;
const API_BASE_URL = `${API_HOST}/api`;
// const formatString=(input:string)=> {
//   return input
//     .replace(/_/g, ' ') // Temporarily replace '_' with space for easy manipulation
//     .replace(/(?:^|\s)(\w)/g, (_, c) => c.toUpperCase()) // Capitalize first and all letters after space
//     .replace(/\s+/g, ''); // Remove all spaces
// }
const formatString = (input: string): string => {
  return input.replace(/_([a-z])/g, (_, char) => char.toUpperCase()) // capitalize letter after _
              .replace(/^([a-z])/, (_, char) => char.toUpperCase()); // capitalize first letter if not already
};


const apiConfig = {
  API_PROTOCOL,   // HTTP or HTTPS
  API_HOSTNAME,   // Domain or IP (e.g., localhost, example.com)
  API_PORT,       // Port number
  API_VERSION,    // API version (e.g., v1, v2)
  GENERATOR_BASE_URL, // Generator base URL
  API_HOST,       // Full base host URL
  API_BASE_URL,   // Full API base URL
  WORKFLOW_BASE_URL,
  WORKFLOW_HOST,
  WORKFLOW_PORT,
  getResourceUrl: (resName: string) => `${API_BASE_URL}/${resName.toLowerCase()}`,
  getResourceMetaDataUrl: (resName: string) => `${API_BASE_URL}/getAllResourceMetaData/${formatString(resName)}`,
};

export default apiConfig;
