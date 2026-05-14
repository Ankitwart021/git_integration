import apiConfig from "../config/apiConfig";
import { getCookieValue } from "../utils/utils";

//  Fetch all applications
export const fetchApplications = async () => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/applications`, {
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

  if (!res.ok) throw new Error("Failed to fetch applications");
  const data = await res.json();
  return data.data;
};

// Create a new application
export const createApplication = async (name: string, description: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");
  let isShared = false;
  let remoteAppId = null;
  let baseVersion = 0;
  const res = await fetch(`${apiConfig.API_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ name, description, isShared, remoteAppId, baseVersion }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }

  if (!res.ok) throw new Error(`Error creating app: ${res.statusText}`);
  return await res.json();
};

// invite a collaborator
export const inviteCollaborator = async (applicationId: string, userId: string, role: string = 'EDITOR') => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/apps/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ applicationId, userId, role }),
  });

  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }

  if (!res.ok) {
    // const errorText = await res.text();
    // throw new Error(`Error inviting collaborator: ${errorText || res.statusText}`);
   const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.message || res.statusText;
    throw new Error(`${errorMessage}`);
  }
  
  return await res.json();
}

// delete an application
export const deleteApplication = async (id: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");
  const res = await fetch(`${apiConfig.API_BASE_URL}/applications/${id}`, {
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
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const errorMessage = errorData?.message || res.statusText;
    throw new Error(`${errorMessage}`);
  }
  return id;
}

// share an application
export const shareApplication = async (applicationId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");
  const res = await fetch(`${apiConfig.API_BASE_URL}/apps/share`, {
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
    const errorText = await res.text();
    throw new Error(`Error sharing app: ${errorText || res.statusText}`);
  }
  return await res.json();
}

// sync an application
export const syncApplication = async (applicationId: string, omitUnits: boolean = false, comment: string = '') => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const url = new URL(`${apiConfig.API_BASE_URL}/apps/sync`);
  if (omitUnits) url.searchParams.append("omitUnits", "true");

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ applicationId, comment }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) {
    if (res.status === 409) {
      const conflictData = await res.json();
      throw { status: 409, ...conflictData };
    }
    const errorText = await res.text();
    throw new Error(`Error syncing app: ${errorText || res.statusText}`);
  }
  return await res.json();
};

// sync specific conflicted units to server (pull latest server version)
export const syncToServer = async (applicationId: string, conflict_unit_ids: string[]) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");

  const res = await fetch(`${apiConfig.API_BASE_URL}/apps/syncToServer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ applicationId, conflict_unit_ids }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error syncing from server: ${errorText || res.statusText}`);
  }
  return await res.json();
};

// force sync application
export const forceSyncApplication = async (applicationId: string, unitIds: string[]) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");
  const res = await fetch(`${apiConfig.API_BASE_URL}/apps/force-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ applicationId, unitIds }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error performing force sync: ${errorText || res.statusText}`);
  }
  return await res.json();
};

// fetch application versions
export const fetchApplicationVersions = async (appId: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");
  const res = await fetch(`${apiConfig.API_BASE_URL}/apps/${appId}/versions`, {
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
  if (!res.ok) throw new Error(`Error fetching versions: ${res.statusText}`);
  return await res.json();
};

// rollback application
export const rollbackApplication = async (appId: string, version: string) => {
  const token = getCookieValue("jwt");
  if (!token) throw new Error("No JWT found in cookies!");
  const res = await fetch(`${apiConfig.API_BASE_URL}/apps/${appId}/rollback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ version }),
  });
  if (res.status === 401) {
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!res.ok) throw new Error(`Error performing rollback: ${res.statusText}`);
  return await res.json();
};
