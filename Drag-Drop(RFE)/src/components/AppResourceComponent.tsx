/**
 * AppResourceComponent
 * --------------------
 *
 * What it does:
 *  - Provides a UI for managing application resources and enums (enumerations).
 *  - Allows users to create, edit, and delete resources and enums for the selected app.
 *  - Displays lists of resources and enums, and lets users define their attributes.
 *  - Integrates with ag-Grid to show and edit resource data in a table format.
 *  - Uses React Query for fetching, saving, and deleting resources/enums from the backend.
 *  - Handles modal dialogs for adding/editing resource and enum attributes.
 *  - Shows toast notifications for user feedback on actions.
 *
 * Where it is used:
 *  - Used as a route in src/App.tsx at path '/:appName/resources'.
 *  - It appears as the main content for managing resources and enums for a specific app, accessible via the resources route in your application.
 *
 * Parameters:
 * @param {string} props.userId - The ID of the current user (passed from parent, used for context or API calls).
 * @param {string} props.userName -The username of the current user (passed from parent,used for context ).
 * Returns:
 *  @returns {JSX.Element}  
 *      The rendered UI for managing resources and enums, including:
 *        - Sidebar lists for resources and enums with add/edit/delete controls.
 *        - Modal dialogs for editing resource/enum attributes.
 *        - ag-Grid table for viewing and editing resource data.
 *        - Toast notifications for feedback.
 */

import React, { JSXElementConstructor, useContext, useEffect, useRef, useState } from "react";
import UserInfoContext from "../context/userContext";
import { useAppContext } from "../context/appContext";
import { useParams } from "react-router-dom";
import { useApplicationContext } from "../context/applicationContext";
import { DashboardProps } from "./Dashboard1";
import Navbar2 from "./Navbar2";
import "../resources.css";

import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,

} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-material.css";
// import "ag-grid-community/styles/ag-theme-material-dark.css";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-quartz.css";
// import "ag-grid-community/styles/ag-theme-quartz-dark.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";



import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteResource, fetchResources, saveResource, updateResource } from "../api/resources";
import { deleteEnum, fetchEnums, saveEnum, updateEnum } from "../api/enum";
import { useFetchAppContext } from "../api/useFetchAppContext";
import { useResourceStore } from "../store/useResourceStore";
import { userAppMetaData } from "../hooks/useAppMetaData";
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface Resource {
  id?: string;
  resourceName: string;
  attributes: {
    resource: string;
    fieldValues: any[];
  };
}
interface Enum {
  id?: string;
  enumName: string;
  enums: {
    enum_name: string;
    fieldValues: any[];
  };
}

