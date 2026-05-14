/**
 * Navbar2 Component
 * -----------------
 *
 * What it does:
 *  - Renders the main navigation bar and menu controls for the application editor.
 *  - Allows users to switch between applications and pages, create or duplicate pages(in progress), and edit page names.
 *  - Provides navigation between Data, Layout, and IAM sections.
 *  - Integrates with user, board, and app context for state management and updates.
 *  - Displays toast notifications for actions like resource generation and page duplication.
 *
 * Where it is used:
 *  - Used as the main navigation/header in the `DragDrop` and resource management pages.
 *  - Rendered at the top of the main editor UI, including in the `/DragDrop` and `/:appName/resources` routes.
 *
 * @param {any} userId - The current user's ID.
 * @param {any} AppData - The list of all applications.
 * @param {number} appIdx - The index of the current application.
 * @param {function} setAppName - Callback to set the current application name.
 * @param {string} appName - The current application name.
 * @param {any} userName - The current user's name.
 * @param {function} [setSelectedElement] - Callback to set the selected UI element.
 * @param {function} [setSelectedEleByCT] - Callback to set the selected element from the CollectionTree.
 * @param {any} [selectedPage] - The currently selected page.
 * @param {function} [setSelectedPage] - Callback to set the selected page.
 * @param {function} [setPageEdit] - Callback to toggle page edit mode.
 *
 * @return {JSX.Element} The rendered navigation bar and menu controls.
 */
import React, { useContext, useEffect, useState } from "react";
import UserInfoContext from "../context/userContext";
import RASPUIPage from "../models/RASPUIPage";
import BoardContext, { BoardContextType, UIItems } from "../context/boardContext";
import DownloadSave from "./DownloadSave";

import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./profile";
import GenerateResource from "./GenerateResource";
import UIElement from "../models/UIElement";
import { createFieldUIElement, getCookieValue, handleDownload, notifyPageDeleteError } from "../utils/utils";
import apiConfig from "../config/apiConfig";
import { useApplicationContext } from "../context/applicationContext";
import { fetchResources, generateResource } from "../api/resources";
import { createNewPage, deletePage, fetchPagesByAppId } from "../api/pages";
import { syncApplication, forceSyncApplication, fetchApplicationVersions, rollbackApplication, fetchApplications, syncToServer } from "../api/applications";
import ElementFactory from "../models/ElementFactory";
import Resource from "../models/Resources";
import Input from "../models/Input";
import DropDown from "../models/DropDown";
import Button from "../models/Button";
import InputCalender from "../models/InputCalendar";
import FileUpload from "../models/FileUpload";
import { useQuery } from "@tanstack/react-query";

// declare module "*.css" {
//   const content: { [className: string]: string };
//   return content;
//}
import "../dashboard.css"
import ReadResource from "../models/ReadResource";
import CreateResource from "../models/CreateResource";
import { useResourceStore } from "../store/useResourceStore";
import { generateWorkflow, updateWorkflow } from "../api/workflows";
import { useWorkflowStore } from "../store/useWorkflowStore";
import { useStore } from "../store/useStore";
import SaveWorkflow from "./SaveWorkflow";
import { jwtDecode } from "jwt-decode";
import { fetchEnums } from "../api/enum";
import { useAppMetaDataStore } from "../store/useAppMetaDataStore";
import { appMetaDataType, enumMetaDataType, pageMetaDataType, resourceMetaDataType } from "../types/metaDataTypes";
import {
  getAppMetaData,
  getEnumMetaData,
  getResourceMetaData,
  getPageMetaData,
} from "../utils/metadata";
import { userAppMetaData } from "../hooks/useAppMetaData";
import { useNavSideBarStore } from "../store/useNavSideBar";
import SelectedNavbar from "../models/SelectedNavbar";
import SelectedSidebar from "../models/SelectedSidebar";
import '../navbar.css'
import VersionHistoryModal from './VersionHistoryModal'
import SyncModal from './SyncModal'
import ConflictModal from './ConflictModal'
<ToastContainer
  aria-label="Success"
  position="top-center"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
/>;


// Extend TypeScript's Window type to include showDirectoryPicker

interface NavbarProps {
  // userId: any;
  AppData: any;
  appIdx: number;
  setAppName: (name: string) => void;
  appName: string;
  // userName: any;
  setSelectedElement?: (element: UIElement | null) => void;
  setSelectedEleByCT?: (element: UIElement | null) => void;
  selectedPage?: any;
  setSelectedPage?: (name: string) => void;
  // setPageEdit?: (name: boolean) => void;
  setPageEdit?: (name: string) => void
  getAllGridData?: () => void;
}

