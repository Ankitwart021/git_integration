/**
 * DropBoard Component
 * -------------------
 *
 * What it does:
 *  - Renders the main board area for the drag-and-drop UI builder.
 *  - Handles dropping new UI elements, custom components and resources onto the board.
 *  - Manages and renders all UI elements and containers for the current page.
 *  - Integrates with board and user for state and updates.
 *  - Updates user info with the latest board state on changes.
 *  - On getting the custom component, it checks the component type and fetches the custom component from the server.
 *  - Traverses the custom component structure to render nested elements and containers.
 *  - Renders the regular UI elements such as input, buttons, drop-down, etc.(This different from container elements)
 *  - Renders the containers that can hold other UI elements or nested containers.
 *  - Uses the elementFactory.createElement to create a new ui element for the page and display on the drop board.
 *  - Uses the elementFactory.deserialiseUIElement this is used to get saved ui elements from the database
 *
 * Where it is used:
 *  - Used as the main board area in the `DragDrop` page (`src/components/DragDrop.tsx`).
 *  - Registered as a route in `App.tsx` at `/DragDrop`.
 *
 * Parameters:
 * @param {UIElement | null} selectedElement - The currently selected UI element.
 * @param {UIElement | null} selectedEleByCT - The currently selected element from the CollectionTree.
 * @param {function} setSelectedEleByCT - Callback to set the selected element from the tree.
 * @param {function} handleSelectElement - Callback to handle selection logic for an element.
 * @param {string | undefined} userId - The current user's ID (used for fetching custom components).
 *
 * Returns:
 * @return {JSX.Element} The rendered board area with all UI elements and containers.
 */
