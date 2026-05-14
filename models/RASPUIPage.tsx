import React, { isValidElement, useContext } from "react";
// import { UIItems } from "../context/board-context";
import UIElement from "./UIElement";
import Container from "./Container";
import ToDoListingContainer from "./ToDoListingContainer";
import InputCalender from "./InputCalendar";
import ElementFactory from "./ElementFactory";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import FlightListingContainer from "./FlightListingContainer";
import Table from "./Table";
import Resource from "./Resources";
import Button from "./Button";
import Collection from "./Collection";
import { data } from "cheerio/dist/commonjs/api/attributes";
import CreateResource from "./CreateResource";
import ReadResource from "./ReadResource";
import SelectedNavbar from "./SelectedNavbar";
import SelectedSidebar from "./SelectedSidebar";
// import UserInfoContext from "../context/userContext";


export type UIItems = {
  [key: string]: any[];
};
export type DataToReturnType = {
  apisMap: Map<any, any>; // Replace 'any' with specific types if known
  compsMap: Map<any, any>; // Replace 'any' with specific types if known
  styleMap: Map<any, any>;
  resourceMap: Map<any, any>;
  operationMap: Map<any, any>;
  attrMapp: Map<any, any>;
  viewModeMap: Map<any, any>;
  pageUIItems: UIItems // Use the actual type of 'pageUIItems'
};



export default class RASPUIPage {
  private name: string;
  private pageNum: number;
  private pageUIItems: UIItems;

  constructor() {
    this.name = "";
    this.pageNum = 1;
    this.pageUIItems = { root: [] };
  }

  private serialisePageUIItemsMap: Map<string, any[]> = new Map();
  private styleMap: any = new Map();
  private apisMap: any = new Map();
  private componentMap: any = new Map();
  private operationMap: any = new Map();
  private attrMap: any = new Map();
  private traversePageUIItems(pageUIItems: UIItems, path: string): any {
    console.log("page UIItems", pageUIItems)
    let elements = pageUIItems[path];
    elements.map((item: any, idx) => {
      if (!isValidElement(item.getHtml())) {
        console.log("Invalid React Element: ", item.getHtml());
      }

      if (this.serialisePageUIItemsMap.get(path) === undefined) {
        this.serialisePageUIItemsMap.set(path, []);
      }

      const serializedObject = item.serialise();

      this.styleMap.set(item.getId(), item.getStyles());

      if (item.isListingContainer() || item.isTable()) {
        this.apisMap.set(item.getId(), item.getApi());
        this.componentMap.set(item.getId(), item.getComponentName())
      }

      console.log("sssssselected nav sidebar", item, this.componentMap);
      if (item.getType() === 'selectedNavbar' || item.getType() === 'selectedSidebar') {
       this.componentMap.set(item.getId(), item.getType())


      }

      if (item instanceof InputCalender) {
        this.componentMap.set(item.getId(), item.getComponentName());
      }
      console.log("custom view map", item)
      if (item.isCustomView()) {
        this.componentMap.set(item.getId(), item.getType());
        this.apisMap.set(item.getId(), item.getResourceType());
        this.operationMap.set(item.getId(), item.getViewMode());

        // this.componentMap.set(item.getId(),item.getType());
        this.attrMap = item.getAttrMapp();
      }
      console.log("my serialized obj", serializedObject);

      // addUIItemCC(item,traversingPath,serializedObject)
      if (item.isContainer() || item.isListingContainer()) {
        this.serialisePageUIItemsMap.set(
          `${path}/container${item.getId()}`,
          []
        );
        this.traversePageUIItems(pageUIItems, `${path}/container${item.getId()}`)
      }
      item.setPath(path);

      const itemsArr: any = this.serialisePageUIItemsMap.get(path);
      itemsArr.push(serializedObject);
      console.log("ccccccccc", this.serialisePageUIItemsMap.get(path));
      // this.serialisePageUIItemsMap.set(path,serializedObject)
    });
    // return this.serialisePageUIItemsMap;
    return Object.fromEntries(this.serialisePageUIItemsMap);
  }



  // public getHtml(path:string):string{

  //   let elements = this.pageUIItems[path];

  //   return elements.map((eleObj:UIElement,idx:number)=>{
  //      // Check if the element is valid
  //      if (!isValidElement(eleObj.getHtml())) {
  //       console.log("Invalid React Element: ", eleObj.getHtml());
  //   }

  //   let itemHtml:any = eleObj.getHtml();
  //   // itemHtml = React.cloneElement(itemHtml,{
  //   //   id:eleObj.getId(),
  //   //   className:eleObj.getClasses()
  //   // })