const AppResourceComponent: React.FC<DashboardProps> = ({
  userId,
  userName,
}) => {
  const queryClient = useQueryClient();
  const { userInfo } = useContext(UserInfoContext);
  //  const { allApps, currentIndex, appName, setAppName } = useAppContext();

   const getSelectedResourceData = useResourceStore(
    (state) => state.getSelectedResourceData
  );
  const getResourcesData = useResourceStore((state) => state.getResourcesData);

  const setResourcesData = useResourceStore((state) => state.setResourcesData);
  const { appId }:any = useParams();
  userAppMetaData(appId);
  const FetchAppContext = useFetchAppContext();
  const { selectedAppData,setSelectedAppData,allApplications, selectedAppName, setSelectedAppName } = useApplicationContext();
  const appName = selectedAppName;
  const setAppName = setSelectedAppName;
  const allApps = allApplications;
  const currentIndex = 0;

  const [colDef1, setColDef1] = useState<any[]>([]);

  const [showToast, setShowToast] = useState<any>(false);
  const [showEnumToast, setShowEnumToast] = useState<any>(false);

  const [showToastAddRow, setShowToastAddRow] = useState<any>(false);
  const gridRef = useRef<AgGridReact<any>>(null);
  
  // const [allResources, setAllResources] = useState([]);
  // const [allEnum, setAllEnum] = useState([]);

  const fetchResourcesRef = useRef<() => void>(() => { });
  const fetchEnumRef = useRef<() => void>(() => { });

  const [fetchResourcesFn, setFetchResourcesFn] = useState(() => () => { });
  const [fetchEnumFn, setFetchEnumFn] = useState(() => () => { });

  const [selectedResource, setSelectedResource] = useState<any>(
    null
  );
  
  const [selectedEnum, setSelectedEnum] = useState<Enum | null>(null);

  const [resName, setResName] = useState("");
  const [enumName, setEnumName] = useState("");

  const [statusInput, setStatusInput] = useState(false);
  const [statusEnumInput, setStatusEnumInput] = useState(false);

  const [applications, setApplications] = useState(userInfo.getApplications());

  // Attributes for resource
  const [typeObj, setTypeObj] = useState<any>({
    name: "",
    type: "Select Type",
    required: false,
    is_file: false,
    is_enum: false,
    foreign_field: "",
    // possible_value: "",
  });
  // Attribute for enum
  const [typeEnumObj, setTypeEnumObj] = useState<any>({
    name: "",
  });

  const [types, setTypes] = useState(["Long", "String", "Boolean", "Date"]);

  const [isChecked, setIsChecked] = useState(false);
  const [isFileChecked, setIsFileChecked] = useState(false);
  const [isForeignChecked, setIsForeignChecked] = useState(false);
  const [isEnumChecked, setIsEnumChecked] = useState(false);

  const [fkName, setFkName] = useState("Select Resource");
  const [enName, setEnName] = useState("Select Enum");

  const [showModal, setShowModal] = useState(false);
  const [showEnumModal, setShowEnumModal] = useState(false);

  const [resMetaData, setResMetadata] = useState<any[]>([]);
  const [enumMetaData, setEnumMetadata] = useState<any[]>([]);

  const [savedresource, setSavedResource] = useState("");
  const [selectedResourceName, setSelectedResourceName] = useState("");
  const [selectedEnumName, setSelectedEnumName] = useState("");
const [selectedResourceIdx, setSelectedResourceIdx] = useState<number>(0)
  const [rowData, setRowData] = useState<any[]>([]);
  const [isResCollapsed, setIsResCollapsed] = useState(false);
  const [isEnumCollapsed, setIsEnumCollapsed] = useState(false);
  
   useEffect(() => {
    // Only refetch if context is empty (i.e., user refreshed)
    if (!selectedAppData || selectedAppData.length === 0) {
      FetchAppContext(appId || "");
    }
  }, [appId]);

  useEffect(() => {
    console.log("application list", applications);
  }, [applications]);
  console.log("resMetaData", resMetaData);

  // React Query: fetch resources
  const {
    data: allResources = [],
    isLoading: isLoadingResources,
    error: resourcesError,
    refetch: refetchResources,
  } = useQuery({
    queryKey: ['resources', appId],
    queryFn: () => fetchResources(appId),
    enabled: !!appId, // only run if appId is available
    
  });
  // React Query: fetch enums
  const {
    data: allEnum = [],
    isLoading: isLoadingEnum,
    error: enumError,
    refetch: refetchEnums,
  } = useQuery({
    queryKey: ['enums', appId],
    queryFn: () => fetchEnums(appId),
    enabled: !!appId, // only run if appId is available
  });


  // useEffect(()=>{
  //   const appIdForStore=userInfo.getCurrentApplication()?.getId()
  //   const appMetaData = {
  //     "name" : userInfo.getCurrentApplication()?.getName()
  //   }
  //   const enumMetaData = allEnum.map((enumData:any)=>{
  //     return (
  //       {
  //         enum_name: enumData.enums.enum_name,
  //         enum_values:enumData.enums.fieldValues.map((enumValue:any)=>{
  //           return enumValue.name;
  //         })
  //       }
        
  //     )
  //   })
  //   const resourceMetaData = allResources.map((res:any)=>{
  //    return (
  //     {
  //       resourceName:res.resourceName,
  //       fieldValues:res.attributes.fieldValues
  //     }
  //    )
  //   })
  //   const pageMetaData =[] 
  //   console.log("gett app details for store----", enumMetaData,resourceMetaData);


  // },[appId, allEnum,allResources])

  // Expose refetch via ref + setter for external use (e.g. after delete/update)
  useEffect(() => {
    fetchResourcesRef.current = refetchResources; // this is for refreshing the data after Delete of any resource as well as save or updated the any resource
    setFetchResourcesFn(refetchResources);
  }, [refetchResources, setFetchResourcesFn]);

  useEffect(() => {
    fetchEnumRef.current = refetchEnums; // this is for refreshing the data after Delete of any resource as well as save or updated the any resource
    setFetchEnumFn(refetchEnums);
  }, [refetchEnums, setFetchEnumFn]);


  useEffect(() => {
    console.log("selected App in context: ", appName);
  }, [appName, allEnum]);



  // Restore collapsed states from localStorage on mount
  useEffect(() => {
    try {
      const r = localStorage.getItem("resourcesCollapsed");
      const e = localStorage.getItem("enumsCollapsed");
      if (r !== null) setIsResCollapsed(r === "1");
      if (e !== null) setIsEnumCollapsed(e === "1");
    } catch (err) {
      console.warn("Failed to load collapsed states from localStorage", err);
    }
  }, []);

  // Handlers to toggle and persist collapsed states
  const toggleResCollapsed = () =>
    setIsResCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("resourcesCollapsed", next ? "1" : "0");
      } catch {}
      return next;
    });

  const toggleEnumCollapsed = () =>
    setIsEnumCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("enumsCollapsed", next ? "1" : "0");
      } catch {}
      return next;
    });

  useEffect(() => {
    // Listen for custom event from child
    const handleRefresh = () => {
      // this is for refreshing the data after Delete of any resource as well as save or updated the any resource threw event "refreshResources"
      fetchResourcesRef.current();
    };
    window.addEventListener("refreshResources", handleRefresh);
    return () => {
      window.removeEventListener("refreshResources", handleRefresh);
    };
  }, []);

  useEffect(() => {
    // Listen for custom event from child
    const handleRefreshEnum = () => {
      // this is for refreshing the data after Delete of any resource as well as save or updated the any resource threw event "refreshResources"
      fetchEnumRef.current();
    };
    window.addEventListener("refreshEnum", handleRefreshEnum);
    return () => {
      window.removeEventListener("refreshEnum", handleRefreshEnum);
    };
  }, []);

  // Create resource
  const handleCreateResource = () => {
    setStatusInput(true);
  };
  // Create enum
  const handleCreateEnum = () => {
    setStatusEnumInput(true);
  };

  // Resource view
  const handleResourceView = (resourceIndex: number) => {
    const resource: any = allResources[resourceIndex] || {};
    setSelectedResource(resource); // set the selected resource before navigating
    setSelectedResourceName(resource.resourceName);
    console.log("selected resource", selectedResource);
    setStatusInput(false);
    setShowModal(true);
  };
  // Enum view
  const handleEnumView = (enumIndex: any) => {
    const enums: any = allEnum[enumIndex] || {};
    setSelectedEnum(enums);
    setSelectedEnumName(enums.enumName);
    console.log("selected enums", selectedEnumName);
    setStatusEnumInput(false);
    setShowEnumModal(true);
  };

  useEffect(() => {
    console.log("alll dataaaaa", getResourcesData(appId ?? ""));
    setRowData(getResourcesData(appId ?? "")[selectedResourceName] || []);
  }, []);

  const getNRowData = (n: any) => {
    let res = [];
    for (let i = 0; i < n; i++) {
      let obj = {};
      console.log("row data resMeta", resMetaData);
      resMetaData.forEach((item: any) => {
        const x = { ...obj, [item.name]: generateDummyString(8) };
        console.log("row data obj", x);
        obj = x;
      });
      res.push(obj);
    }
    console.log("row data res", res);
    return res;
  };
  // Add new row to Aggrid
  const addRow = () => {
    let obj = {};
    resMetaData.forEach((item: any) => {
      const x = { ...obj, [item.name]: "" };
      obj = x;
    });
    setRowData([...rowData, obj]);
    setShowToastAddRow(true);
    setTimeout(() => setShowToastAddRow(false), 3000);
    console.log("showToast", showToastAddRow);
  };

  // useEffect(() => {
  //   if (resMetaData) {
  //     setRowData(getNRowData(5));
  //     console.log("row data fun", getNRowData(5));
  //   }
  // }, [resMetaData]);

  const handleResource = (resourceIndex: number) => {
    if (selectedResource !== allResources[resourceIndex]) {
      setColDef1([]);
    }
    const resource: any = allResources[resourceIndex] || {};
    setSelectedResource(resource);
    setSelectedResourceIdx(resourceIndex);
    console.log(
      "selected resource data",
      getSelectedResourceData(appId??"",resource.resourceName)
    );

    const currResData = getSelectedResourceData(appId??"", resource.resourceName);
    setRowData(currResData || []);
    getAllGridData();
  };
  const updateColDef = () => {
    if (selectedResource && selectedResource.attributes ) {
      setResMetadata(selectedResource.attributes.fieldValues || []);

      let r = colDef1;
      selectedResource.attributes.fieldValues.forEach((item: any) => {
        r.push({
          headerName: item.name,
          field: item.name,
          flex: 1,
          editable: true,
        });
        setColDef1(r);
      });
    }
  };
  useEffect(() => {
    console.log("selectedResource:", selectedResource);
    console.log("selectedResourceName:", selectedResourceName);
    // if (selectedResource) {
    //   // setMetadata(selectedResource[selectedResourceName] || {});
    //   setResMetadata(selectedResource.attributes?.fieldValues || []);

    //   let r = colDef1;
    //   selectedResource.attributes?.fieldValues.forEach((item: any) => {
    //     r.push({
    //       headerName: item.name,
    //       field: item.name,
    //       flex: 1,
    //       editable: true,
    //     });
    //     setColDef1(r);
    //   });
    // }
    updateColDef();
  }, [selectedResource]); // Trigger re-fetch when resource changes

  useEffect(() => {
    if (selectedEnum) {
      setEnumMetadata(selectedEnum.enums?.fieldValues || []);
      console.log("enumMetaData", enumMetaData);
    }
  }, [selectedEnum]);

  const handleResourceName = () => {
    setResMetadata([]);
    setSelectedResource(null); // Clear selected resource to ensure creation mode
    setSelectedResourceName(resName);
    const resourceData = {
      applicationId: appId || '',
      resourceName: resName,
      attributes: {
        resource: resName,
        fieldValues:[ {
      name: 'id',
      type: 'String',
      required: true,
      is_file: false,
      is_enum: false,
      foreign_field: ''
    }],
      },
    };

    console.log("my current selected resource name",resName);
     handleSavetoDB(resourceData);
    setStatusInput(false);
    // setShowModal(true);
    setResName("");
    refetchResources();
  };

  const handleEnumName = () => {
    setEnumMetadata([]);
    setSelectedEnum(null); // Clear selected enum to ensure creation mode
    setSelectedEnumName(enumName);
    setStatusEnumInput(false);
    setShowEnumModal(true);
  };

  const { mutate: handleRDelete } = useMutation({
    mutationFn: ({ resourceId }: { resourceId: string }) => {
      // const appId = allApps[currentIndex]?.id || '';
      return deleteResource(appId || '', resourceId);
    },

    onMutate: async ({ resourceId }) => {
      console.log("Deleting resource:", resourceId);
      console.log("All resources:", allResources);

      // Cancel any ongoing queries
      await queryClient.cancelQueries({ queryKey: ['resources', appId] });

      // Snapshot the previous resources
      const previousResources = queryClient.getQueryData<any[]>(['resources', appId]);

      const updatedResources = previousResources?.filter(
        (r: any) => r.id !== resourceId
      ) || [];

      console.log("Updated resources (optimistic):", updatedResources);

      queryClient.setQueryData(['resources', appId], updatedResources);

      return { previousResources };
    },

    onSuccess: async (_, { resourceId }) => {
      console.log(`Resource '${resourceId}' deleted successfully`);

      // Optional: refetch fresh list from server
      const freshResponse = await fetchResourcesRef.current?.();
      console.log("Fetched updated resources:", freshResponse);
    },

    onError: (err, _vars, context) => {
      console.error("Error during deletion:", err);

      if (context?.previousResources) {
        // Rollback on error
        queryClient.setQueryData(['resources', appId], context.previousResources);
      }
    }
  });

  // Delete Resource
  const handleResourceDelete = async (idx: number) => {
    console.log("index", idx);
    const resource: any = allResources[idx] || {};
    const resourceId = resource.id || '';
    handleRDelete({ resourceId });
  };

  const { mutate: handleEDelete } = useMutation({
    mutationFn: ({ enumId, enumName }: { enumId: string; enumName: string }) => {
      // const appId = allApps[currentIndex]?.id || '';
      return deleteEnum(appId || '', enumId, enumName);
    },

    onMutate: async ({ enumName }) => {
      console.log("Deleting enum:", enumName);
      console.log("All Enums:", allEnum);

      // Optimistically update UI
      await queryClient.cancelQueries({ queryKey: ['enums', appId] });

      const previousEnums = queryClient.getQueryData<any[]>(['enums', appId]);

      const updatedEnums = previousEnums?.filter((e: any) => e.enumName !== enumName) || [];
      console.log("Updated Enums (Optimistic):", updatedEnums);

      queryClient.setQueryData(['enums', appId], updatedEnums);

      return { previousEnums };
    },

    onSuccess: async (_, { enumName }) => {
      console.log(`Enum '${enumName}' deleted successfully`);

      const freshEnum = await fetchEnumRef.current(); // ✅ same as your old code
      console.log("Fetched updated Enums:", freshEnum);
    },

    onError: (err, _vars, context) => {
      console.error("Failed to delete enum:", err);
      if (context?.previousEnums) {
        queryClient.setQueryData(['enums', appId], context.previousEnums);
      }
      // Optional: fallback to local state
      // setAllEnum(allEnum);
    },
  });

  // Delete Enum
  const handleEnumDelete = async (idx: number) => {
    console.log("index", idx);
    const enums: any = allEnum[idx] || {};
    const enumId = enums.id || '';
    const enumName = enums.enumName;
    handleEDelete({ enumId, enumName });

  };

  // Delete Resource key value
  const handleDeleteResourceKey = (resName: string, idx: any) => {
    let updatedObj = resMetaData.filter((item: any) => item.name !== resName);
    setResMetadata(updatedObj);
  };
  // Delete Enum key value
  const handleDeleteEnumKey = (enumName: string, idx: any) => {
    let updatedEnumObj = enumMetaData.filter(
      (item: any) => item.name !== enumName
    );
    setEnumMetadata(updatedEnumObj);
  };
  // Save Resource key value
  function handleSaveResourceKey(): void {
    let arr = resMetaData;
    arr.push(typeObj);
    setResMetadata(arr);

    setSavedResource(selectedResourceName);
    setTypeObj({
      name: "",
      type: "Select Type",
      required: false,
      is_file: false,
      is_enum: false,
      foreign_field: "",
      // possible_value: "",
    });
    setIsChecked(false);
    setIsFileChecked(false);
    setIsEnumChecked(false);
    setIsForeignChecked(false);
    setFkName("Select Resource");
  }
  // Save Enum key value
  const handleSaveEnumKey = () => {
    if (!typeEnumObj.name) return;
    console.log("typeEnumObj", typeEnumObj);
    setEnumMetadata((prev) => [...prev, typeEnumObj]); // ✅ Proper way to update state
    setTypeEnumObj({
      name: "",
    });
  };

  useEffect(() => {
    console.group("enum meta data", enumMetaData);
  }, [enumMetaData]);

  const { mutate: handleSavetoDB } = useMutation({
    mutationFn: (resourceData: {
      applicationId: string;
      resourceName: string;
      attributes: {
        resource: string;
        fieldValues: any;
      };
    }) => saveResource(resourceData),

    onSuccess: (result) => {
      console.log("Resource saved:", result);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Trigger refresh event
      const refreshEvent = new Event("refreshResources");
      window.dispatchEvent(refreshEvent);
    },

    onError: (error: any) => {
      console.error("Failed to save resource:", error.message);
    }
  });

  const { mutate: handleUpdateToDB } = useMutation({
    mutationFn: (resourceData: {
      applicationId: string;
      resourceId: string;
      resourceName: string;
      attributes: {
        resource: string;
        fieldValues: any;
      };
    }) => updateResource(resourceData),

    onSuccess: (result) => {
      console.log("Resource updated:", result);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Trigger refresh event
      const refreshEvent = new Event("refreshResources");
      window.dispatchEvent(refreshEvent);
    },

    onError: (error: any) => {
      console.error("Failed to update resource:", error.message);
    }
  });

