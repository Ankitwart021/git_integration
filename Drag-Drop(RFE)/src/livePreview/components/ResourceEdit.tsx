

import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useResourceStore } from "../../store/useResourceStore";
import { fetchResources } from "../../api/resources";
import { generateCreateFormUI, getAppIdFromUrl } from "../../utils/utils";
import ElementFactory from "../../models/ElementFactory";
import { renderToStaticMarkup } from "react-dom/server";
import Navbar from "./Navbar";
import './Navbar.css'
// import './ResourceEdi  t.css'

type UIMap = {
  [path: string]: any[];
};

const ResourceEdit = () => {
//   const { appId }: any = useParams();
const appId = getAppIdFromUrl();
const updateDataToResource = useResourceStore((state) => state.updateDataToResource);
  const getSelectedResourceNameForEdit =
    useResourceStore((state) => state.getSelectedResourceForEdit);
  const selectedResource = getSelectedResourceNameForEdit();
  const [uiItemsForEdit, setUiItemsForEdit] = useState<UIMap>({});
  const [renderedUI, setRenderedUI] = useState<React.ReactNode>(null);
  const location = useLocation();
  const [currSelectedData, setCurrSelectedData] = useState<any>(location.state?.rowData || null);
  const [selectedValue,setSelectedValue] = useState()
  /* ---------------- ADD UI ITEM ---------------- */
  const addUIItem = (ui_item: any, path: string) => {
    setUiItemsForEdit((prev) => {
      const updated = { ...prev };

      if (!updated[path]) updated[path] = [];

      ui_item.setPath(path);
      updated[path] = [...updated[path], ui_item];

      if (ui_item.isContainer() || ui_item.isListingContainer()) {
        const newPath = `${path}/container${ui_item.getId()}`;
        if (!updated[newPath]) updated[newPath] = [];
      }

      return updated;
    });
  };

  /* ---------------- CREATE UI MAP ---------------- */
  const createUIItemsMap = async () => {
    console.log("createUIItemMappp",selectedResource);
    if (!selectedResource) return console.error("No selected resource for edit");
const obj:any = ElementFactory.createUIElement(
        "resource-operation",
        {itemType:"resource-operation",
       operation:'Create',
        resourceName:selectedResource.getResourceName(),
}
      );
    const resourceName = selectedResource.getResourceName();

    // Root container
    addUIItem(obj, "root");

    let matchedResource;
    try {
      const allResources = await fetchResources(appId);
      matchedResource = allResources.find(
        (r: any) =>
          r.resourceName.toLowerCase() === resourceName.toLowerCase()
      );
    } catch (e) {
      console.error(e);
      return;
    }

    if (!matchedResource) return;

    const requiredFields =
      matchedResource.attributes.fieldValues.filter(
        (f: any) => f.name.toLowerCase() !== "id"
      );
      console.log("all the required fields", requiredFields);

    // const formDef = obj.generateCreateFormUI(resourceName, requiredFields);
    const formDef = obj.getFormDefinition( requiredFields);
console.log("my uiElement on createfieldddddd" ,formDef);
    const rootPath = `root/container${obj.getId()}`;

    formDef.forEach(({ element, children }: any) => {
      addUIItem(element, rootPath);

      if (children?.length) {
        const childPath = `${rootPath}/container${element.getId()}`;
        children.forEach((child: any) => {
          addUIItem(child, childPath);
        });
      }
    });
    console.log("createUIItemMappp uiitems", uiItemsForEdit);
  };
const handleClick = () => {
    console.log("data send to store",currSelectedData);
    updateDataToResource(appId,selectedResource.getResourceName(),currSelectedData);
}
  const handleChange = (e: any) => {    
    const { name, value } = e.target;
    console.log("Input changed in ResourceEdit:", name, value);
    setCurrSelectedData((prev:any)=>({
        ...prev,
        [name]:value,
    }));
  }
const handleDropdownItemClick = (e: any, item: any) => {
  const value = e.target.value || e.target.innerText;

  // ✅ Update form data (THIS was missing)
  setCurrSelectedData((prev: any) => ({
    ...prev,
    [item.name]: value,
  }));

  // Optional local state if you still need it
  setSelectedValue(value);

  item.setText(value);

  console.log("dropdown in the edit click in the live preview", item, value);
};



const traverseUIItems = (path: string): React.ReactNode => {
  const items = uiItemsForEdit[path];
  if (!items) return null;

  return items.map((item: any) => {
    if (item.isContainer() || item.isListingContainer()) {
      const childPath = `${path}/container${item.getId()}`;
      return (
        <div
          key={item.getId()}
          id={item.getId()}
          className={item.getClasses()}
        >
          {traverseUIItems(childPath)}
        </div>
      );
    }

    let element = item.getHtml();

    // INPUT (text, date, file all come here)
    if (
      React.isValidElement(element) &&
      typeof element.type === "string" &&
      element.type === "input"
    ) {
      return React.cloneElement(
        element as React.ReactElement<
          React.InputHTMLAttributes<HTMLInputElement>
        >,
        {
          key: item.getId(),
          name: item.name,
          value: currSelectedData?.[item.name] ?? "",
          onChange: handleChange,
        }
      );
    }

    // BUTTON
    if (
      React.isValidElement(element) &&
      typeof element.type === "string" &&
      element.type === "button"
    ) {
      return React.cloneElement(
        element as React.ReactElement<
          React.ButtonHTMLAttributes<HTMLButtonElement>
        >,
        {
          key: item.getId(),
          onClick: handleClick,
        }
      );
    }

    // DROPDOWN
// if (
//   item.getType?.() === "dropdown"
// ) {
//   const selectedValue = currSelectedData?.[item.name];

//   if (selectedValue !== undefined) {
//     item.setText(selectedValue);
//   }
//   console.log("dddddddd",selectedValue);
//   if(!item.getIsForeignKey()){
//    item.prepare();
//   }
//    element = item.getHtml();

  
// }


if (item.getType?.() === "dropdown") {
  const selectedValueFromTable = currSelectedData?.[item.name];

  // ✅ Only update text if value actually changed (prevents render loop)
  if (
    selectedValueFromTable !== undefined &&
    item.getText?.() !== selectedValueFromTable
  ) {
    item.setText(selectedValueFromTable);
  }

  if (!item.getIsForeignKey()) {
    item.prepare();
  }

  element = item.getHtml();

  // ✅ Attach click handler
  if (React.isValidElement(element)) {
    element = React.cloneElement(
      element as React.ReactElement<any>,
      {
        onClick: (e: any) => handleDropdownItemClick(e, item),
      }
    );
  }
}


    return (
      <React.Fragment key={item.getId()}>
        {element}
      </React.Fragment>
    );
  });
};

useEffect(()=>{
    console.log("allllll rendered html",currSelectedData,renderToStaticMarkup(renderedUI));
},[renderedUI])
  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    createUIItemsMap();
  }, []);

  useEffect(() => {
    if (Object.keys(uiItemsForEdit).length > 0) {

      setRenderedUI(traverseUIItems("root"));
    }
  }, [uiItemsForEdit]);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="p-4 bg-dark ">
      <Navbar/>
    <div className={`Board border border-3 border-light p-4 shadow-lg rounded bg-white `}>
      
      <h2>Edit resource page</h2>
      {/* {renderedUI} */}
      {traverseUIItems("root")}
    </div>
    </div>
  );

//   return (
//   <>
//     <Navbar />

//     {/* Dark background overlay */}
//     <div className="edit-page-overlay">
//       {/* Centered edit card */}
//       <div className="edit-page-container">
//         <h2 className="mb-4">Edit resource</h2>
//         {traverseUIItems("root")}
//       </div>
//     </div>
//   </>
// );

};

export default ResourceEdit;