const Navbar2: React.FC<NavbarProps> = ({
  // userId,
  AppData,
  appIdx,
  setAppName,
  appName,
  // userName,
  setSelectedEleByCT,
  setSelectedElement,
  selectedPage,
  setSelectedPage,
  setPageEdit,
  getAllGridData
}) => {
  const {
    allApplications,
    setAllApplications,
    selectedAppData,
    setSelectedAppData,
    // appName,
    // setAppName,
    appDescription,
    setAppDescription,
    selectedAppName,
    setSelectedAppName,
    selectedAppDescription,
    setSelectedAppDescription,

  } = useApplicationContext();



  console.log("appname and desc in navbar", appName, selectedAppDescription)
  const { appId }: any = useParams<any>();

  console.log("all data in navbar", AppData, appName)
  const { userInfo, updateUserInfo, deserlisation } = useContext(UserInfoContext);
  const { board: { ui_items }, moveItemWithChildren, updateBoardUIItems, addUIItem, addUIItemAtIdx, updateBoardResourceOperation, } = useContext(BoardContext);
  // const { userInfo, updateUserInfo } = useContext(UserInfoContext);
  // const { board: { ui_items }, updateBoardUIItems } = useContext(BoardContext);

  const [isDB, setIsDB] = useState(window.location.href.includes("dashboard"));
  const [isDD, setIsDD] = useState(window.location.href.includes("DragDrop"));
  const [isResList, setIsResList] = useState(window.location.href.includes("resources"));
  const [isWorkflow, setIsWorkflow] = useState(window.location.href.includes("workflow/"));

  const [showToastDupPage, setshowToastDupPage] = useState<any>(false);

  console.log("applications in navbar appData:", selectedAppData);

  // const [allPages, setAllPages] = useState(userInfo.getApplication(AppData[appIdx].applicationName)?.getPages());
  const [allPages, setAllPages] = useState(userInfo.getApplication(appName)?.getPages() || new Map());
  console.log("all pages in navbarrrrrrrrrrr", allPages)
  const [pageCounter, setPageCounter] = useState(2);
  const [applications, setApplications] = useState(userInfo.getApplications());

  const navigate = useNavigate();
  const isActive = (keyword: string) => window.location.href.includes(keyword);

  const [showToast, setShowToast] = React.useState(false);
  const [generatedPath, setGeneratedPath] = React.useState("");

  const [myNewPage, setMyNewPage] = useState(new RASPUIPage());

  const [showModal, setShowModal] = useState(false);
  const [showResourceList, setShowResourceList] = useState(false);

  // const [selectedResourceObj, setSelectedResourceObj] = useState<Resource | null>(null);

  const [showOperationModal, setShowOperationModal] = useState(false);
  const [selectedResourceName, setSelectedResourceName] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<"Create" | "Read">("Read");

  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [appVersions, setAppVersions] = useState<any[]>([]);
  const [selectedRollbackVersion, setSelectedRollbackVersion] = useState<string>("");
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [syncConflicts, setSyncConflicts] = useState<any[]>([]);

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const { selectedWorkflowName, selectedWorkflowId } = useWorkflowStore();
  const { rfInstance, nodes, edges } = useStore();

  const setAppMetaData = useAppMetaDataStore(
    (state) => state.setAppMetaData
  )

  const getNavbarObj = useNavSideBarStore((state) => state.getNavbarObj);
  const setNavbarObj = useNavSideBarStore((state) => state.setNavbarObj);
  const getSidebarObj = useNavSideBarStore((state) => state.getSidebarObj);
  const setSidebarObj = useNavSideBarStore((state) => state.setSidebarObj);
  const [navComp, setNavComp] = useState(getNavbarObj(appId))
  const [sidebarComp, setSidebarComp] = useState(getSidebarObj(appId))

  useEffect(() => {

    setNavComp(getNavbarObj(appId));
    setSidebarComp(getSidebarObj(appId));




    if (!selectedPage) {
      console.warn("selectedPage is undefined");
      return;
    }

    const updatedPages = new Map(allPages);
    const updatedPage = updatedPages.get(selectedPage);

    if (!updatedPage) {
      console.warn("No page found for:", selectedPage);
      return;
    }

    const pageUIItems = updatedPage.getPageUIItems();
    const updatedUIItems = { ...pageUIItems };

    updatedPage.updateUIItems(updatedUIItems);

    handlePageChange(selectedPage, selectedPage, updatedPage);

    updateBoardUIItems(updatedUIItems, selectedPage, appName);

  }, [])

  useEffect(() => {
    (async () => {
      try {
        const apps = await fetchApplications();
        setAllApplications(apps);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);
  const handleNavChange = (
    page: any,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    const pageName = page.getName();
    const appName = userInfo.getCurrentApplication()?.getName();

    // 🔹 Clone pages map
    const updatedPages = new Map(allPages);
    const updatedPage = updatedPages.get(pageName);
    if (!updatedPage) return;

    // 🔹 Update page model
    updatedPage.setHaveNavbar(checked);

    // 🔹 Get that page's UI items
    const pageUIItems = updatedPage.getPageUIItems();
    const updatedUIItems = { ...pageUIItems };

    if (checked) {

      console.log("selected navbar in the navbar", navComp);
      // const navObj = new SelectedNavbar();
      const navObj = navComp

      navObj?.setPath("root")
      console.log("selected navbar in the navbar ---", navObj, appId);
      updatedUIItems.root = [
        navObj,
        ...(updatedUIItems.root || [])
      ];
    } else {
      updatedUIItems.root = (updatedUIItems.root || []).filter(
        (item: any) => item.type !== "selectedNavbar"
      );
    }

    // 🔹 Save UI items to THAT page
    updatedPage.updateUIItems(updatedUIItems);

    // 🔹 SWITCH TO THAT PAGE (THIS IS THE KEY)
    handlePageChange(pageName, pageName, updatedPage);

    // 🔹 Render board for that page
    updateBoardUIItems(updatedUIItems, pageName, appName);

    // 🔹 Update state
    setAllPages(updatedPages);

  };




  const handleSidebarChange = (
    page: any,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    const pageName = page.getName();
    const appName = userInfo.getCurrentApplication()?.getName();

    const updatedPages = new Map(allPages);
    const updatedPage = updatedPages.get(pageName);
    if (!updatedPage) return;

    updatedPage.setHaveSidebar(checked);

    const pageUIItems = updatedPage.getPageUIItems();
    const rootItems = [...(pageUIItems.root || [])];

    const navbar = rootItems.find(
      (item: any) => item.type === "selectedNavbar"
    );

    // =================================
    // ✅ SIDEBAR ON
    // =================================
    if (checked) {
      const nonNavbarItems = rootItems.filter(
        (item: any) => item.type !== "selectedNavbar"
      );

      const flex: any = ElementFactory.createUIElement("flexContainer", "");
      // const sidebar: any = ElementFactory.createUIElement("selectedSidebar", "");
      const sidebar: any = sidebarComp;
      const content: any = ElementFactory.createUIElement("container", "");

      const newUIItems: any = { root: [], __source: pageUIItems };

      // navbar
      if (navbar) {
        navbar.setPath("root");
        newUIItems.root.push(navbar);
      }

      // flex container
      flex.setPath("root");
      newUIItems.root.push(flex);

      const flexPath = `root/container${flex.getId()}`;
      const contentPath = `${flexPath}/container${content.getId()}`;

      sidebar.setPath(flexPath);
      content.setPath(flexPath);

      newUIItems[flexPath] = [sidebar, content];
      newUIItems[contentPath] = [];

      // move ALL existing items (with children)
      nonNavbarItems.forEach((item: any) => {
        moveItemWithChildren(newUIItems, item, contentPath);
      });

      delete newUIItems.__source;

      updatedPage.updateUIItems(newUIItems);
      updateBoardUIItems(newUIItems, pageName, appName);
    }

    // =================================
    // ✅ SIDEBAR OFF (FULL RESTORE)
    // =================================
    else {
      let restoredItems: any[] = [];

      const flexContainer = rootItems.find(
        (item: any) => item.type === "flexContainer"
      );

      if (flexContainer) {
        const flexPath = `root/container${flexContainer.getId()}`;
        const flexChildren = pageUIItems[flexPath] || [];

        const contentContainer = flexChildren.find(
          (item: any) => item.isContainer?.()
        );

        if (contentContainer) {
          const contentPath = `${flexPath}/container${contentContainer.getId()}`;
          restoredItems = pageUIItems[contentPath] || [];
        }
      }

      const newUIItems: any = { root: [], __source: pageUIItems };

      if (navbar) {
        navbar.setPath("root");
        newUIItems.root.push(navbar);
      }

      restoredItems.forEach((item: any) => {
        moveItemWithChildren(newUIItems, item, "root");
      });

      delete newUIItems.__source;

      updatedPage.updateUIItems(newUIItems);
      updateBoardUIItems(newUIItems, pageName, appName);
    }

    handlePageChange(pageName, pageName, updatedPage);
    setAllPages(updatedPages);
  };


  const handleSaveWrapper = (userInfo: any, props: string, appId: string) => {
    updateUserInfo(
      userInfo.getCurrentApplication()?.getName(),
      userInfo.getCurrentPage()?.getName(),
      ui_items
    );
    handleDownload(userInfo, props, appId);
  }

  useEffect(() => {
    setAllPages(userInfo.getCurrentApplication()?.getPages() || new Map());
    console.log("check all pages", allPages)

  }, [myNewPage, allPages]);

  useEffect(() => {
    updateBoardUIItems(
      userInfo.getCurrentPage()?.getPageUIItems(),
      userInfo.getCurrentPage()?.getName(),
      userInfo.getCurrentApplication()?.getName()
    );
  }, [appName, selectedPage, selectedAppData]);

  useEffect(() => {
    console.log("app structure:", AppData[appIdx]);
    // deserlisation(AppData)

    console.log("user info after deserialisation: ", userInfo);
    updateUserInfo(
      selectedAppName,
      selectedPage,
      userInfo.getCurrentPage()?.getPageUIItems()
    );
  }, []);

  const handleAppChange = (appName: string) => {
    let allPagesOfSelectedApp = userInfo.getApplication(appName)?.getPages();
    const currApp = userInfo.getApplication(appName);
    console.log("Changed app in navbar curr App: ", currApp);

    const pages: any = userInfo.getApplication(appName)?.getPages();
    const currPage: any = Array.from(pages.values())[0];
    console.log("Changed app in navbar curr PAge: ", currPage);
    setAppName(appName);
    // setSelectedApp(appName);
    setAllPages(pages);

    const currAppName: any = currApp?.getName();
    const currPageName: any = currPage.getName();
    userInfo.setCurrentApplicationAndPage(currAppName, currPageName);

    handlePageChange('Page1', 'Page1')

    console.log(
      "userInfo when app changes currApp: ",
      userInfo.getCurrentApplication()
    );
    console.log(
      "userInfo when app changes currPage: ",
      userInfo.getCurrentPage()
    );
    console.log(
      "userInfo when app changes pageUIItems: ",
      userInfo.getCurrentPage()?.getPageUIItems()
    );
  };

  const handlePageChange = (pageName: string, pageKey: string, pageObj?: any) => {
    console.log("selected page name while changing tab", pageName)
    setSelectedPage?.(pageName);
    setSelectedEleByCT?.(null)
    setSelectedElement?.(null)
    // setPageEdit?.(false);

    const currPage = userInfo
      .getCurrentApplication()
      ?.getPages()
      ?.get(pageKey);
    userInfo.setCurrentPage(currPage);
    console.log("selected page: ", currPage?.getName(), pageObj, allPages.get(currPage?.getName()));
    // if(pageObj!==undefined && !pageObj.getHaveNavbar()){

    //   let updatedUIItems = { ...ui_items };
    //    if (updatedUIItems["root"]) {
    //      updatedUIItems["root"] = updatedUIItems["root"].filter((item) => item.type !== "selectedNavbar");
    //      setAllPages(userInfo.getCurrentApplication()?.getPages() || new Map());
    //      updateBoardUIItems(updatedUIItems, userInfo.getCurrentPage()?.getName(), userInfo.getCurrentApplication()?.getName());

    //  }
    // }
  };
  // useEffect(()=>{
  //   const currPageName:any =  userInfo.getCurrentPage()?.getName();
  //   updateUserInfo(
  //     userInfo.getCurrentApplication()?.getName(),
  //     userInfo.getCurrentPage()?.getName(),
  //     ui_items
  //   );
  //   handlePageChange(currPageName,currPageName)
  //   console.log("new user object after updateUserInfo in navbar",userInfo.getCurrentApplication()?.getName(),
  //     userInfo.getCurrentPage()?.getName(),
  //     ui_items);
  // },[])

  useEffect(() => {
    console.log(
      "pages in the navbar: ", userInfo.getApplication("App1")?.getPages()
    );
    allPages !== undefined &&
      Array.from(allPages.entries()).map(([key, value]) => {
        console.log("pages in the navbar each page: ", value.getName(), key, value.getPageUIItems()['root'][0]);
        if (value.getPageUIItems()['root'][0] !== undefined && value.getPageUIItems()['root'][0].getType() === 'selectedNavbar') {
          setNavbarObj(appId, value.getPageUIItems()['root'][0])
          if (value.getPageUIItems()['root'][1] !== undefined && value.getPageUIItems()['root'][1].getType() === 'flexContainer') {
            const flexObj = value.getPageUIItems()['root'][1];
            if (flexObj !== undefined) {

              const sidebarPath = `root/container${flexObj.getId()}`;
              if (value.getPageUIItems()[sidebarPath][0] !== undefined && value.getPageUIItems()[sidebarPath][0].getType() === "selectedSidebar") {
                setSidebarObj(appId, value.getPageUIItems()[sidebarPath][0])
              }
            }
          }
        } else {
          const flexObj = value.getPageUIItems()['root'][0];
          if (flexObj !== undefined) {

            const sidebarPath = `root/container${flexObj.getId()}`;
            if (value.getPageUIItems()[sidebarPath] !== undefined && value.getPageUIItems()[sidebarPath][0] !== undefined && value.getPageUIItems()[sidebarPath][0].getType() === "selectedSidebar") {
              setSidebarObj(appId, value.getPageUIItems()[sidebarPath][0])
            }
          }
        }
      })

    if (Object.keys(getNavbarObj(appId)).length === 0) {
      setNavbarObj(appId, new SelectedNavbar())

    }
    if (Object.keys(getSidebarObj(appId)).length === 0) {
      setSidebarObj(appId, new SelectedSidebar());
    }
  }, [appName, allPages, userInfo]);

  console.log("applications in navbar app by appname:", AppData[appIdx]);
  console.log("applications in navbar app by appname:", applications);
  console.log("selected App in context", appName);

  const handleGenerateResource = async () => {
    try {
      const data = await generateResource(appId);
      setGeneratedPath(data.message);
      console.log("Generated Path", data.message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to generate resource");
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      const data = await updateWorkflow(appId || '', selectedWorkflowId || '', selectedWorkflowName || '', rfInstance?.toObject() || {});
      if (data) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate workflow");
    }
  };

  const handleSyncApp = () => {
    setSyncError(null);
    setShowSyncModal(true);
  };

  const handleSyncSubmit = async (comment: string) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const result = await syncApplication(appId, false, comment);
      console.log("Application synced successfully:", result);
      toast.success("Changes synced successfully!");
      setShowSyncModal(false);
      setShowConflictModal(false);
      // setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      console.error("Error syncing application:", err);
      if (err.status === 409) {
        setShowSyncModal(false);
        setSyncConflicts(err.conflicts || []);
        setShowConflictModal(true);
      } else {
        setSyncError(err.message || "Sync failed. Please try again.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleForceSync = async () => {
    setIsResolving(true);
    setResolveError(null);
    try {
      const unitIds = syncConflicts.map((c: any) => c.unit_id || c.unitId);
      const result = await forceSyncApplication(appId, unitIds);
      console.log("Force sync successful:", result);
      toast.success("Your local changes have been applied!");
      setShowConflictModal(false);
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      console.error("Error performing force sync:", err);
      setResolveError(err.message || "Failed to apply changes. Please try again.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleSyncToServer = async () => {
    setIsResolving(true);
    setResolveError(null);
    try {
      const unitIds = syncConflicts.map((c: any) => c.unit_id || c.unitId);
      const result = await syncToServer(appId, unitIds);
      console.log("Sync to server (pull) successful:", result);
      toast.success("Server version applied successfully!");
      setShowConflictModal(false);
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      console.error("Error syncing to server:", err);
      setResolveError(err.message || "Failed to apply server version. Please try again.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleRollbackClick = async () => {
    try {
      const versions = await fetchApplicationVersions(appId || '');
      console.log("versions fetched", versions);
      setAppVersions(versions || []);
      setShowRollbackModal(true);
    } catch (err: any) {
      console.error("Error fetching versions:", err);
      alert(`Failed to fetch versions: ${err.message || "Unknown error"}`);
    }
  };

  const confirmRollback = async (version?: string) => {
    const targetVersion = version || selectedRollbackVersion;
    if (!targetVersion) return;

    setIsRollingBack(true);
    try {
      await rollbackApplication(appId || '', targetVersion);
      toast.success("Version restored successfully! Reloading…");
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      console.error("Error rolling back:", err);
      toast.error(`Failed to restore: ${err.message || "Unknown error"}`);
    } finally {
      setIsRollingBack(false);
      setShowRollbackModal(false);
    }
  };

  const handleGenerateWorkflow = async () => {
    const token: any = getCookieValue("jwt");
    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error("Invalid JWT token", error);
      return;
    }

    console.log("Decoded Token:", decodedToken);
    if (!nodes.length) return;

    console.log("Generating workflow...->", { nodes, edges });


    const workflowSpec: any = {
      workflow_id: selectedWorkflowId,
      version: "1.0",
      user_id: decodedToken.sub,
      name: selectedWorkflowName,
      invoker: "",
      nodes: [],
      edges: [],
    };

    // Identify Start and End
    const startNode = nodes.find((n) => n.data.type === "start");
    const endNode = nodes.find((n) => n.data.type === "end");
    const startID = startNode?.id || "";
    const endID = endNode?.id || "";

    // Extract Invoker
    if (startNode) {
      const inv = startNode.data.properties.find((p: any) => p.key === "invoker");
      if (inv) workflowSpec.invoker = inv.value;
    }

    /**
     * -----------------------------
     *   FIELD MAPPING FIXED HERE
     * -----------------------------
     */
    const buildFormFields = (formFields: any[]) => {
      if (!Array.isArray(formFields)) return [];

      return formFields.map((f: any) => {
        const base = {
          name: f.name,
          type: f.type || "string",
        };

        if (f.type === "dropdown" && Array.isArray(f.options)) {
          return { ...base, options: f.options };
        }

        return base;
      });
    };

    /**
     * FULL INPUT VALUE RESOLUTION
     */
    const resolveInputValue = (value: any, nodeId: string, inputName: string) => {
      if (!value) return "$interrupt.dict";

      // Condition inputs
      if (value?.isConditionInput === true) {
        if (value.leftField) {
          const fieldPath = value.jsonAttribute
            ? `${value.leftField}.${value.jsonAttribute}`
            : value.leftField;
          return `$${fieldPath} ${value.operator} ${value.rightValue}`;
        }
        return typeof value.value === "string" ? value.value : JSON.stringify(value.value || "");
      }

      // Direct entry
      if (value?.inputMode === "direct") {
        return value.directValue;
      }

      // Interrupt mapping
      if (value?.interrupt === "true") {
        return value.dataType === "dynamic_object"
          ? "$interrupt.dict"
          : "$interrupt.string";
      }

      // Config mapping
      if (value?.isConfigKey && value?.schemaKey) {
        return `$config.${value.schemaKey}`;
      }

      // Manual mapping to another node
      if (value?.source) {
        return value.source.startsWith("$") ? value.source : `$${value.source}`;
      }

      // Standard mapping from previous node
      const incoming = edges.find((e) => e.target === nodeId);
      if (incoming && incoming.source !== startID) {
        return `$${incoming.source}.form`;
      }

      return "$interrupt.dict";
    };

    /**
     * BUILD WORKFLOW NODES
     */
    workflowSpec.nodes = nodes
      .filter((n) => n.data.type !== "start" && n.data.type !== "end")
      .map((n) => {
        const props = [...(n.data.properties || []), ...(n.data.dynamicProperties || [])];

        const formFields = props.find((p: any) => p.key === "formFields")?.value || [];

        const rolesVal = props.find((p: any) => p.key === "roles")?.value;
        const roles = Array.isArray(rolesVal)
          ? rolesVal
          : typeof rolesVal === "string"
            ? rolesVal.split(",").map((r) => r.trim())
            : [];

        const rawInputs = n.data.inputs || {};
        const rawOutputs = n.data.outputs || {};

        const inputs = Object.entries(rawInputs).map(([key, value]: any) => {
          const isFormInput = key === "form" || value.dataType === "dynamic_object";

          const type =
            value.dataType === "dynamic_object"
              ? "dict"
              : value.dataType || "string";

          return {
            type,
            name: key,
            fields: isFormInput ? buildFormFields(formFields) : [],
            roles,
            value: resolveInputValue(value, n.id, key),
          };
        });

        const outputs = Object.entries(rawOutputs).map(([key, value]: any) => ({
          type: value.dataType === "dynamic_object" ? "dict" : value.dataType,
          name: key,
          roles,
        }));

        return {
          id: n.id,
          type: n.data.type,
          label: n.data.label,
          inputs,
          outputs,
        };
      });

    /**
     * EDGES
     */
    workflowSpec.edges = edges.map((e: any) => {
      const source = e.source === startID ? "__start__" : e.source === endID ? "__end__" : e.source;
      const target = e.target === startID ? "__start__" : e.target === endID ? "__end__" : e.target;

      if (Array.isArray(e.data?.conditional_nodes)) {
        return {
          from: source,
          to: {
            conditional_nodes: e.data.conditional_nodes.map((c: any) => ({
              condition: c.condition,
              node: c.node === startID ? "__start__" : c.node === endID ? "__end__" : c.node,
            })),
          },
        };
      }

      return { from: source, to: { nodes: [target] } };
    });

    console.log("Workflow Spec", workflowSpec);
    try {
      const data = await generateWorkflow(appId || '', selectedWorkflowId || '', workflowSpec);
      return data;
    } catch (error) {
      console.log(error);
    }

  };



  // When app or its pages load, reset counter properly
  useEffect(() => {
    if (allPages && allPages.size > 0) {
      // Get the highest existing "PageX" number
      const pageNames = Array.from(allPages.keys());
      const pageNums = pageNames
        .map(name => {
          const match = name.match(/Page(\d+)/i);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);

      const maxNum = pageNums.length > 0 ? Math.max(...pageNums) : 1;
      setPageCounter(maxNum + 1); // next available number
    } else {
      setPageCounter(2); // for brand new app
    }
  }, [allPages]);

  const handleCreatePage = async () => {
    // const newPageNum = allPages?.size ? allPages.size + 1 : 1;
    // const newPageName = `Page${newPageNum}`;
    const newPageName = `Page${pageCounter}`;

    try {
      //  Create new page 
      const createdPage = await createNewPage(appId ?? "", newPageName);
      console.log("New page created:", createdPage);

      //  Update local app state
      const pageObj = new RASPUIPage();
      pageObj.setId(createdPage.id);
      pageObj.setName(createdPage.pageName);
      pageObj.setPageNum(pageCounter);
      userInfo.getCurrentApplication()?.addPage(newPageName, pageObj);

      const updatedPages = userInfo.getCurrentApplication()?.getPages() || new Map();
      setAllPages(updatedPages);

      // Update dropdown instantly
      handlePageChange(newPageName, newPageName);

      // Re-fetch all pages to sync
      const pagesData = await fetchPagesByAppId(appId ?? "");
      setSelectedAppData(pagesData);
      // Increment counter for next time
      setPageCounter(prev => prev + 1);
      console.log(`Page '${newPageName}' added and synced successfully`);
    } catch (error) {
      console.error(" Error creating new page:", error);
      alert("Failed to create page. Please try again.");
    }
  };
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

  // React Query: fetch resources
  const {
    data: allResources = [],
    isLoading: isLoadingResources,
    error: resourcesError,
  } = useQuery({
    queryKey: ["resources", appId],
    queryFn: () => fetchResources(appId),
    enabled: !!appId,
  });


  const handleShowResourceList = () => {
    setShowResourceList(true);
  };



  const handleResource = (resourceName: string, index: number) => {
    // store selection
    setSelectedResourceName(resourceName);

    // default operation
    setSelectedOperation("Read");

    // open next modal
    setShowOperationModal(true);
  };

  // create a page for resource and calls addResourceToBoard to update the board
  const handleCreateResourcePage = async () => {
    if (!selectedResourceName) return;
    const newPageName = `Page${pageCounter}`;

    try {
      // 1Create the new page via backend
      const createdPage = await createNewPage(appId ?? "", newPageName);
      console.log("New Resource Page created:", createdPage);

      //  Create local page object (same as custom screen)
      const pageObj = new RASPUIPage();
      pageObj.setId(createdPage.id);
      pageObj.setName(createdPage.pageName);
      pageObj.setPageNum(pageCounter);
      userInfo.getCurrentApplication()?.addPage(newPageName, pageObj);

      // Update app state
      const updatedPages = userInfo.getCurrentApplication()?.getPages() || new Map();
      setAllPages(updatedPages);

      // Select the newly created page in dropdown
      handlePageChange(newPageName, newPageName);

      // Sync with backend pages again
      const pagesData = await fetchPagesByAppId(appId ?? "");
      setSelectedAppData(pagesData);

      //Increment counter for next new page
      setPageCounter(prev => prev + 1);

      console.log(`Resource Page '${newPageName}' created successfully.`);

      // await addResourceToBoard(selectedResourceName, appId || "", index, selectedOp);
      await addResourceToBoardNew(
        selectedResourceName,
        selectedOperation
      );

      console.log(` Resource '${selectedResourceName}' added to board.`);
    } catch (error) {
      console.error("Error creating resource page:", error);
      alert("Failed to create resource page. Please try again.");
    }
  };
  const getResourcesData = useResourceStore((state) => state.getResourcesData);
  const addResourceToBoardNew = async (
    resourceName: string,
    operation: "Create" | "Read"
  ) => {
    if (!appId) return;

    // 1️⃣ CREATE RESOURCE MODEL
    let resourceObj: ReadResource | CreateResource | null = null;

    if (operation === "Read") {
      resourceObj = new ReadResource();
      resourceObj.setResourceName(resourceName);
      resourceObj.setSelectedOp("Read");

      // load data for read
      const data = getResourcesData(appId)?.[resourceName] || [];
      (resourceObj as ReadResource).setData(data);
    }

    if (operation === "Create") {
      resourceObj = new CreateResource(resourceName);
    }

    if (!resourceObj) return;

    // 2️⃣ ADD RESOURCE ROOT TO BOARD
    addUIItem(
      resourceObj,
      "root",
      userInfo.getCurrentPage()?.getName(),
      userInfo.getCurrentApplication()?.getName()
    );

    // 3️⃣ HANDLE CREATE FORM (NESTED)
    if (operation === "Create") {
      await addCreateFormChildren(resourceObj as CreateResource, resourceName);
    }
  };

  const addCreateFormChildren = async (
    resourceObj: CreateResource,
    resourceName: string
  ) => {
    if (!appId) return;

    // Fetch resource metadata
    let matchedResource;
    try {
      const allResources = await fetchResources(appId);
      matchedResource = allResources.find(
        (r: any) =>
          r.resourceName.toLowerCase() === resourceName.toLowerCase()
      );
    } catch (err) {
      console.error("Failed to fetch resource metadata", err);
      return;
    }

    if (!matchedResource) return;

    const requiredFields = matchedResource.attributes.fieldValues.filter(
      (f: any) => f.name.toLowerCase() !== "id"
    );

    // Generate form definition (NEW UTILITY)
    const formDef = resourceObj.getFormDefinition(requiredFields);

    const resourcePath = `root/container${resourceObj.getId()}`;

    // Add children
    formDef.forEach(({ element, children }) => {
      addUIItem(
        element,
        resourcePath,
        userInfo.getCurrentPage()?.getName(),
        userInfo.getCurrentApplication()?.getName()
      );

      if (children?.length) {
        const childPath = `${resourcePath}/container${element.getId()}`;
        children.forEach((child) => {
          addUIItem(
            child,
            childPath,
            userInfo.getCurrentPage()?.getName(),
            userInfo.getCurrentApplication()?.getName()
          );
        });
      }
    });
  };



  // Duplicate Page
  const duplicatePage = () => {
    const newPage = new RASPUIPage();
    const newPageNum = allPages?.size !== undefined ? allPages.size + 1 : 1;
    const newPageName = `Page${newPageNum}`;
    newPage.setName(newPageName);
    newPage.setPageNum(newPageNum);
    setMyNewPage(newPage);
    userInfo.getCurrentApplication()?.addPage(newPageName, newPage);
    const currentPageUIItems: any = userInfo.getCurrentPageUIItems();

    let newPageUIItems: UIItems = newPage.clonePage(currentPageUIItems)
    newPage.setPageUIItems(newPageUIItems);

    handlePageChange(newPageName, newPageName);
    //serialise then traverse and update pageUIItems
    userInfo.getCurrentApplication()?.addPage(newPageName, newPage);

    handlePageChange(newPageName, newPageName);
    setshowToastDupPage(true);
    setTimeout(() => setshowToastDupPage(false), 3000)
  };

  // Edit Page Name
  // const handleEditPage = () => {
  //   setPageEdit?.(true);
  // };

  // redirect to dashboard
  const goHome = () => {
    setAppName("")
    navigate("/dashboard")
  }


  // Delete Page
  const handleDeletePage = async (applicationId: string, pageId: string) => {
    if (allPages.size <= 1) {
      notifyPageDeleteError();
      return;
    }

    console.log("app and page id", applicationId, pageId);
    if (!pageId) {
      console.warn("Cannot delete page, pageId is undefined!");
      return;
    }
    try {
      const response = await deletePage(applicationId, pageId);
      console.log("Delete API result:", response);

      if (response.message === "Page deleted successfully") {
        const currentApp = userInfo.getCurrentApplication();
        if (currentApp) {
          // cleanly remove page from local map
          currentApp.deletePage(pageId);
          setAllPages(new Map(currentApp.getPages()));
        }

        console.log(`Page ${pageId} deleted locally and in backend`);

        // optional re-fetch to sync with backend
        const refreshedPages = await fetchPagesByAppId(applicationId);
        setSelectedAppData(refreshedPages);
        setAllPages(refreshedPages.getPages ? refreshedPages.getPages() : new Map());
        // if current page is deleted, switch to another available page
        if (userInfo.getCurrentPage()?.getId() === pageId) {
          const firstPageEntry = userInfo
            .getCurrentApplication()
            ?.getPages()
            ?.values()
            .next().value;
          if (firstPageEntry) {
            handlePageChange(firstPageEntry.getName(), firstPageEntry.getName());
          }
        }
        console.log("all pages after delete is", allPages)
      }
    } catch (err) {
      console.error("❌ Error deleting page:", err);
      alert("Failed to delete page. Please try again.");
    }
  }
  return (
    <div>
      {/* header section */}
      <nav className="dashboard-nav navbar-layout py-1">
        {/* LEFT: app name / home */}
        <div className="nav-left d-flex align-items-center">
          {!isDB && (
            <div
              className="fw-bold cursor-pointer me-3 navbar-gradient-text app-name-text"
              onClick={() => goHome()}
            >
              {appName}
            </div>
          )}
          <div className="d-flex align-items-center">
            {allApplications.find(a => a.id === appId)?.isShared && (
              <div className="system-actions-wrapper">
                <button
                  className="system-btn system-btn-sync"
                  title="Sync with Central Server"
                  onClick={handleSyncApp}
                >
                  <i className="fa fa-refresh"></i>
                </button>
                <button
                  className="system-btn system-btn-rollback"
                  title="Rollback to Historical Version"
                  onClick={handleRollbackClick}
                >
                  <i className="fa fa-undo"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Data / Layout (absolutely centered) */}
        <div className="nav-center d-flex align-items-center nav-center-absolute">
          {!isDB && (
            <div className="shadow-lg">
              <ul className="nav nav-underline mb-0">
                {[
                  { type: "resource", icon: "fa-database", label: "Data", keyword: "resources", path: `/${appId}/resources` },
                  { type: "ui", icon: "fa-pencil-square-o", label: "Layout", keyword: "DragDrop", path: `/${appId}/DragDrop` },
                  { type: "workflow", icon: "fas fa-project-diagram", label: "workflow", keyword: "workflow", path: `/${appId}/workflow` },
                ].map(({ type, icon, label, keyword, path }) => (
                  <li className="nav-item" key={type}>
                    <a
                      className={`nav-link ${isActive(keyword) ? "active active-tab" : "text-white"}`}
                      onClick={(e) => {
                        e.preventDefault();
                        getAllGridData?.();
                        navigate(path);
                        const firstPageEntry = userInfo
                          .getCurrentApplication()
                          ?.getPages()?.entries().next().value;
                        if (firstPageEntry) {
                          const [firstKey, firstPage] = firstPageEntry;
                          handlePageChange(firstPage.getName(), firstKey);
                        }
                      }}
                    >
                      <i className={`fa ${icon} p-1`} aria-hidden="true"></i>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT: pages dropdown + actions (kept as normal flex, pushed to right) */}
        <div className="nav-right d-flex align-items-between w-auto  ">
          {!isDB && (
            <>
              {isDD && (
                <div className="dropdown me-3 page-dropdown ">
                  <button
                    className="btn dropdown-toggle navbar-gradient-text"
                    type="button"
                    id="pageDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fa fa-file mx-1"></i> {selectedPage}
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="pageDropdown">
                    <div className="text-white d-flex gap-1 " style={{ fontSize: '14px' }}>
                      <small>Navbar</small>
                      <small>Sidebar</small>
                    </div>
                    {allPages !== undefined &&
                      Array.from(allPages.entries()).map(([key, value]: [string, any]) => (
                        <li key={key} className="d-flex justify-content-between align-items-center">
                          <button
                            className="dropdown-item d-flex align-items-center"
                            onClick={() =>
                              value.getName() === "addNewPage"
                                ? handleCreatePage()
                                : handlePageChange(value.getName(), key, value)
                            }
                          >
                            <div className="d-flex gap-4  me-3">
                              <input className="form-check-input" role="switch" checked={value.getHaveNavbar()} onChange={(e) => handleNavChange(value, e)} type="checkbox" name="navbar" />
                              <input className="form-check-input" role="switch" checked={value.getHaveSidebar()} onChange={(e) => handleSidebarChange(value, e)} type="checkbox" name="sidebar" />
                            </div>
                            {value.getName()}
                          </button>
                          <i className="fa fa-edit me-3" onClick={() => setPageEdit?.(value.getName())}></i>
                          <i className="fa fa-trash me-3" onClick={() => handleDeletePage(appId ?? "", value.getId())}></i>
                        </li>
                      ))}
                    <li>
                      <button className="dropdown-item fw-bold d-flex align-items-center"
                        // onClick={handleCreatePage}
                        onClick={() => setShowModal(true)}
                      >
                        <i className="fa fa-plus me-2"></i>
                        Add New Page
                      </button>
                    </li>
                  </ul>
                </div>
              )}

              {/* <div className="actions-container  d-flex flex-column align-items-end  w-auto">
                {isDD && <DownloadSave handleDownload={handleDownload} duplicatePage={duplicatePage} />}
                {isResList && <GenerateResource handleGenerateResource={handleGenerateResource} />}
              </div> */}
              <div className="actions-container  d-flex flex-column align-items-end  w-auto">
                {isDD && <DownloadSave handleDownload={handleSaveWrapper} duplicatePage={duplicatePage} />}
                {isResList && <GenerateResource handleGenerateResource={handleGenerateResource} />}
                {isWorkflow && <SaveWorkflow handleSaveWorkflow={handleSaveWorkflow} handleGenerateWorkflow={handleGenerateWorkflow} />}

              </div>


            </>
          )}
        </div>
      </nav>

      {/* )} */}
      {/* </div> */}
      {/* </nav> */}


      <div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light" aria-label={undefined} />
      </div>

      {showToast && (
        <div
          className="toast-container position-fixed top-20 start-50 translate-middle p-3"
          style={{ zIndex: 1550 }}
        >
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
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
            <div className="toast-body text-success text-center">Resource Generated successfully! you can  download it from <a href={generatedPath}>{generatedPath}</a></div>
          </div>
        </div>
      )}

      {showToastDupPage && (
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
                onClick={() => setshowToastDupPage(false)}
              ></button>
            </div>
            <div className="toast-body text-success text-center">
              Current Page Duplicated to {userInfo.getCurrentPage()?.getName()}
            </div>
          </div>
        </div>
      )}


      {/* modal for selection of type of screen  */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-dark">
                  {showResourceList ? "Select a Resource" : "Create New Page"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setShowResourceList(false);
                  }}
                ></button>
              </div>

              <div className="modal-body">
                {!showResourceList ? (
                  <>
                    <p>Select the type of page you want to create:</p>
                    <div className="d-flex flex-column gap-3">
                      <button
                        className="btn primary-btn"
                        onClick={() => {
                          handleCreatePage();
                          setShowModal(false);
                        }}
                      >
                        Custom Screen
                      </button>
                      <button
                        className="btn secondary-btn"
                        onClick={handleShowResourceList}
                      >
                        Resource Screen
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {resourcesError && (
                      <p className="text-danger">Error loading resources</p>
                    )}
                    {allResources.length === 0 && (
                      <p>No resources found.</p>
                    )}

                    {allResources.length > 0 && (
                      <div className="list-group">
                        {allResources.map((res: any, index: number) => (
                          <button
                            key={res.resourceName}
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              handleResource(res.resourceName, index);
                              setShowModal(false);
                              setShowResourceList(false);
                            }}
                          >
                            {res.resourceName}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* modal for resource data and the editing the resource operatiom */}
      {showOperationModal && selectedResourceName && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Configure Resource</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOperationModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Resource Name</label>
                  <div className="bg-light border rounded p-2">
                    {selectedResourceName}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Select Operation</label>
                  <select
                    className="form-select"
                    value={selectedOperation}
                    // onChange={(e) => {
                    //   const newOp = e.target.value;
                    //   selectedResourceObj.setSelectedOp(newOp);

                    //   // local re-render
                    //   setSelectedResourceObj(
                    //     Object.assign(Object.create(Object.getPrototypeOf(selectedResourceObj)), selectedResourceObj)
                    //   );

                    // }}
                    onChange={(e) =>
                      setSelectedOperation(e.target.value as "Create" | "Read")
                    }
                  >
                    {/* {selectedResourceObj.getOpName().map((op: string, i: number) => (
                      <option key={i} value={op}>
                        {op}
                      </option>
                    ))} */}
                    <option value="Read">Read</option>
                    <option value="Create">Create</option>
                  </select>

                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowOperationModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  // onClick={async () => {
                  //   setShowOperationModal(false);
                  //   await handleCreateResourcePage(
                  //     selectedResourceObj.getResourceName(),
                  //     allResources.findIndex(
                  //       (r: any) => r.resourceName === selectedResourceObj.getResourceName()
                  //     ),
                  //     selectedResourceObj.getSelectedOp() //  pass it!
                  //   );
                  // }}
                  onClick={async () => {
                    await handleCreateResourcePage();
                    setShowOperationModal(false);
                  }}
                >
                  Set Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Comment Modal */}
      <SyncModal
        isOpen={showSyncModal}
        isSyncing={isSyncing}
        syncError={syncError}
        onClose={() => { setShowSyncModal(false); setSyncError(null); }}
        onSync={handleSyncSubmit}
      />

      {/* Version History Modal */}
      {showRollbackModal && (
        <VersionHistoryModal
          versions={appVersions}
          currentBaseVersion={allApplications.find(a => a.id === appId)?.baseVersion?.toString()}
          isRestoring={isRollingBack}
          onClose={() => setShowRollbackModal(false)}
          onRestore={(version) => confirmRollback(version)}
        />
      )}

      {/* Sync Conflict Modal */}
      {showConflictModal && (
        <ConflictModal
          conflicts={syncConflicts}
          isResolving={isResolving}
          resolveError={resolveError}
          onKeepLocal={handleForceSync}
          onUseServer={handleSyncToServer}
          onClose={() => { setShowConflictModal(false); setResolveError(null); }}
        />
      )}
    </div>
  );
};

export default Navbar2;
