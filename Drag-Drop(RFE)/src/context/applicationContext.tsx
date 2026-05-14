import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useNavSideBarStore } from '../store/useNavSideBar';


export interface Application {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  baseVersion?: number | string;
  isShared?: boolean;
  remoteAppId?: string;
}

export interface ApplicationData {
  id: string;
  applicationID: string;
  pageName: string;
  pageContent: {
    apis: object;
    cssData: Record<string, object>;
    htmlContent: string;
    loginPageId: number;
    componentMap: object;
  };
  createdAt: string;
}

interface ApplicationContextType {
  allApplications: Application[];
  setAllApplications: (apps: Application[]) => void;

  selectedAppData: ApplicationData[];
  setSelectedAppData: (resources: ApplicationData[]) => void;

  appName: string;
  setAppName: (name: string) => void;

  appDescription: string;
  setAppDescription: (desc: string) => void;

  selectedAppName: string;
  setSelectedAppName: (name: string) => void;

  selectedAppDescription: string;
  setSelectedAppDescription: (desc: string) => void;

}

const ApplicationContext = createContext<ApplicationContextType | undefined>(
  undefined
);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const setNavbarObj = useNavSideBarStore((state) => state.setNavbarObj)
  const setSidebarObj = useNavSideBarStore((state) => state.setSidebarObj)
  const getNavbarObj = useNavSideBarStore((state) => state.getNavbarObj)
  const getSidebarObj = useNavSideBarStore((state) => state.getSidebarObj)
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const { appId } = useParams()
  const [selectedAppData, setSelectedAppData] = useState<ApplicationData[]>([]);
  const [appName, setAppName] = useState<string>("");
  const [appDescription, setAppDescription] = useState<string>("");
  const [selectedAppName, setSelectedAppName] = useState<string>("");
  const [selectedAppDescription, setSelectedAppDescription] = useState<string>("");



  // const [resourcesValues, setResourcesValues] = useState<any>([]);
  // const [resourcesValues, setResourcesValues] = useState<any>({});

  //   const getResourcesData = () => {
  //   return resourcesValues;
  // };

  // const getSelectedResourceData = (resourceName: string) => {
  //   return resourcesValues[resourceName];
  // }

  // const setResourcesData = (resourceName: string, data: any) => {
  //   setResourcesValues((prev: any) => ({
  //     ...prev,
  //     [resourceName]: data,
  //   }));
  // };
  return (
    <ApplicationContext.Provider
      value={{
  
        allApplications,
        setAllApplications,
        selectedAppData,
        setSelectedAppData,
        appName,
        setAppName,
        appDescription,
        setAppDescription,
        selectedAppName,
        setSelectedAppName,
        selectedAppDescription,
        setSelectedAppDescription,

      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider"
    );
  }
  return context;
};
