
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";


// --- Helper: extract userId from JWT in cookies ---
const getUserIdFromJWT = (): string | null => {
  try {
    const token = Cookies.get("jwt"); // adjust cookie name if different
    if (!token) return null;
    
    const decoded: any = jwtDecode(token);
    console.log("all the resource but selected decoded",decoded)
    // assuming your token payload has "userId" or "sub" field
    return decoded.userId || decoded.sub || null;
  } catch {
    return null;
  }
};

interface ResourceStore {
  // userId → appId → resourceName → data[]
  resourcesValues: Record<string, Record<string, Record<string, any[]>>>;

  setResourcesValues: (appId:string,data: Record<string, any[]>) => void;
  setResourcesData: (appId:string,resourceName: string, data: any[]) => void;
  getResourcesData: (appId:string) => Record<string, any[]>;
  getSelectedResourceData: (appId:string,resourceName: string) => any[];
  clearResources: (appId:string) => void;
  clearUserResources: () => void;
}

export const useResourceStore = create<ResourceStore>()(
  persist(
    (set:any, get:any) => ({
      resourcesValues: {},

      // Replace all resources for current user + app
      setResourcesValues: (appId:any,data:any) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        if (!userId || !appId) return;

        set((state:any) => ({
          resourcesValues: {
            ...state.resourcesValues,
            [userId]: {
              ...(state.resourcesValues[userId] || {}),
              [appId]: data,
            },
          },
        }));
      },

      // Update one resource for current user + app
      setResourcesData: (appId:any,resourceName:any, data:any) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        console.log("all the resource but selected uid",userId)
        if (!userId || !appId) return;

        set((state:any) => ({
          resourcesValues: {
            ...state.resourcesValues,
            [userId]: {
              ...(state.resourcesValues[userId] || {}),
              [appId]: {
                ...(state.resourcesValues[userId]?.[appId] || {}),
                [resourceName]: data,
              },
            },
          },
        }));
      },

      // Get all resources for current user + app
      getResourcesData: (appId:any) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        if (!userId || !appId) return {};
        return get().resourcesValues[userId]?.[appId] || {};
      },

      // Get one specific resource for current user + app
      getSelectedResourceData: (appId:any,resourceName:any) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        console.log("appid userId", appId,userId)
        if (!userId || !appId) return [];
        return get().resourcesValues[userId]?.[appId]?.[resourceName] || [];
      },

      // Clear one app’s data for current user
      clearResources: (appId:any) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        if (!userId || !appId) return;

        set((state:any) => {
          const userResources = { ...(state.resourcesValues[userId] || {}) };
          delete userResources[appId];

          return {
            resourcesValues: {
              ...state.resourcesValues,
              [userId]: userResources,
            },
          };
        });
      },

      // Clear all apps for current user
      clearUserResources: () => {
        const userId = getUserIdFromJWT();
        if (!userId) return;

        set((state:any) => {
          const newState = { ...state.resourcesValues };
          delete newState[userId];
          return { resourcesValues: newState };
        });
      },
    }),
    {
      name: "resource-store", // persisted in localStorage
    }
  )
);