import React, { useContext, useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import ElementFactory from "../models/ElementFactory";
import BoardContext from "../context/boardContext";
import ContainerComponent from "./ContainerComponent";
import UIElementComponent from "./UIElementComponent";
import UIElement from "../models/UIElement";
import { renderToStaticMarkup } from "react-dom/server";
import { LoginContext } from "../context/login-context";
import UserInfoContext from "../context/userContext";
import apiConfig from "../config/apiConfig";
import { getCookieValue } from "../utils/utils";
import { fetchCustomComponentById } from "../api/customComponents";
import Resource from "../models/Resources";
import { fetchResources } from "../api/resources";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../models/Input";
import DropDown from "../models/DropDown";
import Button from "../models/Button";
import InputCalender from "../models/InputCalendar";
import FileUpload from "../models/FileUpload";
import ReadResource from "../models/ReadResource";
import { useResourceStore } from "../store/useResourceStore";
import CreateResource from "../models/CreateResource";
import NavigationService from "../models/NavigationService";

interface DropBoardProps {
  selectedElement: UIElement | null;
  selectedEleByCT: UIElement | null;
  setSelectedEleByCT: any;
  handleSelectElement: (element: any) => void;
  // userId: string | undefined; // Add the userId prop
}

const DropBoard: React.FC<DropBoardProps> = ({
  selectedElement,
  selectedEleByCT,
  setSelectedEleByCT,
  handleSelectElement,
  // userId,
}) => {
  const navigate = useNavigate();
  const { appId } = useParams();
  const { board, addUIItem } = useContext(BoardContext);
  const ui_items = board?.ui_items || { root: [] };
  const { userInfo, updateUserInfo,deserlisation } = useContext(UserInfoContext);
  const { user, setUser, isLoggedIn, setIsLoggedIn } = useContext(LoginContext);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(()=>{
NavigationService.setNavigate(navigate)
// if (ui_items) {
//       updateUserInfo(
//         userInfo.getCurrentApplication()?.getName(),
//         userInfo.getCurrentPage()?.getName(),
//         ui_items
//       );
      console.log("new user object after updateUserInfo in dropboard", userInfo.getCurrentPage()?.getName());
//       // console.log("new user object after updateUserInfo", userInfo);
//     }
  },[])
  useEffect(() => {
    if (ui_items) {
      updateUserInfo(
        userInfo.getCurrentApplication()?.getName(),
        userInfo.getCurrentPage()?.getName(),
        ui_items
      );
      console.log("new user object after updateUserInfo", userInfo);
    }
  }, [ui_items]);

  useEffect(() => {
    (async () => {
      try {
        const resources = await fetchResources(appId);
        setResources(resources);
      } catch (err) {
        console.error(err);
      }
    })();
  
  }, [appId]);

  // const fetchCustomComponent = async (
  //   userId: string | undefined,
  //   componentId: string
  // ) => {
  //   console.log("componentId in dropboard:", componentId);
  //   const token = getCookieValue("jwt");
  //   if (!token) {
  //     alert('No JWT found in cookies!');
  //     return;
  //   }
  //   const res = await fetch(
  //     `${apiConfig.API_BASE_URL}/customComponents/component/${componentId}`,
  //     {
  //       method: "GET",
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`, // send JWT in header
  //       },
  //       credentials: "include",
  //     }
  //   );
  //   //     if(res.status === 401){
  //   //   window.location.href = apiConfig.LOGIN_URL;
  //   // }
  //   console.log("fetch custom component res", res);
  //   const data = await res.json(); 
  //   console.log("fetch custom component res cc", data);
  //   return data;
  // };

  const handleFetchCustomComponent = async (componentId: string) => {
    try {
      const data = await fetchCustomComponentById(componentId);
      return data;
    } catch (error) {
      console.error(" Error fetching custom component:", error);
    }
  };
  const traverseCustomComponent = (
    serialized_ui_items: any,
    pathForCC: string,
    pathForBoard: string
  ) => {
    // replaceId(path,item.get(item.uniqueId),)
    console.log("fetch custom component TRAVERSE CC:", serialized_ui_items);
    console.log("fetch custom component TRAVERSE CC path:", pathForCC);
    const elements = serialized_ui_items[pathForCC] || [];
    console.log("fetch custom component ELEMENT:", elements);
    return elements.map((item: any) => {
      console.log("fetch custom component gethtml:", item);
      const serializedJsonObj = JSON.parse(item);

      const deserializedObject: any = ElementFactory.deserialiseUIElement(item);

      addUIItem(
        deserializedObject,
        pathForBoard,
        userInfo.getCurrentPage()?.getName(),
        userInfo.getCurrentApplication()?.getName()
      );
      console.log("fetch custom component CC_Object:", deserializedObject);

      const elementDiv = deserializedObject.getHtml();
      console.log(
        "fetch custom component obj_html:",
        deserializedObject?.getHtml()
      );

      if (
        deserializedObject.isContainer() ||
        deserializedObject.isListingContainer()
      ) {
        console.log("fetch custom component containerId:", serializedJsonObj);
        const nestedPathForCC = `${pathForCC}/container${serializedJsonObj.uniqueId}`;
        const nestPathForBoard = `${pathForBoard}/container${deserializedObject.getId()}`;
        console.log("fetch custom component nestedPath:", nestedPathForCC);

        const nestedDiv: any = traverseCustomComponent(
          serialized_ui_items,
          nestedPathForCC,
          nestPathForBoard
        );
        return (
          <div
            id={deserializedObject.getId()}
            className={deserializedObject.getClasses()}
          >
            {nestedDiv}
          </div>
        );
      }

      return elementDiv;
    });
  };
  const getResourcesData = useResourceStore((state) => state.getResourcesData);

  const addItemToBoard = async (droppedItem: any) => {
    console.log("Item droppeddd:", droppedItem);
    if (droppedItem.itemType === "resource-operation") {
      const obj = ElementFactory.createUIElement(
        "resource-operation",
        droppedItem
      );
      if (obj instanceof ReadResource) {
        const resourceName = obj.getResourceName();
        if (!resourceName) return;
        obj.setData(getResourcesData(appId ?? "")[resourceName] || []);
        
        if (appId) NavigationService.setAppId(appId);
        addUIItem(
          obj,
          "root",
          userInfo.getCurrentPage()?.getName(),
          userInfo.getCurrentApplication()?.getName()
        );
      }
      else if (obj instanceof CreateResource) {
        const resourceName = obj.getResourceName();
        if (!resourceName) return;

        //  Add CreateResource ROOT
        addUIItem(
          obj,
          "root",
          userInfo.getCurrentPage()?.getName(),
          userInfo.getCurrentApplication()?.getName()
        );

        // Fetch resource metadata
        let matchedResource;
        try {
          const allResources = await fetchResources(appId);
          matchedResource = allResources.find(
            (r: any) =>
              r.resourceName.toLowerCase() === resourceName.toLowerCase()
          );
        } catch (err) {
          console.error("Failed to fetch resources on drop", err);
          return;
        }

        if (!matchedResource) return;

        const requiredFields = matchedResource.attributes.fieldValues.filter(
          (f: any) => f.name.toLowerCase() !== "id"
        );

        //  Generate form definition
        const formDef = obj.getFormDefinition(requiredFields);

        const rootPath = `root/container${obj.getId()}`;

        //  Attach form elements
        formDef.forEach(({ element, children }) => {
          addUIItem(
            element,
            rootPath,
            userInfo.getCurrentPage()?.getName(),
            userInfo.getCurrentApplication()?.getName()
          );

          if (children?.length) {
            const childPath = `${rootPath}/container${element.getId()}`;
            children.forEach(child => {
              addUIItem(
                child,
                childPath,
                userInfo.getCurrentPage()?.getName(),
                userInfo.getCurrentApplication()?.getName()
              );
            });
          }
        });
      }



    }
    else if (droppedItem.parent.header === "CustomComponents") {
      console.log("Item dropped: bbbbbbbbbbb");
      console.log("fetch custom component");
      console.log("UUUUUUUUUUU:", user.userId);
      const customComponent = await handleFetchCustomComponent(
        // currUser,
        // userInfo.getUserId(),
        droppedItem.id
      );
      console.log("fetch custom component xxxxxx:", customComponent);

      let componentUIItems = customComponent.componentContent;

      let startingPathOfCC = Object.keys(componentUIItems)[0]

      const myCCHtml = traverseCustomComponent(
        componentUIItems,
        'root',
        "root"
      );

      console.log(
        "fetch custom component obj after setting html: ",
        renderToStaticMarkup(myCCHtml)
      );
    }
  
    else {
      const obj:any= ElementFactory.createUIElement(droppedItem.itemType, droppedItem);
      // const dummyObj= obj instanceof  ElementFactory.createElement('input') 
      // obj.setOnChange()
      console.log("Input Data in input model", obj);

      addUIItem(
        obj,
        "root",
        userInfo.getCurrentPage()?.getName(),
        userInfo.getCurrentApplication()?.getName()
      );
    }
  };

  const [{ isOverBoard }, dropBoard] = useDrop(() => ({
    accept: "text",
    /*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Handles a drop event on the board.
     * If the drop event is not a reuse of a previous drop event, it adds the dropped item to the board.
     * @param {object} droppedItem - The item being dropped onto the board.
    /*******  e98b368d-f964-4618-b594-6667a820d562  *******/
    drop: (droppedItem, monitor) => {
      if (!monitor.didDrop()) {
        addItemToBoard(droppedItem);
      }
    },
    collect: (monitor) => ({
      isOverBoard: !!monitor.isOver(),
    }),
  }));

  const handleClick = (item: any) => {
    setSelectedEleByCT(null);
    console.log("Clicked: ", item);
    handleSelectElement(item); // Call the function to select the item
  };

  return (
    <div
      className={`Board border border-3 border-light p-4 shadow-lg rounded bg-white `}
      // style={{display:"block", height:'800px', width:"100%",overflow:'scroll'}}
      style={{
        display: "block",
        height: "100vh",  // Full viewport height
        width: "100%",
        // overflowY: "hidden", // Prevent scrolling on the parent div
        overflowY: "scroll"
      }}
      ref={dropBoard}
    >
      {ui_items?.["root"] &&
        ui_items["root"].map((item: UIElement, idx: any) => {
          return (item.isContainer()) ? (
            <ContainerComponent
              selectedElement={selectedElement}
              selectedEleByCT={selectedEleByCT}
              item={item}
              handleClick={handleClick}
              key={idx}
              userId={userInfo.getUserId()}
            />
          ) : (
            <UIElementComponent
              selectedElement={selectedElement}
              selectedEleByCT={selectedEleByCT}
              item={item}
              handleClick={handleClick}
              key={idx}
            
            />
          );
        })}
      {isOverBoard ? "Overboard" : ""}
    </div>
  );
};

export default DropBoard;