  //   let eleHtmlString = renderToStaticMarkup(itemHtml);


  //   console.log("Each item divs in string format",eleHtmlString)



  //   if(eleObj.isContainer() || eleObj.isListingContainer()){

  //     console.log("getting inside the container")

  //     let containerHtml = this.getHtml(`${eleObj.getPath()}/container${eleObj.getId()}`);
  //     return `<div id="${eleObj.getId()}" className="${eleObj.getClasses()}" >${containerHtml}</div>`

  //   }
  //   return eleHtmlString;




  //   })
  //   .join("");

  // }

  //serialize page

  public getHtml(path: string): string {
    let elements = this.pageUIItems[path];

    return elements.map((eleObj: UIElement, idx: number) => {
      // Check if the element is valid
      if (!isValidElement(eleObj.getHtml())) {
        console.log("Invalid React Element: ", eleObj.getHtml());
      }

      let itemHtml: any = eleObj.getHtml();

      // Extract the onClick handler if it exists
      const props = itemHtml.props || {};
      const onClick = props.onClick;

      // Get the HTML representation
      let eleHtmlString = renderToString(itemHtml);

      // If it's a button with onClick, we need to modify the rendered HTML to include the handler
      // if (eleObj instanceof Button && onClick) {
      //   // Extract the function body to preserve it
      //   let onClickFuncStr = onClick.toString();

      //   // For navigation functions like () => navigate('/Page3')
      //   // Find the opening button tag and replace it with one that includes the onClick in React syntax
      //   eleHtmlString = eleHtmlString.replace('<button', `<button onClick={${onClickFuncStr}}`);
      //   // eleHtmlString = eleHtmlString.replace('<button', `<button onClick=${onClickFuncStr}`);
      // }

      console.log("Each item divs in string format", eleHtmlString);

      if (eleObj.isContainer() || eleObj.isListingContainer()) {
        console.log("getting inside the container");
        let containerHtml = this.getHtml(`${eleObj.getPath()}/container${eleObj.getId()}`);
        return `<div id="${eleObj.getId()}" className="${eleObj.getClasses()}">${containerHtml}</div>`;
      }

      return eleHtmlString;
    }).join("");
  }

  public serialize() {
    this.styleMap.clear();
    this.apisMap.clear();
    this.componentMap.clear();
    // this.serialisePageUIItemsMap= this.traversePageUIItems(this.pageUIItems,'root')
    // console.log("serialise page ui items:", )
    this.operationMap.clear();
    this.attrMap.clear();
    let retJson = {
      name: this.name,
      // pageNum: this.pageNum,

      html: this.traversePageUIItems(this.pageUIItems, "root"),
      styles: Object.fromEntries(this.styleMap),
      apis: Object.fromEntries(this.apisMap),
      component: Object.fromEntries(this.componentMap),
      operation: Object.fromEntries(this.operationMap),
      attrMapp: Object.fromEntries(this.attrMap),

      //for pageUIItems run loop through root and serialize each element
      // pageUIItems:this.traversePageUIItems(this.pageUIItems,'root')
    };
    console.log("serialise page retJson", retJson);

    // console.log("ccccccccccccc: ",html)
    // return JSON.stringify(retJson);
    return retJson;
  }

