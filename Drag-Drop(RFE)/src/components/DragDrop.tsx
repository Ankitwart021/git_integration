/**
 * DragDrop Component
 * ------------------
 *
 * What it does:// make more specific
 *  - Provides a drag-and-drop interface for building and editing application pages.
 *  - Integrates with the application's context to manage user-specific and app-specific data.
 *  - Provides the main drag-and-drop UI builder interface for creating and editing application pages.
 *  - Renders the sidebar (Accordian), main board (DropBoard), and editing panels (Edits, EditPage).
 *  - Manages selection, editing, and context for UI elements and pages.
 *  - Integrates with user and app context for personalized and app-specific editing.
 *
 * Where it is used:
 *  - Registered as a route in `src/App.tsx` at path `/DragDrop`.
 *  - Serves as the main editor page for building and customizing app layouts.
 *
 * @param {string} userId - The current user's ID (used for context and API calls).
 * @param {string} userName - The current user's name (used for display/context).
 *
 * @return {JSX.Element} The rendered drag-and-drop editor UI, including sidebar, board, and editing panels.
 */
import './DragDrop.css';
import React, { useContext, useEffect, useState } from "react";
import DropBoard from "./DropBoard";
import Edits from "./Edits";
import UIElement from "../models/UIElement";
import Accordian from "./Accordian";
import { DashboardProps } from "./Dashboard1";
import Navbar2 from "./Navbar2";
import { useAppContext } from "../context/appContext";
import EditPage from "./EditPage";
import UserInfoContext from "../context/userContext";
import { useApplicationContext } from "../context/applicationContext";
import { useParams } from "react-router-dom";
import { getCookieValue } from "../utils/utils";
import { deserialize } from "v8";
import { useFetchAppContext } from "../api/useFetchAppContext"
import Collection from "../models/Collection";
import { userAppMetaData } from "../hooks/useAppMetaData";
import Navbar from '../livePreview/components/Navbar';


const DragDrop: React.FC<DashboardProps> = () => {
  const { appId }:any = useParams();

  userAppMetaData(appId);
  
  const fetchAppContext = useFetchAppContext();


  const { allApps, currentIndex, appName, setAppName } = useAppContext();
  const { selectedAppData, setSelectedAppData, selectedAppName, setSelectedAppName, selectedAppDescription, setSelectedAppDescription } = useApplicationContext();

  const { userInfo,deserlisation } = useContext(UserInfoContext)

  const [selectedElement, setSelectedElement] = useState<UIElement | null>(null);
  const [selectedEleByCT, setSelectedEleByCT] = useState<UIElement | null>(null);
  const [activeElement, setActiveElement] = useState<UIElement | null>(null);
  // const [selectedPage, setSelectedPage] = useState(selectedAppData[0].pageName);
  const [selectedPage, setSelectedPage] = useState<string>(
    selectedAppData?.[0]?.pageName || ""
  );
  const [pageEdit, setPageEdit] = useState<string | null>(null);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);
