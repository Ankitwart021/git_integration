import { CustomComponent } from "../components/Accordian";
import apiConfig from "../config/apiConfig";
import { getCookieValue } from "../utils/utils";


export const fetchCustomComponents = async (
  userId: string
): Promise<any> => {
  const token = getCookieValue("jwt");
  if (!token) {
    alert('No JWT found in cookies!');
    return;
  }
  const res = await fetch(
    `${apiConfig.API_BASE_URL}/customComponents`,
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // send JWT in header
      },
      credentials: "include",
    }
  );

  if(res.status === 401){
    window.location.href = apiConfig.LOGIN_URL;
  }

  if (!res.ok) throw new Error("Failed to fetch custom components");

  const data = await res.json();
  console.log("custom components data", data);
  return data.data || [];
};

export const fetchCustomComponentById = async (componentId: string) => {
  const token = getCookieValue("jwt");

  if (!token) {
    alert("No JWT found in cookies!");
    throw new Error("No JWT found in cookies!");
  }

  const res = await fetch(
    `${apiConfig.API_BASE_URL}/customComponents/component/${componentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  if(res.status === 401){
    window.location.href = apiConfig.LOGIN_URL;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch custom component: ${res.statusText}`);
  }

  const data = await res.json();
  console.log("Custom component fetched:", data);
  return data;
};


// create customComponent
export const createCustomComponent = async (backendDataToSend: any) => {
  const token = getCookieValue("jwt");

  if (!token) {
    alert("No JWT found in cookies!");
    throw new Error("No JWT found in cookies!");
  }

  const res = await fetch(
    `${apiConfig.API_BASE_URL}/customComponents`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(backendDataToSend),
      credentials: "include",
    }
  );

  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  
  if (!res.ok) {
    throw new Error(`Failed to create custom component: ${res.statusText}`);
  }

  const data = await res.json();
  console.log(" Custom component created:", data);
  return data;
};

export const deleteCustomComponent = async (componentId: string) => {
  const token = getCookieValue("jwt");

  if (!token) {
    alert("No JWT found in cookies!");
    throw new Error("No JWT found in cookies!");
  }

  const res = await fetch(
    `${apiConfig.API_BASE_URL}/customComponents/${componentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }

  if (!res.ok) {
    throw new Error(`Failed to delete custom component: ${res.statusText}`);
  }

  const data = await res.json();
  console.log("Custom component deleted:", data);
  return data;
};