  private traverseSerialisedMap = (serialized_ui_items: any, pathToOriginalMap: string, pathToNewMap: string) => {
    // let parsed_serialized_ui_items = JSON.parse(serialized_ui_items)
    const elements = serialized_ui_items[pathToOriginalMap] || [];
    console.log(`Deserializing Elements:`, elements)
    elements.forEach((item: any) => {
      let serialisedJsonObj = JSON.parse(item)

      let deserializedObject: UIElement | null =
        ElementFactory.deserialiseUIElement(item);

      console.log("deserialisedobject", deserializedObject);

      if (deserializedObject) {
        this.addItemToPageUIItems(deserializedObject, pathToNewMap);

        if (
          deserializedObject?.isContainer() ||
          deserializedObject?.isListingContainer()
        ) {
          // let nestedPath = `${path}/container${serialisedJsonObj.uniqueId}`;
          let nestedOrginalPath = `${pathToOriginalMap}/container${serialisedJsonObj.uniqueId}`;
          let nestedNewPath = `${pathToNewMap}/container${deserializedObject.getId()}`;

          this.traverseSerialisedMap(serialized_ui_items, nestedOrginalPath, nestedNewPath);
        }
      }
    });
  };
  private traverseSerialisedMapForDownload = (serialized_ui_items: any, pathToOriginalMap: string, pathToNewMap: string, apisMap: any, compsMap: any, styleMap: any, resMap: any, opMap: any, atrMap: any, viewModeMap: any) => {
    // let parsed_serialized_ui_items = JSON.parse(serialized_ui_items)
    const elements = serialized_ui_items[pathToOriginalMap] || [];
    console.log(`Deserializing Elements in traversepageUIItems:`,elements)
    elements.forEach((item: any) => {
      let serialisedJsonObj = JSON.parse(item)

      let deserializedObject: UIElement | null =
        ElementFactory.deserialiseUIElement(item);

      if (deserializedObject) {
        this.addItemToPageUIItems(deserializedObject, pathToNewMap);
        styleMap.set(deserializedObject?.getId(), deserializedObject?.getStyles())

        if (deserializedObject?.isListingContainer()) {
          let obj = deserializedObject as ToDoListingContainer || deserializedObject as FlightListingContainer
          apisMap.set(obj.getId(), obj.getApi());
          compsMap.set(obj.getId(), obj.getComponentName())
        }
        // console.log("downloaded the table ", deserializedObject);

        if (deserializedObject?.isTable()) {
          // console.log("downloaded the table in table")
          let obj = deserializedObject as Table
          apisMap.set(obj.getId(), obj.getApi());
          compsMap.set(obj.getId(), obj.getComponentName())
        }
        if (deserializedObject?.isResource()) {
          const selectedOp = (deserializedObject as ReadResource | CreateResource).getSelectedOp?.();
          console.log("selected op", selectedOp);
          if (selectedOp === "Create") {
            let obj = deserializedObject as CreateResource
            compsMap.set(obj.getId(), obj.getComponentName())
            resMap.set(obj.getId(), obj.getResourceName())
            opMap.set(obj.getId(), obj.getSelectedOp())
          }
          if (selectedOp === "Read") {
            let obj = deserializedObject as ReadResource
            compsMap.set(obj.getId(), obj.getComponentName())
            resMap.set(obj.getId(), obj.getResourceName())
            opMap.set(obj.getId(), obj.getSelectedOp())
            apisMap.set(obj.getId(), obj.getResourceName());
            atrMap.set(obj.getId(), obj.getAttrMapp());
            viewModeMap.set(obj.getId(), obj.getViewMode());
          }

        }
        if (deserializedObject?.isInputCalander()) {
          let obj = deserializedObject as InputCalender
          compsMap.set(obj.getId(), obj.getComponentName())

        }
        if(deserializedObject?.getType()==='selectedNavbar'){
          let obj = deserializedObject as SelectedNavbar
          compsMap.set(obj.getId(),obj.getType())

        }
        if(deserializedObject?.getType()==='selectedSidebar'){
          let obj = deserializedObject as SelectedSidebar
          compsMap.set(obj.getId(),obj.getType())

        }
        // if (deserializedObject?.isCustomView()) {
        //   let obj = deserializedObject as Collection;
        //   compsMap.set(obj.getId(), obj.getType());
        //   apisMap.set(obj.getId(), obj.getResourceType());
        //   opMap.set(obj.getId(), obj.getViewMode());
        //   atrMap.set(obj.getId(), obj.getAttrMapp());
        // }


        if (
          deserializedObject?.isContainer() ||
          deserializedObject?.isListingContainer()
        ) {
          // let nestedPath = `${path}/container${serialisedJsonObj.uniqueId}`;
          let nestedOrginalPath = `${pathToOriginalMap}/container${serialisedJsonObj.uniqueId}`;
          let nestedNewPath = `${pathToNewMap}/container${deserializedObject.getId()}`;

          this.traverseSerialisedMapForDownload(serialized_ui_items, nestedOrginalPath, nestedNewPath, apisMap, compsMap, styleMap, resMap, opMap, atrMap, viewModeMap);
        }
      }
    });
  };

