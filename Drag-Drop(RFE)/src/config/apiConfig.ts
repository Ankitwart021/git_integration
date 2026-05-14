
// Define the host and port separately


// Construct the full base URL dynamically
const API_HOST = process.env.REACT_APP_NODEJS_BACKEND_URL ||`http://localhost:8000/`;
const API_BASE_URL = process.env.REACT_APP_NODEJS_BACKEND_URL 
    ? `${process.env.REACT_APP_NODEJS_BACKEND_URL}/api`:`http://localhost:8000/api`;
const LOGIN_URL = process.env.REACT_APP_NODEJS_BACKEND_URL 
    ? `${process.env.REACT_APP_NODEJS_BACKEND_URL}/auth/login` 
    : `http://localhost:8000/auth/login`;
const formatString = (input: string): string => {
  return input.replace(/_([a-z])/g, (_, char) => char.toUpperCase()) // capitalize letter after _
              .replace(/^([a-z])/, (_, char) => char.toUpperCase()); // capitalize first letter if not already
};


const apiConfig = {
  API_HOST,       // Full base host URL
  API_BASE_URL,
  LOGIN_URL,   // Full API base URL
  getResourceUrl: (resName: string) => `${API_BASE_URL}/${resName.toLowerCase()}`,
  getResourceMetaDataUrl: (resName: string) => `${API_BASE_URL}/getAllResourceMetaData/${formatString(resName)}`,
};

export default apiConfig;
