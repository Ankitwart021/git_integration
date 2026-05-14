// AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Application } from '../components/Dashboard1';

// Define the shape of the context
interface AppContextType {
  allApps: Application[]; // List of all applications
  currentIndex: number ; // Index of the selected app
  setAllApps: (apps: Application[]) => void;
  setCurrentIndex: (index: number) => void;
  appName:string,
  setAppName:(appName:string)=>void
  resourcesValues:any[],
  setResourcesValues:(data:any[])=>void
  getResourcesData: (resName:any) => any;
  setResourcesData: (resName:any,data:any[]) => void;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [allApps, setAllApps] = useState<Application[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [appName, setAppName] = useState<string>('');
  const [resourcesValues, setResourcesValues] = useState<any>({});
  const getResourcesData = (resName:any) => {
    return resourcesValues[resName];
  }

  const setResourcesData = (resName:any,data:any) => {
    setResourcesValues((prev:any)=>({
        ...prev,
        [resName]: data,
      }));
  }
  return (
    <AppContext.Provider
      value={{
        allApps,
        currentIndex,
        setAllApps,
        setCurrentIndex,
        appName,
        setAppName,
        resourcesValues,
        setResourcesValues,
        getResourcesData,
        setResourcesData

      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