const [isFullScreen, setIsFullScreen] = useState(false);
  const handleDeselect = () => {
    setSelectedElement(null);
    setSelectedEleByCT(null);
  };


  useEffect(() => {
    // Only refetch if context is empty (i.e., user refreshed)
    if (!selectedAppData || selectedAppData.length === 0) {
    fetchAppContext(appId || "");
    }
    else{
    const firstPageName:any = userInfo.getCurrentPage()?.getName();
      setSelectedPage(firstPageName)
      console.log("data in the dragdrop for the page selection dropboard component loaded",firstPageName);
   
  }
    // console.log("data in the dragdrop for the page selection dataaaa", data);
  }, [appId]);
  useEffect(()=>{

  },[])

  useEffect(() => {
    if (activeElement || pageEdit) {
      setIsRightPanelVisible(true);
    } else {
      setIsRightPanelVisible(false);
    }
  }, [activeElement, pageEdit]);

  // useEffect(()=>{
  //   if(activeElement?.getType() === 'collection'){
  //     const x = activeElement as Collection;
  //   x.loadDataFromStore(x.getResourceType());
  //   setActiveElement(x);
  //   console.log("my current active element",x)
  //   }
  // },[activeElement])
  
    // Exit fullscreen on ESC
  useEffect(() => {
    const handleEsc = (e:any) => {
      if (e.key === "Escape") {
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);


  useEffect(() => {
  if (!selectedPage && selectedAppData?.length > 0) {
    setSelectedPage(selectedAppData[0].pageName);
  }
}, [selectedAppData]);


  useEffect(() => {
    setActiveElement(selectedElement || selectedEleByCT || null);
  }, [selectedElement, selectedEleByCT]);

  useEffect(() => {
    const firstPageEntry = userInfo
      .getCurrentApplication()
      ?.getPages()
      ?.entries()
      .next().value

    if (firstPageEntry) {
      const [firstKey, firstPage] = firstPageEntry
      setSelectedPage(firstPage.getName())
    }
  }, [])

  const handleSelectElement = (element: UIElement) => {
    setSelectedElement(element);
    setIsRightPanelVisible(true);
    console.log("selected element when i clicked on it", element);
    console.log("selected element when i clicked on it", selectedElement);
  };

  const handleCloseRightPanel = () => {
    setIsRightPanelVisible(false);
  };

  const handleClosePageEdit = () => {
    setPageEdit(null);
    setIsRightPanelVisible(false);
  };

  console.log("all data in dragdrop", selectedPage, selectedAppName, selectedAppData,);

  return (
    <div className="dashboard-root">
      {selectedAppData && selectedAppData.length > 0 && (
        <div className={`navbar-div ${isFullScreen ? "hide" : ""}`}>

          <Navbar2
            setSelectedElement={setSelectedElement}
            setSelectedEleByCT={setSelectedEleByCT}
            // userId={userId}
            AppData={selectedAppData}
            appIdx={currentIndex}
            appName={selectedAppName}
            setAppName={setSelectedAppName}
            // userName={userName}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            setPageEdit={setPageEdit}
          />
        </div>
      )}
      <div className="d-flex p-1">
        <div className={`left-panel p-1 sidebar-div ${isFullScreen ? "hide" : ""}`}>
          <Accordian
            userId={userInfo.getUserId()}
            userName={userInfo.getUserName()}
            selectedAppName={selectedAppName}
            handleSelectElement={handleSelectElement}
            setSelectedEleByCT={setSelectedEleByCT} />
        </div>
        <div className={`d-flex  flex-column center-panel content-div ${isFullScreen ? "fullscreen bg-dark" : ""}`}>
          {/* <div className='d-flex justify-content-end '>

            <i  onClick={() => setIsFullScreen(!isFullScreen)} className={`fullscreen-btn rounded bg-dark  p-2 fa ${isFullScreen ? " fa-solid fa-compress fa-sm" : "fa-solid fa-expand fa-sm"} `}></i>
          </div> */}
        
            {/* {isFullScreen ? "Exit Fullscreen" : "Go Fullscreen"} */}
      <Navbar setIsFullScreen={setIsFullScreen} isFullScreen={isFullScreen} />
      
          <DropBoard
            selectedElement={selectedElement}
            selectedEleByCT={selectedEleByCT}
            setSelectedEleByCT={setSelectedEleByCT}
            handleSelectElement={handleSelectElement}
          // userId={userId}
          />
        </div>
        {isRightPanelVisible && (
          <div className="right-panel">
            {pageEdit && (<EditPage
              // selectedPage={selectedPage}
              // setSelectedPage={setSelectedPage}
              pageToEdit={pageEdit}
              setPageToEdit={setPageEdit}
              setSelectedPage={setSelectedPage}
              handleClose={handleClosePageEdit}
            />)}
            {activeElement && (
              <Edits
                // userId={userId}
                AppData={selectedAppData}
                appIdx={currentIndex}
                activeElement={activeElement}
                setActiveElement={handleDeselect}
                selectedPage={selectedPage}
                setSelectedPage={setSelectedPage}
                handleClose={handleCloseRightPanel}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DragDrop;