  public deserializeForDownloadAndSave(pageData: any): any {
    this.pageUIItems = { root: [] };
    let currApisMap = new Map()
    let currCompsMap = new Map()
    let currStyleMap = new Map()
    let currResourceMap = new Map()
    let currOperationMap = new Map()
    let currAttrMapp = new Map();
    let currViewModeMap = new Map();


    let dataToReturn: DataToReturnType = {
      "apisMap": new Map(),
      "compsMap": new Map(),
      "styleMap": new Map(),
      "resourceMap": new Map(),
      "operationMap": new Map(),
      "attrMapp": new Map(),
      "viewModeMap": new Map(),
      "pageUIItems": this.pageUIItems
    }

    // let serialisedHtmlContentMap = pageData.pageContent.htmlContent;

    let serialisedHtmlContentMap = pageData.html;
    // console.log("serialisedHtmlContentMap",serialisedHtmlContentMap)

    if (serialisedHtmlContentMap) {
      this.traverseSerialisedMapForDownload(serialisedHtmlContentMap, "root", "root", currApisMap, currCompsMap, currStyleMap, currResourceMap, currOperationMap, currAttrMapp, currViewModeMap);
      dataToReturn.apisMap = currApisMap;
      dataToReturn.compsMap = currCompsMap;
      dataToReturn.styleMap = currStyleMap;
      dataToReturn.resourceMap = currResourceMap;
      dataToReturn.operationMap = currOperationMap;
      dataToReturn.attrMapp = currAttrMapp;
      dataToReturn.viewModeMap = currViewModeMap;
      dataToReturn.pageUIItems = this.pageUIItems;
      return dataToReturn;
    }
    return dataToReturn;

  }
  public deserializeForDownload(pageData: any): any {
    this.pageUIItems = { root: [] };
    let currApisMap = new Map()
    let currCompsMap = new Map()
    let currStyleMap = new Map()
    let currResourceMap = new Map()
    let currOperationMap = new Map()
    let currAttrMapp = new Map();
    let currViewModeMap = new Map();
    // console.log('each page html content: pagedata',pageData)

    let dataToReturn: DataToReturnType = {
      "apisMap": new Map(),
      "compsMap": new Map(),
      "styleMap": new Map(),
      "resourceMap": new Map(),
      "operationMap": new Map(),
      "attrMapp": new Map(),
      "viewModeMap": new Map(),
      "pageUIItems": this.pageUIItems
    }

    // let serialisedHtmlContentMap = pageData.pageContent.htmlContent;
    // let serialisedHtmlContentMap = pageData.htmlContent; 

    let serialisedHtmlContentMap = pageData.html;
    if (!serialisedHtmlContentMap && pageData.root) {
      serialisedHtmlContentMap = pageData;
    }
    if (!serialisedHtmlContentMap && pageData.htmlContent) { // Case 3
      serialisedHtmlContentMap = pageData.htmlContent;
    }
    // console.log("serialisedHtmlContentMap",serialisedHtmlContentMap)

    if (serialisedHtmlContentMap) {
      this.traverseSerialisedMapForDownload(serialisedHtmlContentMap, "root", "root", currApisMap, currCompsMap, currStyleMap, currResourceMap, currOperationMap, currAttrMapp, currViewModeMap);
      dataToReturn.apisMap = currApisMap;
      dataToReturn.compsMap = currCompsMap;
      dataToReturn.styleMap = currStyleMap;
      dataToReturn.resourceMap = currResourceMap;
      dataToReturn.operationMap = currOperationMap;
      dataToReturn.attrMapp = currAttrMapp;
      dataToReturn.viewModeMap = currViewModeMap;
      dataToReturn.pageUIItems = this.pageUIItems;
      return dataToReturn;
    }
    console.log("data to return for deserialise download", dataToReturn);
    return dataToReturn;

  }
  // deserlize
  public deserialize(pageData: any): UIItems {
    this.pageUIItems = { root: [] };
    // console.log('each page html content: pagedata',pageData)

    // let serialisedHtmlContentMap = pageData.pageContent.htmlContent;
    let serialisedHtmlContentMap = pageData.html;

    if (serialisedHtmlContentMap) {
      this.traverseSerialisedMap(serialisedHtmlContentMap, "root", "root");
      return this.pageUIItems;
    }
    return this.pageUIItems;
  }

  // Get methods
  public getName(): string {
    return this.name;
  }
  public getPageNum(): number {
    return this.pageNum;
  }
  public getPageUIItems(): UIItems {
    return this.pageUIItems;
  }

  // get a specific UI item of current pageName
  // Set methods
  public setName(name: string): void {
    this.name = name;
  }
  public setPageNum(pageNum: number): void {
    this.pageNum = pageNum;
  }
  public setPageUIItems(pageUIItems: UIItems): void {
    this.pageUIItems = pageUIItems;
  }

  // Update specific UI items
  public updateUIItems(newUIItems: any): void {
    this.pageUIItems = newUIItems;
  }

  public addItemToPageUIItems = (ui_item: any, path: string) => {
    if (!this.pageUIItems[path]) {
      this.pageUIItems[path] = [];
    }

    if (ui_item.isListingContainer() || ui_item.isContainer()) {
      let new_path = `${path}/container${ui_item.getId()}`;
      this.pageUIItems[new_path] = [];
    }

    ui_item.setPath(path);
    this.pageUIItems[path].push(ui_item);
  };
}
