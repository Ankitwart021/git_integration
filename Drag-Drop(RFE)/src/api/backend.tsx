import apiConfig from "../config/apiConfig";
// import { User } from "../context/LoginContext";

export type User = {
  username: string;
  password: string;
};

export type UserRegistration = {
  newUsername: string;
  newPassword: string;
  newFirstName: string;
  newLastName: string;
  newEmail: string;
  adminUsername: string;
  adminPassword: string;
  resource: string;

  user_name: string;
  user_email: string;
};
export const login = async (user: User) => {
  try {
    const { username, password } = user;
    const params = new URLSearchParams({
      username: username,
      password: password,
    });

    const response = await fetch(
      `${apiConfig.API_BASE_URL}/auth/login?${params.toString()}`,
      {
        method: "GET",
        credentials: "include", // important to receive cookies from backend
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Optional: extract cookies if needed
    const cookies = document.cookie;
    console.log("Cookies received:", cookies);

    // Optional: handle body if server also returns JSON
    const data = await response.json();
    console.log("Login response body:", data);

    return true; // or return any meaningful info
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};

export const registration = async (user:UserRegistration) => {
  try {
    // const {} = user;
    const params = new URLSearchParams({
      newUsername: user.newUsername,
      newPassword: user.newPassword,
      newFirstName: user.newFirstName,
      newLastName: user.newLastName,
      newEmail: user.newEmail,
      adminUsername: user.adminUsername,
      adminPassword: user.adminPassword,
      resource: user.resource,
    });
    const userToSave = {
      "user_name": user.user_name,
      "user_email": user.newEmail,
    };

    const response = await fetch(
      `${apiConfig.API_BASE_URL}/auth/add_user?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userToSave),
        credentials: "include", // important to receive cookies from backend
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Optional: handle body if server also returns JSON
    // const data = await response.json();
    // console.log("Registration response body:", data);
    console.log("Registration successful");
    return true; // or return any meaningful info
  } catch (error) {
    console.error("Registration failed:", error);
    return false;
  }
};

export const assignClientRole = async (role: string) => {
  try {
    const params = new URLSearchParams({
      roleName: role,
    });

    const response = await fetch(
      `${apiConfig.API_BASE_URL}/auth/add-client-role?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important to receive cookies from backend
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Optional: handle body if server also returns JSON
    // const data = await response.json();
    console.log("Role Assigned successfully");

    return true; // or return any meaningful info
  } catch (error) {
    console.error("Assign Role failed:", error);
    return false;
  }
};

export const userResourceRoleMapping = async (data: any) => {
  try {
    const params = new URLSearchParams({
      role: data.role,
      userName: data.userName,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
    });

    const response = await fetch(
      `${apiConfig.API_BASE_URL}/auth/user_resource_role?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important to receive cookies from backend
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Optional: handle body if server also returns JSON
    // const data = await response.json();
    console.log("User Resource Role Mapping successful");

    return true; // or return any meaningful info
  } catch (error) {
    console.error("User Resource Role Mapping failed:", error);
    return false;
  }
};
