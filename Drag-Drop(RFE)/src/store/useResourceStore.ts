
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

  selectedResourceForEdit:any;
  setSelectedResourceForEdit:(resName:any)=>void;
  getSelectedResourceForEdit:()=>any;
  resourcesValues: Record<string, Record<string, Record<string, any[]>>>;
  addDataToResource: (appId:string,resourceName: string, data: any) => void;
  setResourcesValues: (appId:string,data: Record<string, any[]>) => void;
  setResourcesData: (appId:string,resourceName: string, data: any[]) => void;
  updateDataToResource: (appId:string,resourceName: string, data: any) => void;
  getResourcesData: (appId:string) => Record<string, any[]>;
  getSelectedResourceData: (appId:string,resourceName: string) => any[];
  
  clearResources: (appId:string) => void;
  clearUserResources: () => void;
}

export const useResourceStore = create<ResourceStore>()(
  persist(
    (set, get) => ({
      resourcesValues: {},
      selectedResourceForEdit:{},


      setSelectedResourceForEdit:(res:any)=>{
      
        set((state)=>({
          selectedResourceForEdit:res
        }))
      },
      getSelectedResourceForEdit:()=>{
        return get().selectedResourceForEdit;
      },
      clearSelectedResourceEntry:()=>{
        set((state)=>({
          selectedResourceForEdit:{}
        }))
      },
      // Replace all resources for current user + app
      setResourcesValues: (appId,data) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        if (!userId || !appId) return;

        set((state) => ({
          resourcesValues: {
            ...state.resourcesValues,
            [userId]: {
              ...(state.resourcesValues[userId] || {}),
              [appId]: data,
            },
          },
        }));
      },

      //update particular resource data, by passsing one data object
      updateDataToResource: (appId:any,resourceName:any, data:any) => {
        const userId = getUserIdFromJWT();
        if (!userId || !appId || !resourceName) return;
        set((state) => {
          const userData = state.resourcesValues[userId] || {};
          const appData = userData[appId] || {};
          const resourceArray = appData[resourceName] || [];  
          const updatedResourceArray = resourceArray.map((item) =>
            item.id === data.id ? { ...item, ...data } : item
          );
          return {
            resourcesValues: {
              ...state.resourcesValues,
              [userId]: {
                ...userData,
                [appId]: {
                  ...appData,
                  [resourceName]: updatedResourceArray,
                },
              },
            },
          };
        });
      },

addDataToResource: (appId, resourceName, data) => {
  const userId = getUserIdFromJWT();
  if (!userId || !appId || !resourceName) return;

  set((state) => {
    const userData = state.resourcesValues[userId] || {};
    const appData = userData[appId] || {};
    const resourceArray = appData[resourceName] || [];

    return {
      resourcesValues: {
        ...state.resourcesValues,
        [userId]: {
          ...userData,
          [appId]: {
            ...appData,
            [resourceName]: [
              ...resourceArray,
              { ...data }, // ✅ JUST APPEND OBJECT
            ],
          },
        },
      },
    };
  });
},
      // Update one resource for current user + app
      setResourcesData: (appId,resourceName, data) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        console.log("all the resource but selected uid",userId)
        if (!userId || !appId) return;

        set((state) => ({
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
      getResourcesData: (appId) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        if (!userId || !appId) return {};
        return get().resourcesValues[userId]?.[appId] || {};
      },

      // Get one specific resource for current user + app
      getSelectedResourceData: (appId,resourceName) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        console.log("appid userId", appId,userId)
        if (!userId || !appId) return [];
        return get().resourcesValues[userId]?.[appId]?.[resourceName] || [];
      },
      //Get Enum values of an Enum for resource

      

      // Clear one app’s data for current user
      clearResources: (appId) => {
        const userId = getUserIdFromJWT();
        // const appId = getAppIdFromUrl();
        if (!userId || !appId) return;

        set((state) => {
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

        set((state) => {
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
