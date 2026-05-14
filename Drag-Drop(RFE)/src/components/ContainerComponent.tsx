
/**
 * ContainerComponent
 * ------------------
 *
 * What it does:
 *  - Renders a container UI element that can hold and display nested UI elements (including other containers).
 *  - Supports drag-and-drop to add new UI elements or custom components into the container.
 *  - Handles recursive rendering of nested containers and UI elements.
 *  - Integrates with board context for state management and user interactions (hover, selection).
 *  - Fetches and renders custom components when dropped.
 *  - uses the ElementFactory.createUIElement to create new containers
 *  - uses the ElementFactory.deserialiseUIElement  to get the saved element from  the database that is in the form of an object.
 *
 * Where it is used:
 *  - Ultimately rendered in the main board area of the `DropBoard` component (`src/components/DropBoard.tsx`), which is used in the `DragDrop` page (`src/components/DragDrop.tsx`).
 *
 * Parameters:
 * @param {UIElement} item - The container UI element to render.
 * @param {function} handleClick - Callback for handling click/selection of the container.
 * @param {string} userId - The current user's ID (used for fetching custom components).
 * @param {UIElement|null} selectedElement - The currently selected UI element.
 * @param {UIElement|null} selectedEleByCT - The currently selected element from the CollectionTree.
 *
 * Returns:
 * @return {JSX.Element} The rendered container div, including all nested UI elements and containers. Also handles drag-and-drop functionality and custom component rendering.
 */
import { useContext } from "react";
import { useDrop } from "react-dnd";
import ElementFactory from "../models/ElementFactory";
import BoardContext from "../context/boardContext";
import UIElementComponent from "./UIElementComponent";
import UIElement from "../models/UIElement";
import { renderToStaticMarkup } from "react-dom/server";
import UserInfoContext from "../context/userContext";
import Input from "../models/Input";
import DropDown from "../models/DropDown";
import Button from "../models/Button";
import InputCalender from "../models/InputCalendar";
import FileUpload from "../models/FileUpload";
import apiConfig from "../config/apiConfig";
import { fetchCustomComponentById } from "../api/customComponents";
import ReadResource from "../models/ReadResource";
import { useResourceStore } from "../store/useResourceStore";
import NavigationService from "../models/NavigationService";
import CreateResource from "../models/CreateResource";
import { fetchResources } from "../api/resources";

