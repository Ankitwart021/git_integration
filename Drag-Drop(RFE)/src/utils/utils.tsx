import { toast } from "react-toastify";
import UIElement from "../models/UIElement";
import apiConfig from "../config/apiConfig";
import { saveThenDownloadApp } from "../api/saveThenDownload";
import { saveApp } from "../api/saveApplication";
import { downloadApp } from "../api/downloadApplication";

import Input from "../models/Input";
import DropDown from "../models/DropDown";
import FileUpload from "../models/FileUpload";
import InputCalendar from "../models/InputCalendar";
import Button from "../models/Button";
import ElementFactory from "../models/ElementFactory";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";




export type UIElementListType = {
  id: any;
  type: any;
  html: any;
};

// --- Helper: extract userId from JWT in cookies ---
export const getUserIdFromJWT = (): string | null => {
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
export const stringToClasses = (classString: any) => {
  return classString.split(/\s+/).join(" ");
};
export const findPathById = (ui_items: Record<string, UIElement[]>, id: string): string => {
  for (const [path, items] of Object.entries(ui_items)) {
    if (items.some((el) => el.uniqueId === id)) {
      return path;
    }
  }
  return "root";
};



export const stringToStyles = (cssString: any) => {
  const styles: any = {};
  cssString.split("\n").forEach((line: any) => {
    let [key, value] = line.split(":").map((item: any) => item.trim());

    // Handle backgroundImage case to avoid splitting within the url
    if (key === "backgroundImage") {
      // Keep the rest of the line after the colon as the value
      value = line.substring(line.indexOf(":") + 1).trim();
    }

    if (key && value) {
      styles[key] = value.replace(";", "");

    }
  });
  return styles;
};

export const stylesToString = (styles: any) => {
  console.log("first styles: ", typeof styles === "object");
  return Object.entries(styles)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n");

};
export const getDynamicMethod = (selectedElement: any, property: any) => {
  const methodName = `get${property}`;
  return selectedElement[methodName]?.(); // Call the method dynamically based on selectedProperty
};
let ccCounter = 0;

export const getNextCCId = () => {
  console.log("Counter: ", counter);
  counter++;
  return "cc-" + ccCounter.toString(36).toUpperCase(); // Ensure it's 4 characters
};
let counter = 0;

export const getNextId = () => {
  console.log("Counter: ", counter);
  counter++;
  return "id-" + counter.toString(36).toUpperCase(); // Ensure it's 4 characters
};


const notifyDownload = () => toast.success("Application Downloaded successfully");
const notifySave = () => toast.success("Application Saved successfully");
const notifyDownloadAndSave = () => toast.success("Application Downloaded and Saved successfully");
export const notifyPageDeleteError = () => toast.error("An application must have at least one page.");
export const notifyCustomComponentDeleted = () => toast.success("Custom component deleted successfully");

const saveFile = async (response: Response, fileName: string) => {
  try {
    if (!("showDirectoryPicker" in window)) {
      throw new Error("Your browser does not support the Directory Picker API.");
    }

    // Ask the user to select a directory
    const dirHandle = await (window as any).showDirectoryPicker();

    // Create a file inside the chosen directory
    const fileHandle = await dirHandle.getFileHandle(`${fileName}.zip`, { create: true });
    const writable = await fileHandle.createWritable();

    // Write the downloaded ZIP file into the selected folder
    const blob = await response.blob();
    await writable.write(blob);
    await writable.close();

    alert("File has been saved successfully!");
  } catch (error) {
    console.error("Error saving file:", error);
  }
};


export const handleDownload = async (userInfo: any, props: string, appId: string) => {


  let app = userInfo.getCurrentApplication();
  console.log("current app to send", app);
  let parentJson: any = app?.serialise();
  console.log("parent json", parentJson);

  const parentJsonObj = JSON.parse(parentJson);
  // const appjson = [parentJsonObj];
  const appjson = parentJsonObj;
  console.log("appjson", appjson);

  // try {
  //   let response;
  //   if (props === "save&download") {
  //     const token = getCookieValue("jwt");
  //     if (!token) {
  //       alert('No JWT found in cookies!');
  //       return;
  //     }
  //     response = await fetch(`http://localhost:8000/api//save-then-download/${appId}`, {
  //       method: "POST",
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`, // send JWT in header
  //       },
  //       body: JSON.stringify( appjson ),
  //       credentials: "include",
  //     });
  //     // if(response.status === 401){
  //     //   window.location.href = apiConfig.LOGIN_URL;
  //     // }
  //     if (response.ok) {

  //       await saveFile(response, appjson.application.name);
  //       notifyDownloadAndSave();
  //     } else {appId
  //       console.error("Failed to download the zip file");
  //     }
  //   } else if (props === "save") {
  //     const token = getCookieValue("jwt");
  //     if (!token) {
  //       alert('No JWT found in cookies!');
  //       return;
  //     }
  //     response = await fetch(`http://localhost:8000/api/saveApp/${appId}`, {
  //       method: "PUT",
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`, // send JWT in header
  //       },
  //       body: JSON.stringify( appjson ),
  //       credentials: "include",
  //     });
  //     // if(response.status === 401){
  //     //   window.location.href = apiConfig.LOGIN_URL;
  //     // }
  //     if (response.ok) {
  //       notifySave();
  //     }
  //   } else if (props === "download") {
  //     const token = getCookieValue("jwt");
  //     if (!token) {
  //       alert('No JWT found in cookies!');
  //       return;
  //     }
  //     response = await fetch(`http://localhost:8000/api/download/${appId}`, {
  //       method: "POST",
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`, // send JWT in header
  //       },
  //       // body: JSON.stringify({
  //       //   content: JSON.stringify({
  //       //     name: appjson.application.name
  //       //     // loginPageId: appjson[0].loginPageId,
  //       //   }),
  //       // }),
  //       credentials: "include",
  //     });
  //     // if(response.status === 401){
  //     //   window.location.href = apiConfig.LOGIN_URL;
  //     // }
  //     if (response.ok) {
  //       await saveFile(response, appjson.application.name);
  //       notifyDownload();
  //     } else {
  //       console.error("Failed to download the zip file");
  //     }
  //   }
  // } catch (error) {
  //   console.error("Error occurred during file download:", error);
  // }


  try {
    let response;
    if (props === "save&download") {
      response = await saveThenDownloadApp(appId, appjson);
      // await saveFile(response, appjson.application.name);
      await saveFile(response, appId);
      notifyDownloadAndSave();
    } else if (props === "save") {
      console.log("appJson to save",appjson);
      await saveApp(appId, appjson);
      notifySave();
    } else if (props === "download") {
      response = await downloadApp(appId);
      await saveFile(response, appjson.application.name);
      notifyDownload();
    }
  } catch (error) {
    console.error("Error during save/download:", error);
  }
};


export const getAppIdFromUrl1 = (): any  => {
const {appId} = useParams()  
return appId ; 

}

export function getCookieValue(name: string) {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find(row => row.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
}


export function getAppIdFromUrl(): any {
  if (typeof window === "undefined") return null; // SSR-safe
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length > 0 ? parts[0] === 'dashboard' ? parts[1] : parts[0] : null // e.g. /f56da6fd-38 → "f56da6fd-38' : null; // first segment = appId
}


export function createFieldUIElement(field: any, resourceName: string) {
  console.log("all items in dropdown html field ",field);
  let uiType = "";
  if (field.type === "Date") uiType = "inputCalendar";
  else if (field.is_enum || field.foreign_field || field.type === "Boolean") {
    uiType = "dropdown";
  }
  else if (field.is_file) uiType = "fileupload";
  else if (field.type === "String" || field.type === "Long") uiType = "input";
  else return null;

  const container = ElementFactory.createUIElement("container", {
    itemType: "container",
  });
  container?.setClasses("d-flex flex-column mb-3 w-100");

  const label = ElementFactory.createUIElement("addText", { itemType: "label" });
  if (label) {
    if (label && "setText" in label) label?.setText(`${field.name}${field.required ? " *" : ""}`);
    label?.setClasses("fw-bold mb-1");
  }
  const uiElement = ElementFactory.createUIElement(uiType, { itemType: uiType });
  if (!uiElement) return null;

  if('setName' in uiElement){
    uiElement.setName(field.name);
    console.log("my uiElement on createfield", field,resourceName,uiElement);
  }
  // Safe type-narrowing
  if ("setBoundFieldName" in uiElement) {
    uiElement.setBoundFieldName(field.name);
  }


  if ("setPlaceholder" in uiElement) {
    uiElement.setPlaceholder?.(field.name);
  }
  
  console.log("added items",field,uiElement);
  if ("setItems" in uiElement && field.possible_value) {
    uiElement.setItems?.(field.possible_value.split(","));
   
  }

  if ("setFileUploadLabel" in uiElement && field.is_file) {
    uiElement.setFileUploadLabel?.(`Upload ${field.name}`);
  }

  if ("setText" in uiElement) {
    uiElement.setText(field.name); 
  }
  if("setBoundResourceName" in uiElement){
    uiElement.setBoundResourceName(resourceName);
  }
  if(!field.is_enum && field.foreign_field){

    (uiElement as DropDown).setBoundResourceName(field.foreign);
    (uiElement as DropDown).setIsForeignKey(true);
    (uiElement as DropDown).setBoundResourceName(resourceName);
    (uiElement as DropDown).setForeignResourceName(field.foreign);
    (uiElement as DropDown).prepare();
    // console.log("all items in dropdown html field",uiElement,field,resourceName);
  }
  if(field.is_enum){
  
  // (uiElement as DropDown).setBoundResourceName(resourceName);
  console.log("all items in dropdown html field",uiElement,field,resourceName);
  (uiElement as DropDown).prepare();
  (uiElement as DropDown).setBoundFieldName(field.possible_value);
  if ("setIsEnum" in uiElement) {
    (uiElement as DropDown).setIsEnum(true);
  }
  // (uiElement as DropDown).setBoundFieldName(field.name);
  // if ("setBoundResourceName" in uiElement) {
    // }
  }
  //  const boolItems = ['true','false'];
  if(field.type==="Boolean"){
     if ("setIsEnum" in uiElement) {
       (uiElement as DropDown).setIsEnum(false);
     }
     if ("setIsForeignKey" in uiElement) {
       (uiElement as DropDown).setIsForeignKey(false);
     }
  }
    
  return { container, label, uiElement };
}

export interface GeneratedFormElement {
  element: UIElement;
  children?: UIElement[];
}

export function generateCreateFormUI(
  resourceName: string,
  requiredFields: any[]
): GeneratedFormElement[] {
  const elements: GeneratedFormElement[] = [];

  // (A) Title
  const title = ElementFactory.createUIElement("addText", "");
  if (title) {
    if ("setText" in title) {
      title.setText(resourceName);
    }
    if ("setClasses" in title) {
      title.setClasses("fw-bold fs-3");
    }
    elements.push({ element: title });
  }

  // (B) Fields
  requiredFields.forEach(field => {
    const fieldElements = createFieldUIElement(field, resourceName);
    if (!fieldElements) return;

    const { container, label, uiElement } = fieldElements;
    if (!container) return;

    const children: UIElement[] = [];
    if (label) children.push(label);
    if (uiElement) children.push(uiElement);

    elements.push({
      element: container,
      children,
    });
  });

  // (C) Submit
  const submit = ElementFactory.createUIElement("button", "");
  if (submit) {
    console.log("my submit btn", submit,resourceName);
      if ("setBoundResourceName" in submit) {
    submit.setBoundResourceName(resourceName);
  }
    if ("setText" in submit) submit.setText?.("Submit");
    if ("setApi" in submit) submit.setApi?.(`/api/${resourceName}`);
    elements.push({ element: submit });
  }

  return elements;
}



