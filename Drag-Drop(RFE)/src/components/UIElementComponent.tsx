/**
 * UIElementComponent
 * ------------------
 *
 * What it does:
 *  - Renders a single UI element on the board with its styles and classes.
 *  - Supports drag-and-drop functionality for moving the element.
 *  - Handles click and hover events for selection and visual feedback.
 *
 * Where it is used:
 *  - Used by the `DropBoard` component to render non-container UI elements on the main board.
 *  - Appears in the drag-and-drop UI builder (`DragDrop` page).
 *
 * @param {object} item - The UI element instance to render.
 * @param {function} handleClick - Callback to handle selection/click of the element.
 * @param {object} selectedElement - The currently selected UI element.
 * @param {object} selectedEleByCT - The currently selected element from the CollectionTree.
 *
 * @return {JSX.Element} The rendered UI element with drag, click, and hover support.
 */

import React, { useContext, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import BoardContext from "../context/boardContext";
import { useResourceStore } from "../store/useResourceStore";
import { useParams } from "react-router-dom";

const UIElementComponent = ({ item, handleClick, selectedElement,selectedEleByCT, }: any) => {
  const { hoveredItemId,dataToSaveInStore,setDataToSaveInStore } = useContext(BoardContext);
  const {appId}:any = useParams(); 
  const isHovered = hoveredItemId === item.getId();
  const element = item.getStyledHtml(); // Assuming this returns a JSX element
  const addDataToResource = useResourceStore((state) => state.addDataToResource);
  const setSelectedResourceForEdit = useResourceStore((state) => state.setSelectedResourceForEdit);

  const elementOnChange = (e: any) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value);

    if(item.getType()==='fileupload'){
      //"C:\\fakepath\\AmanKumar_Resume.png"
      const val = value.split('\\');
      const fileName = val[val.length - 1];
      console.log("file upload changed:", name, fileName);
      setDataToSaveInStore((prev:any) => ({
         ...prev,
         [item.getBoundResourceName()]:{
           ...prev[item.getBoundResourceName()],
           [name]:fileName || "",
         },
       }));
    }
    if(item.getType()==='input'||item.getType()==='inputCalendar'){

      setDataToSaveInStore((prev:any) => ({
         ...prev,
         [item.getBoundResourceName()]:{
           ...prev[item.getBoundResourceName()],
           [name]:value || "",
         },
       }));
    }
  }
  const elementClick = (e: any) => {
    console.log("tttttt--", item.getType());
    e.stopPropagation();
    handleClick(item);
    if(item.getType()==='read-resource'||item.getType()==='collection'){

      // setCurrentSelectedView(item);
      // console.log("currentSelectedView--", item);
      setSelectedResourceForEdit(item)

    }
    if(item.getType()==='button'){
      console.log("button clicked");

      const dataToSave = dataToSaveInStore[item.getBoundResourceName()] || {};
      console.log("dataToSave before button action:", dataToSave,dataToSaveInStore,item.getBoundResourceName(),appId);
      setDataToSaveInStore((prev:any) => ({
        ...prev,
        [item.getBoundResourceName()]:{},
      }));
      addDataToResource(appId??"",item.getBoundResourceName(), {...dataToSave, id: crypto.randomUUID()})
    }
    if(item.getType()==='dropdown'){
      console.log("dropdown clicked",item.getText(),item.getName(),item.getBoundResourceName());
      
      const dataToSave = dataToSaveInStore[item.getBoundResourceName()] || {};
      setDataToSaveInStore((prev:any) => ({
        ...prev,
        [item.getBoundResourceName()]:{
          ...prev[item.getBoundResourceName()],
          [item.getName()||'']:item.getText(),
        },
      }) );
      // addDataToResource(appId??"",item.getBoundResourceName(), {...dataToSave, id: crypto.randomUUID()})
    }
  };
  const [dataToSave, setDataToSave] = useState<{ [key: string]: any }>({});
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "text",
    item: { item: item },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(()=>{
    console.log("dataToSave changed in UIElementComponent:",dataToSaveInStore);
  },[ dataToSaveInStore])
  
  return (
    <div   >
   
{React.cloneElement(element, {
  key: item.getId(),
  className: `${item.getClasses()} 
    ${item === (selectedElement || selectedEleByCT) ? "border border-2 border-danger" : ""} 
    ${isHovered ? "border border-2 border-dark" : ""}`,
  onClick: elementClick,
  onChange: elementOnChange,
})}
    </div>
  );
};

export default UIElementComponent;