const ContainerComponent = ({ item, handleClick, userId, selectedElement, selectedEleByCT }: any) => {
  const { board: { ui_items }, addUIItem, hoveredItemId } = useContext(BoardContext);
  const { userInfo } = useContext(UserInfoContext);
  const isHovered = hoveredItemId === item.getId(); // Check if this item is hovered

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
        const containerId = deserializedObject.getId();

        console.log("fetch custom component containerId:", serializedJsonObj);
        // const nestedPathForCC = `${serializedJsonObj.path}/container${serializedJsonObj.uniqueId}`;
        // const nestPathForBoard = `${deserializedObject.getPath()}/container${deserializedObject.getId()}`;
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

  // get custom component
  // const fetchCustomComponent = async (
  //   userId: string | undefined,
  //   componentName: string
  // ) => {
  //   const res = await fetch(
  //     `${apiConfig.API_BASE_URL}/customComponent/${userId}/${componentName}`,
  //     {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //     }
  //   );
  // //     if(res.status === 401){
  // //   window.location.href = apiConfig.LOGIN_URL;
  // // }
  //   console.log("fetch custom component res", res);
  //   const response: any = await res.json();
  //   console.log("fetch custom component res cc", response.customComponent);
  //   return response.customComponent;
  // };

  const handleFetchCustomComponent = async (componentId: string) => {
    try {
      const data = await fetchCustomComponentById(componentId);
      return data;
    } catch (error) {
      console.error(" Error fetching custom component:", error);
    }
  };
  // add item to board
  // const addItemToBoard = async (droppedItem: any) => {
  //   console.log("Item droppeddd: ", droppedItem);

  //   if (droppedItem.parent?.header === "CustomComponents") {
  //     console.log("Item dropped: bbbbbbbbbbb");
  //     console.log("fetch custom component");
  //     const customComponent = await handleFetchCustomComponent(
  //       // userId,
  //       // '46438fb8-a4f1-4f07-8410-024669ffbe50',
  //       // userInfo.getUserId(),
  //       // currUserID,
  //       // droppedItem.itemType
  //       droppedItem.parent.elementIds[0]
  //     );
  //     console.log("fetch custom component xxxxxx:", customComponent);
  //     const myCCHtml = traverseCustomComponent(
  //       customComponent.componentContent,
  //       `root`,
  //       `${item.getPath()}/container${item.getId()}`
  //     );

  //     console.log(
  //       "fetch custom component obj after setting html: ",
  //       renderToStaticMarkup(myCCHtml)
  //     );
  //   } else {
  //     const obj = ElementFactory.createUIElement(droppedItem.itemType, droppedItem);
  //     console.log('item dropped inside the container after clone', obj, ui_items, item);


  //     // if (item.isResource()) {
  //     //   const isAllowedType =
  //     //     obj instanceof Input ||
  //     //     obj instanceof DropDown ||
  //     //     obj instanceof Button ||
  //     //     obj instanceof InputCalender ||
  //     //     obj instanceof FileUpload;

  //     //   if (!isAllowedType) {
  //     //     alert("This element is not allowed inside the resource container.");
  //     //     return;
  //     //   }

  //     //   const resourceName = item.getResourceName?.();
  //     //   obj.setBoundResourceName?.(resourceName);

  //     //   // If dropped from an attribute (i.e., fromResource), bind field name
  //     //   if (droppedItem.fromResource && droppedItem.fieldName) {
  //     //     obj.setBoundFieldName?.(droppedItem.fieldName);

  //     //     if (obj instanceof Input || obj instanceof InputCalender) {
  //     //       obj.setPlaceholder?.(droppedItem.fieldName);
  //     //     } else if (obj instanceof DropDown) {
  //     //       obj.setText?.(droppedItem.fieldName);
  //     //       const options = droppedItem.field?.possible_value?.split(",") || [];
  //     //       obj.setItems?.(options);
  //     //     } else if (obj instanceof FileUpload) {
  //     //       obj.setFileUploadLabel?.(`Upload file for ${droppedItem.fieldName}` || droppedItem.fieldName);
  //     //     }
  //     //   }

  //     //   console.log("Bound to resource and field:", resourceName, droppedItem?.fieldName);
  //     // }
  //     addUIItem(
  //       obj,
  //       `${item.getPath()}/container${item.getId()}`,
  //       userInfo.getCurrentPage()?.getName(),
  //       userInfo.getCurrentApplication()?.getName()
  //     );
  //     console.log('item dropped inside the container after clone', ui_items);
  //   }
  // };

   const getResourcesData = useResourceStore((state) => state.getResourcesData);
   const appId = userInfo.getCurrentApplication()?.getId();

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
             `${item.getPath()}/container${item.getId()}`,
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
             `${item.getPath()}/container${item.getId()}`,
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
          const formDef = obj?.getFormDefinition(requiredFields);
  
          const rootPath = `${item.getPath()}/container${item.getId()}/container${obj.getId()}`;
          console.log("path for create-root", rootPath);
  
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
              console.log("path for create -child",childPath)
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
        // console.log("UUUUUUUUUUU:", user.userId);
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
          `${item.getPath()}/container${item.getId()}`,
          userInfo.getCurrentPage()?.getName(),
          userInfo.getCurrentApplication()?.getName()
        );
      }
    };

  const [{ isOverBoard }, dropBoard] = useDrop(() => ({
    accept: "text",
    drop: (droppedItem, monitor) => {
      if (!monitor.didDrop()) {
        addItemToBoard(droppedItem);
      }
    },
    collect: (monitor) => ({
      isOverBoard: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropBoard}
      onClick={(e) => {
        e.stopPropagation();
        handleClick(item);
      }}
      className={`${item.getClasses()} 
        ${item === (selectedElement || selectedEleByCT) ? "border border-2 border-danger" : ""} 
        ${isHovered ? "border border-2 border-dark" : ""}`}// Add blue border on hover
      style={{
        ...item.getStyles(), // Spread existing styles from item.getStyles()
      }}
    >
      {ui_items[`${item.getPath()}/container${item.getId()}`] &&
        ui_items[`${item.getPath()}/container${item.getId()}`].map(
          (element: UIElement, idx: any) => {
            return element.isContainer() ? (
              <ContainerComponent
                selectedElement={selectedElement}
                selectedEleByCT={selectedEleByCT}
                item={element}
                key={idx}
                handleClick={handleClick}
                userId={userId}
              />
            ) : (
              <UIElementComponent
                selectedElement={selectedElement}
                selectedEleByCT={selectedEleByCT}
                item={element}
                key={idx}
                handleClick={handleClick}
              />
            );
          }
        )}
      {isOverBoard ? "OverContainer" : ""}
    </div>
  );
};

export default ContainerComponent;