//  const allResourcesTableData = ()=>{
//     allResources.map((resouce:any,idx:any)=>{
//       getAllGridData();
//     })
//   }
//   const getAllGridData = () => {
//     if (gridRef.current) {
//       const rowData: any[] = [];
//       gridRef.current.api.forEachNode((node:any) => {
//         rowData.push(node.data);
//       });
//       setGridData(rowData); // ✅ store it in state
//       console.log("All grid data:", rowData);
//       setResourcesData(rowData)
//     }
//   };

useEffect(() => {
    const allData = getResourcesData(appId??"");
    const firstKey: any = Object.keys(allData)[0];
    setRowData(allData[firstKey] || []);
  }, []);

  useEffect(() => {
    //  console.log("alll dataaaaa", getResourcesData());
    // const selectedResData = getSelectedResourceData(selectedResource.resourceName);
    if (getResourcesData(appId??"") && selectedResource) {
      const data = getResourcesData(appId??"");
      const tableData = data[selectedResource.resourceName] || [];
      setRowData(tableData);
    } else {
      setRowData([]); // empty grid for new resource
    }
  }, [selectedResource]);

   // ✅ get all data from current grid and update in resourcesData
  const saveCurrentGridData = () => {
    if (gridRef.current) {
      const rowDataTemp: any[] = [];
      gridRef.current.api.forEachNode((node: any) => {
        rowDataTemp.push(node.data);
      });
      console.log("all the resource but selected", appId,selectedResource);
      setResourcesData(appId??"",selectedResource.resourceName, rowDataTemp); // ✅ update context/state
      console.log(`✅ Saved ${selectedResource} data:`, rowDataTemp);
    }
  };

  // ✅ get all resources’ data
  const getAllGridData = () => {
    // first save the current grid’s latest edits
    saveCurrentGridData();

    console.log(
      "All resources data:",
      getResourcesData(appId??""),
      selectedResource,
      selectedResourceName
    );
    
    // alert(JSON.stringify(getResourcesData(), null, 2));
  };

  const onSaveClick = () => {
    const resourceData = {
      applicationId: appId || '',
      resourceName: selectedResourceName,
      attributes: {
        resource: selectedResourceName,
        fieldValues: resMetaData,
      },
    };
    const exists: boolean = (allResources as Resource[]).some((r: Resource) => r.resourceName === selectedResourceName);
    // console.log("selected resource name when selected", exists,selectedResource);

    // if (selectedResource && selectedResource.id) {
    if (exists) {
      const existingResource = allResources.find((r: Resource) => r.resourceName === selectedResourceName);
      // console.log("existingResource", existingResource);
      // Update existing resource
      handleUpdateToDB({
        ...resourceData,
        resourceId: existingResource.id
      });
    } 
    
    // else {
    //   // Create new resource
    //   handleSavetoDB(resourceData);
    // }
  };

  const { mutate: handleSaveEnumtoDB } = useMutation({
    mutationFn: saveEnum,

    onSuccess: async (result) => {
      console.log("enum saved", result);

      // ✅ Show success toast
      setShowEnumToast(true);
      setTimeout(() => setShowEnumToast(false), 3000);

      // ✅ Re-fetch the enums after saving
      if (fetchEnumRef.current) {
        await fetchEnumRef.current();
      }
    },

    onError: (error: any) => {
      console.error("Failed to save enum:", error.message);
    },
  });

  const { mutate: handleUpdateEnumToDB } = useMutation({
    mutationFn: updateEnum,

    onSuccess: async (result) => {
      console.log("enum updated", result);

      // ✅ Show success toast
      setShowEnumToast(true);
      setTimeout(() => setShowEnumToast(false), 3000);

      // ✅ Re-fetch the enums after saving
      if (fetchEnumRef.current) {
        await fetchEnumRef.current();
      }
    },

    onError: (error: any) => {
      console.error("Failed to update enum:", error.message);
    },
  });

  const onEnumSaveClick = () => {
    const enumData = {
      applicationId: appId || '',
      enumName: selectedEnumName,
      enums: {
        enum_name: selectedEnumName,
        fieldValues: enumMetaData,
      },
    };

    if (selectedEnum && selectedEnum.id) {
      handleUpdateEnumToDB({
        ...enumData,
        enumId: selectedEnum.id
      });
    } else {
      handleSaveEnumtoDB(enumData);
    }
  };

  useEffect(() => {
    console.log("pages res comp:", allApps);
    // localStorage.setItem("theme","ag-theme-quartz-dark");
  }, []);
  const generateDummyString = (length: number = 10): string => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const defaultColDef = {
    flex: 1,
  };
  console.log("row data", rowData);

  // Close Modals
  const handleCloseModal = () => {
    setShowModal(false);
    setShowEnumModal(false);
    setTypeObj({
      name: "",
      type: "Select Type",
      required: false,
      is_file: false,
      is_enum: false,
      foreign_field: "",
      // possible_value: "",
    });
    setTypeEnumObj({
      name: "",
    });
    setIsChecked(false);
    setIsFileChecked(false);
    setIsEnumChecked(false);
    setIsForeignChecked(false);
    setFkName("Select Resource");
  };

  const handleChangeResourceName = (e: any) => {
    const inputValue = e.target.value.replace(/[^a-zA-Z0-9_]/g, ""); // Allow only alphanumeric and underscores
    const formattedValue =
      inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    setResName(formattedValue);
    // setStatusInput(true);
  };
  const handleChangeEnumName = (e: any) => {
    const inputValue = e.target.value.replace(/[^a-zA-Z0-9_]/g, ""); // Allow only alphanumeric and underscores
    const formattedValue =
      inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    setEnumName(formattedValue);
  };

  return (
    <div className="editor-root">
      <Navbar2
        AppData={allApps}
        appIdx={currentIndex}
        appName={appName}
        setAppName={setAppName}
        getAllGridData={getAllGridData}
      />

      {/* Main content area aligned to dashboard visuals */}
      <div className="editor-main">
        <aside className="panel">
          <div className="panel-header " style={{background:"#2e3361a6"}} >
            <div className="panel-header-content">
              <i className="fa fa-database panel-header-icon" />
              <h3>Resources</h3>
            </div>
            <div className="actions">
              <button className="icon-btn subtle" onClick={toggleResCollapsed} title={isResCollapsed ? "Expand" : "Collapse"}>
                <i className={`fa ${isResCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}/>
              </button>
              <button className="icon-btn primary-add" onClick={handleCreateResource} title="Create Resource">
                <i className="fa fa-plus"/>
              </button>
            </div>
          </div>
          {/* Resource List */}
          {!isResCollapsed && (
            <>
              <ul className="list modern-list">
                {allResources.length === 0 && !statusInput && (
                  <li className="list-empty-state">
                    <i className="fa fa-inbox" />
                    <span>No resources yet</span>
                  </li>
                )}
                {allResources.map((resource: any, idx: any) => (
                  <li className={`list-item modern-list-item ${selectedResource?.resourceName === resource.resourceName ? 'active' : ''}`} key={idx}>
                    <div className="list-item-content" onClick={() => handleResource(idx)}>
                      <i className="fa fa-table list-item-icon" />
                      <span className="title">{resource.resourceName}</span>
                    </div>
                    <div className="row-actions">
                      <button className="icon-btn edit-btn" title="Edit" onClick={() => handleResourceView(idx)}>
                        <i className="fa fa-edit"/>
                      </button>
                      <button className="icon-btn danger-btn" title="Delete" onClick={() => handleResourceDelete(idx)}>
                        <i className="fa fa-trash"/>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {statusInput && (
                <div className="inline-add modern-add">
                  <div className="add-input-wrapper">
                    <i className="fa fa-tag add-input-icon" />
                    <input
                      type="text"
                      name="resourceName"
                      id="resourceName"
                      placeholder="Resource name (e.g., User, Product)"
                      value={resName}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === " ") e.preventDefault();
                        if (e.key === "Enter" && resName.trim()) {
                          handleResourceName();
                        }
                        if (e.key === "Escape") {
                          setStatusInput(false);
                          setResName("");
                        }
                      }}
                      onChange={handleChangeResourceName}
                      className="modern-input"
                    />
                  </div>
                  <button className="icon-btn cancel-btn" onClick={() => { setStatusInput(false); setResName(""); }} title="Cancel">
                    <i className="fa fa-times"/>
                  </button>
                  <button className="primary-btn add-confirm-btn" onClick={handleResourceName} disabled={!resName.trim()}>
                    <i className="fa fa-check"/> Add
                  </button>
                </div>
              )}
            </>
          )}
          <br />

          {/* Divider visually implied by next panel */}
          <div className="panel-divider"></div>

          <div className="panel-header rounded" style={{background:"#2e3361a6"}} >
            <div className="panel-header-content">
              <i className="fa fa-list-ul panel-header-icon" />
              <h3>Enums</h3>
            </div>
            <div className="actions"> 
              <button className="icon-btn subtle" onClick={toggleEnumCollapsed} title={isEnumCollapsed ? "Expand" : "Collapse"}>
                <i className={`fa ${isEnumCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}/>
              </button>
              <button className="icon-btn primary-add" onClick={handleCreateEnum} title="Create Enum">
                <i className="fa fa-plus"/>
              </button>
            </div>
          </div>
          {!isEnumCollapsed && (
            <>
              <ul className="list modern-list">
                {allEnum.length === 0 && !statusEnumInput && (
                  <li className="list-empty-state">
                    <i className="fa fa-inbox" />
                    <span>No enums yet</span>
                  </li>
                )}
                {allEnum.map((e: any, idx: any) => (
                  <li className={`list-item modern-list-item ${selectedEnum?.enumName === e.enumName ? 'active' : ''}`} key={idx}>
                    <div className="list-item-content">
                      <i className="fa fa-list list-item-icon" />
                      <span className="title">{e.enumName}</span>
                    </div>
                    <div className="row-actions">
                      <button className="icon-btn edit-btn" title="Edit" onClick={() => handleEnumView(idx)}>
                        <i className="fa fa-edit"/>
                      </button>
                      <button className="icon-btn danger-btn" title="Delete" onClick={() => handleEnumDelete(idx)}>
                        <i className="fa fa-trash"/>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {statusEnumInput && (
                <div className="inline-add modern-add">
                  <div className="add-input-wrapper">
                    <i className="fa fa-tag add-input-icon" />
                    <input
                      type="text"
                      name="enumName"
                      id="enumName"
                      placeholder="Enum name (e.g., Status, Type)"
                      value={enumName}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === " ") e.preventDefault();
                        if (e.key === "Enter" && enumName.trim()) {
                          handleEnumName();
                        }
                        if (e.key === "Escape") {
                          setStatusEnumInput(false);
                          setEnumName("");
                        }
                      }}
                      onChange={handleChangeEnumName}
                      className="modern-input"
                    />
                  </div>
                  <button className="icon-btn cancel-btn" onClick={() => { setStatusEnumInput(false); setEnumName(""); }} title="Cancel">
                    <i className="fa fa-times"/>
                  </button>
                  <button className="primary-btn add-confirm-btn" onClick={handleEnumName} disabled={!enumName.trim()}>
                    <i className="fa fa-check"/> Add
                  </button>
                </div>
              )}
            </>
          )}
        </aside>

        {/* Canvas/Data grid */}
  <section className="panel editor-canvas" style={{margin:0}}>
          <div className="panel-header">
            <div className="panel-header-content">
              <div>
                <h3>
                  <i className="fa fa-table" style={{marginRight: '0.5rem', color: 'var(--dash-accent)'}} />
                  {appName} Data Overview
                </h3>
                <div className="panel-subtitle">Manage data entries for <strong>{appName}</strong></div>
                {selectedResource && (
                  <div className="panel-subtitle resource-badge">
                    <i className="fa fa-database" />
                    <span>Viewing: <strong>{selectedResource.resourceName}</strong></span>
                  </div>
                )}
              </div>
            </div>
            <div className="actions">
              <button className="primary-btn modern-add-btn" onClick={addRow} disabled={!selectedResource}>
                <i className="fa fa-plus-circle"/> Add Row
              </button>
            </div>
          </div>
          {/* panel-body ag-wrap */}
          <div className="panel-body ag-wrap rounded-bottom" style={{borderRadius: '0 0 12px 12px', margin: 0,background:'transparent'}}>
            {!selectedResource ? (
              <div className="empty-hint">
                <i className="fa fa-database" aria-hidden="true"></i>
                <div>
                  <strong>No resource selected</strong>
                  <div>Select a resource from the left to view and edit data.</div>
                </div>
              </div>
            ) : (
              // <div className={theme} style={{height:400}}>
              <div className="ag-theme-quartz-dark" style={{height:400}}> 
                <AgGridReact    
                className="bg-dark "
                 ref={gridRef}  
                  theme={themeQuartz }
                  rowData={rowData}
                  columnDefs={colDef1}
                  defaultColDef={defaultColDef}
                  rowHeight={34}
                  headerHeight={34}
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[20]}
                  rowSelection="single"
                  singleClickEdit={true}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Add Row toast */}
      {showToastAddRow && (
        <div
          className="toast-container position-fixed top-50 start-50 translate-middle p-3 text-white"
          style={{ zIndex: 1550 }}
        >
          <div
            className="toast show"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header">
              <strong className="me-auto">Success</strong>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="toast"
                aria-label="Close"
                onClick={() => setShowToastAddRow(false)}
              ></button>
            </div>
            <div className="toast-body text-success text-center">Row Added</div>
          </div>
        </div>
      )}

      {/* Adding resouce attributes */}
      {showModal && (
        <div
          className="d-flex modal fade show d-block align-items-center rasp-modal modern-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-lg modern-modal-dialog">
            <div className="modal-content modern-modal-content">
              {/* Modal Header */}
              <div className="modal-header modern-modal-header">
                <div className="modal-header-content">
                  <i className="fa fa-cog modal-header-icon" />
                  <div>
                    <h5 className="modal-title">
                      Configure Resource: <span className="resource-name-highlight">{selectedResourceName}</span>
                    </h5>
                    <div className="modal-subtitle">Define attributes and properties for this resource</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close  text-white"
                  onClick={() => handleCloseModal()}
                  aria-label="Close"
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body modern-modal-body">
                <div className="attribute-form-section">
                  <div className="form-section-header">
                    <i className="fa fa-plus-circle" />
                    <h6>Add New Attribute</h6>
                  </div>
                  <div className="attribute-form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <i className="fa fa-tag" /> Attribute Name
                      </label>
                      <input
                        type="text"
                        className="form-control modern-form-input"
                        placeholder="e.g., firstName, email, age"
                        value={typeObj.name}
                        name="name"
                        onKeyDown={(e) => {
                          if (e.key === " ") {
                            e.preventDefault(); // Block space key while typing
                          }
                          if (e.key === "Enter" && typeObj.name && typeObj.type !== "Select Type") {
                            handleSaveResourceKey();
                          }
                        }}
                        onChange={(e) =>
                          setTypeObj({
                            ...typeObj,
                            [e.target.name]: e.target.value
                              .replace(/\s/g, "")
                              .toLowerCase(), // Remove spaces
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <i className="fa fa-code" /> Data Type
                      </label>
                      <div className="dropdown modern-dropdown">
                        <button
                          type="button"
                          className="btn modern-dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <span>{typeObj.type}</span>
                          <i className="fa fa-chevron-down" />
                        </button>
                        <ul
                          className="dropdown-menu modern-dropdown-menu"
                          aria-labelledby="dropdownMenuButton"
                        >
                          {types.map((item, index) => (
                            <li
                              className="dropdown-item modern-dropdown-item"
                              key={index}
                              onClick={() => setTypeObj({ ...typeObj, type: item })}
                            >
                              <i className="fa fa-check" style={{opacity: typeObj.type === item ? 1 : 0}} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="form-options-grid">

                    <div className="checkbox-group">
                      <label className="modern-checkbox-label">
                        <input
                          type="checkbox"
                          name="required"
                          checked={isChecked}
                          onChange={(e) => {
                            setIsChecked(e.target.checked);
                            setTypeObj({ ...typeObj, required: e.target.checked });
                          }}
                          className="modern-checkbox"
                        />
                        <span className="checkbox-label-text">
                          <i className="fa fa-asterisk" /> Required
                        </span>
                      </label>
                    </div>

                    <div className="checkbox-group">
                      <label className="modern-checkbox-label">
                        <input
                          type="checkbox"
                          name="file"
                          checked={isFileChecked}
                          onChange={(e) => {
                            setIsFileChecked(e.target.checked);
                            setTypeObj({ ...typeObj, is_file: e.target.checked });
                          }}
                          className="modern-checkbox"
                        />
                        <span className="checkbox-label-text">
                          <i className="fa fa-file" /> File Upload
                        </span>
                      </label>
                    </div>

                    <div className="checkbox-group">
                      <label className="modern-checkbox-label">
                        <input
                          type="checkbox"
                          name="enum"
                          checked={isEnumChecked}
                          onChange={(e) => {
                            setIsEnumChecked(e.target.checked);
                            setTypeObj({ ...typeObj, is_enum: e.target.checked });
                          }}
                          className="modern-checkbox"
                        />
                        <span className="checkbox-label-text">
                          <i className="fa fa-list" /> Enum Type
                        </span>
                      </label>
                    </div>

                    <div className="checkbox-group">
                      <label className="modern-checkbox-label">
                        <input
                          type="checkbox"
                          name="foreign"
                          checked={isForeignChecked}
                          onChange={(e) => {
                            setIsForeignChecked(e.target.checked);
                          }}
                          className="modern-checkbox"
                        />
                        <span className="checkbox-label-text">
                          <i className="fa fa-link" /> Foreign Key
                        </span>
                      </label>
                    </div>
                  </div>

                  {isEnumChecked && (
                    <div className="form-group">
                      <label className="form-label">
                        <i className="fa fa-list-ul" /> Select Enum
                      </label>
                      <div className="dropdown modern-dropdown">
                        <button
                          type="button"
                          className="btn modern-dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <span>{typeObj.possible_value || enName || "Select Enum"}</span>
                          <i className="fa fa-chevron-down" />
                        </button>
                        <ul
                          className="dropdown-menu modern-dropdown-menu"
                          aria-labelledby="dropdownMenuButton"
                        >
                          {allEnum.map((e: any) => {
                            const name = e.enumName;
                            return (
                              <li
                                className="dropdown-item modern-dropdown-item"
                                key={name}
                                onClick={() => {
                                  setTypeObj({
                                    ...typeObj,
                                    possible_value: name,
                                  });
                                }}
                              >
                                <i className="fa fa-check" style={{opacity: typeObj.possible_value === name ? 1 : 0}} />
                                {name}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}

                  {isForeignChecked && (
                    <>
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fa fa-database" /> Related Resource
                        </label>
                        <div className="dropdown modern-dropdown">
                          <button
                            type="button"
                            className="btn modern-dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <span>{fkName}</span>
                            <i className="fa fa-chevron-down" />
                          </button>
                          <ul
                            className="dropdown-menu modern-dropdown-menu"
                            aria-labelledby="dropdownMenuButton"
                          >
                            {allResources.map((item: any) => {
                              const key = item.resourceName;
                              return (
                                key !== selectedResourceName && (
                                  <li
                                    className="dropdown-item modern-dropdown-item"
                                    key={key}
                                    onClick={() => {
                                      setFkName(key);
                                      setTypeObj({ ...typeObj, foreign: key });
                                    }}
                                  >
                                    <i className="fa fa-check" style={{opacity: fkName === key ? 1 : 0}} />
                                    {key}
                                  </li>
                                )
                              );
                            })}
                          </ul>
                        </div>
                      </div>

                      {fkName !== "Select Resource" && (
                        <div className="form-group">
                          <label className="form-label">
                            <i className="fa fa-key" /> Foreign Field
                          </label>
                          <div className="dropdown modern-dropdown">
                            <button
                              type="button"
                              className="btn modern-dropdown-toggle"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <span>{typeObj.foreign_field || fkName || "Select Field"}</span>
                              <i className="fa fa-chevron-down" />
                            </button>
                            <ul
                              className="dropdown-menu modern-dropdown-menu"
                              aria-labelledby="dropdownMenuButton"
                            >
                              {allResources
                                .filter((item: any) => item.resourceName === fkName)
                                .map((res: any) => {
                                  const fields = res.attributes?.fieldValues || [];
                                  return fields.map((attr: any) => {
                                    const keyName = attr.name;
                                    return (
                                      <li
                                        className="dropdown-item modern-dropdown-item"
                                        key={keyName}
                                        onClick={() =>
                                          setTypeObj({
                                            ...typeObj,
                                            foreign_field: keyName,
                                          })
                                        }
                                      >
                                        <i className="fa fa-check" style={{opacity: typeObj.foreign_field === keyName ? 1 : 0}} />
                                        {keyName}
                                      </li>
                                    );
                                  });
                                })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={handleSaveResourceKey}
                      className="primary-btn add-attribute-btn"
                      disabled={!(typeObj.name && typeObj.type !== "Select Type")}
                    >
                      <i className="fa fa-plus" /> Add Attribute
                    </button>
                  </div>
                </div>
              </div>

              <div className="attributes-table-section">
                <div className="table-section-header">
                  <i className="fa fa-list" />
                  <h6>Defined Attributes ({resMetaData.length})</h6>
                </div>
                <div className="table-responsive modern-table-wrapper">
                  <table className="table modern-table">
                    <thead>
                      <tr>
                        <th scope="col">
                          <i className="fa fa-tag" /> Name
                        </th>
                        <th scope="col">
                          <i className="fa fa-code" /> Type
                        </th>
                        <th scope="col">
                          <i className="fa fa-asterisk" /> Required
                        </th>
                        <th scope="col">
                          <i className="fa fa-file" /> File
                        </th>
                        <th scope="col">
                          <i className="fa fa-list" /> Enum
                        </th>
                        <th scope="col">
                          <i className="fa fa-link" /> Foreign Key
                        </th>
                        <th scope="col" className="text-center">
                          <i className="fa fa-cog" /> Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {resMetaData.length === 0 ? (
                        <tr className="empty-table-row">
                          <td colSpan={7} className="empty-table-cell" style={{textAlign: 'center'}}>
                            <i className="fa fa-inbox" style={{display: 'block', margin: '0 auto', textAlign: 'center'}} />
                            <span style={{display: 'block', margin: '0 auto', textAlign: 'center'}}>No attributes defined yet. Add your first attribute above.</span>
                          </td>
                        </tr>
                      ) : (
                        resMetaData.map((item, index) => (
                          <tr key={index} className="table-row-modern">
                            <td>
                              <span className="attribute-name-badge">
                                <i className="fa fa-tag" />
                                {item.name}
                              </span>
                            </td>
                            <td>
                              <span className={`type-badge type-${item.type.toLowerCase()}`}>
                                {item.type}
                              </span>
                            </td>
                            <td>
                              {item.required ? (
                                <span className="badge badge-success">
                                  <i className="fa fa-check" /> Yes
                                </span>
                              ) : (
                                <span className="badge badge-secondary">
                                  <i className="fa fa-times" /> No
                                </span>
                              )}
                            </td>
                            <td>
                              {item.is_file ? (
                                <span className="badge badge-info">
                                  <i className="fa fa-check" /> Yes
                                </span>
                              ) : (
                                <span className="badge badge-secondary">-</span>
                              )}
                            </td>
                            <td>
                              {item.is_enum ? (
                                <span className="badge badge-enum">
                                  <i className="fa fa-list" /> {item.possible_value || "N/A"}
                                </span>
                              ) : (
                                <span className="badge badge-secondary">-</span>
                              )}
                            </td>
                            <td>
                              {item.foreign ? (
                                <span className="badge badge-foreign">
                                  <i className="fa fa-link" /> {item.foreign}
                                  {item.foreign_field && ` → ${item.foreign_field}`}
                                </span>
                              ) : (
                                <span className="badge badge-secondary">-</span>
                              )}
                            </td>
                            <td className="text-center">
                              <button 
                                type="button" 
                                className="icon-btn danger-btn table-action-btn" 
                                onClick={() => handleDeleteResourceKey(item.name, index)}
                                title="Delete attribute"
                              >
                                <i className="fa fa-trash" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer modern-modal-footer">
                <div className="footer-info">
                  <i className="fa fa-info-circle" />
                  <span>Changes will be saved to the database</span>
                </div>
                <div className="footer-actions">
                  <button 
                    type="button" 
                    className="subtle-btn" 
                    onClick={() => handleCloseModal()}
                  >
                    <i className="fa fa-times" /> Cancel
                  </button>
                  <button onClick={onSaveClick} type="button" className="primary-btn save-resource-btn">
                    <i className="fa fa-floppy-o" /> Save Resource
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showToast && (
            <div
              className="toast-container position-fixed top-20 start-50 translate-middle p-3"
              style={{ zIndex: 1550 }}
            >
              <div
                className="toast show rasp-toast"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="toast-header">
                  <strong className="me-auto">Success</strong>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                    onClick={() => setShowToast(false)}
                  ></button>
                </div>
                <div className="toast-body text-center">
                  Resource Saved successfully!
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Adding Enum attributes */}
      {showEnumModal && (
        <div
          className="d-flex modal fade show d-block align-items-center rasp-modal modern-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)" }}
        >
          <div className="modal-dialog modal-lg modern-modal-dialog">
            <div className="modal-content modern-modal-content">
              {/* Modal Header */}
              <div className="modal-header modern-modal-header">
                <div className="modal-header-content">
                  <i className="fa fa-list-ul modal-header-icon" />
                  <div>
                    <h5 className="modal-title">
                      Configure Enum: <span className="resource-name-highlight">{selectedEnumName}</span>
                    </h5>
                    <div className="modal-subtitle">Define possible values for this enumeration</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close text-white "
                  onClick={() => handleCloseModal()}
                  aria-label="Close"
                ></button>
              </div>

              {/* Modal body */}
              <div className="modal-body modern-modal-body">
                <div className="attribute-form-section">
                  <div className="form-section-header">
                    <i className="fa fa-plus-circle" />
                    <h6>Add New Value</h6>
                  </div>
                  <div className="enum-add-form">
                    <div className="form-group">
                      <label className="form-label">
                        <i className="fa fa-tag" /> Enum Value
                      </label>
                      <div className="enum-input-wrapper">
                        <input
                          type="text"
                          className="form-control modern-form-input"
                          placeholder="e.g., Active, Pending, Completed"
                          value={typeEnumObj.name}
                          name="name"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && typeEnumObj.name.trim()) {
                              handleSaveEnumKey();
                            }
                            if (e.key === "Escape") {
                              setTypeEnumObj({ name: "" });
                            }
                          }}
                          onChange={(e) =>
                            setTypeEnumObj({
                              ...typeEnumObj,
                              [e.target.name]: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={handleSaveEnumKey}
                          className="primary-btn add-value-btn"
                          disabled={typeEnumObj.name === ""}
                        >
                          <i className="fa fa-plus" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="attributes-table-section">
                  <div className="table-section-header">
                    <i className="fa fa-list" />
                    <h6>Defined Values ({enumMetaData.length})</h6>
                  </div>
                  <div className="table-responsive modern-table-wrapper">
                    <table className="table modern-table">
                      <thead>
                        <tr>
                          <th scope="col">
                            <i className="fa fa-tag" /> Value
                          </th>
                          <th scope="col" className="text-center">
                            <i className="fa fa-cog" /> Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {enumMetaData.length === 0 ? (
                          <tr className="empty-table-row">
                            <td colSpan={2} className="empty-table-cell" style={{textAlign: 'center'}}>
                              <i className="fa fa-inbox" style={{display: 'block', margin: '0 auto', textAlign: 'center'}} />
                              <span style={{display: 'block', margin: '0 auto', textAlign: 'center'}}>No values defined yet. Add your first value above.</span>
                            </td>
                          </tr>
                        ) : (
                          enumMetaData.map((item, index) => (
                            <tr key={index} className="table-row-modern">
                              <td>
                                <span className="attribute-name-badge">
                                  <i className="fa fa-circle" style={{fontSize: '0.5rem', marginRight: '0.5rem'}} />
                                  {item.name}
                                </span>
                              </td>
                              <td className="text-center">
                                <button 
                                  type="button" 
                                  className="icon-btn danger-btn table-action-btn" 
                                  onClick={() => handleDeleteEnumKey(item.name, index)}
                                  title="Delete value"
                                >
                                  <i className="fa fa-trash" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer modern-modal-footer">
                <div className="footer-info">
                  <i className="fa fa-info-circle" />
                  <span>Changes will be saved to the database</span>
                </div>
                <div className="footer-actions">
                  <button 
                    type="button" 
                    className="subtle-btn" 
                    onClick={() => handleCloseModal()}
                  >
                    <i className="fa fa-times" /> Cancel
                  </button>
                  <button onClick={onEnumSaveClick} type="button" className="primary-btn save-resource-btn">
                    <i className="fa fa-floppy-o" /> Save Enum
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showEnumToast && (
            <div
              className="toast-container position-fixed top-20 start-50 translate-middle p-3"
              style={{ zIndex: 1550 }}
            >
              <div
                className="toast show rasp-toast"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="toast-header">
                  <strong className="me-auto">Success</strong>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="toast"
                    aria-label="Close"
                    onClick={() => setShowEnumToast(false)}
                  ></button>
                </div>
                <div className="toast-body text-center">
                  Enum Saved successfully!
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppResourceComponent;
