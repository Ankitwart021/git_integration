import { isValidElement, useContext, useState } from "react";
import BoardContext, { UIItems } from "../context/boardContext";
import UIElement from "./UIElement";

import InputCalender from "./InputCalendar";
import ElementFactory from "./ElementFactory";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import Button from "./Button";
import ReadResource from "./ReadResource";
import { useResourceStore } from "../store/useResourceStore";
import { getAppIdFromUrl } from "../utils/utils";

export default class RASPUIPage {
  private id: string;
  private name: string;
  private pageNum: number;
  private pageUIItems: UIItems;
  private haveNavbar: boolean;
  private haveSidebar: boolean;

  constructor() {
    this.id = "";
    this.name = "";
    this.pageNum = 1;
    this.pageUIItems = { root: [] };
    this.haveNavbar = false;
    this.haveSidebar = false;
  }

  private serialisePageUIItemsMap: Map<string, any[]> = new Map();
  private styleMap: any = new Map();
  private apisMap: any = new Map();
  private componentMap: any = new Map();
  private resourceMap: any = new Map();
  private operationMap: any = new Map();
  private attrMapp: any = new Map();
  private viewModeMap: any = new Map();


  private newPageUIItems: UIItems = { root: [] };

  private addItemToNewPageUIItems = (ui_item: UIElement, path: string) => {
    if (!this.newPageUIItems[path]) {
      this.newPageUIItems[path] = [];
    }

    if (ui_item.isContainer() || ui_item.isListingContainer()) {
      const nestedPath = `${path}/container${ui_item.uniqueId}`;
      this.newPageUIItems[nestedPath] = [];
    }
    ui_item.setPath(path);
    this.newPageUIItems[path].push(ui_item);


  }
  public getHaveNavbar(): boolean {
    return this.haveNavbar;
  }
  public setHaveNavbar(haveNavbar: boolean): void {
    this.haveNavbar = haveNavbar;
  }
  public getHaveSidebar(): boolean {
    return this.haveSidebar;
  }
  public setHaveSidebar(haveSidebar: boolean): void {
    this.haveSidebar = haveSidebar;
  }

  private traverseCurrentPage = (newPageUIItems: UIItems, ui_items: UIItems, pathOfOriginalPage: string, pathOfDuplicatePage: string) => {
    const element = ui_items[pathOfOriginalPage] || [];
    element.forEach((item: any, idx) => {
      let serializedObject = item.serialise();
      console.log('serialise item:', serializedObject);
      const serializedJson = JSON.parse(serializedObject);
      console.log('serialise item after parse', serializedJson);
      const deserializedObject: any = ElementFactory.deserialiseUIElement(serializedObject);
      this.addItemToNewPageUIItems(deserializedObject, pathOfDuplicatePage);

      if (deserializedObject.isContainer() || deserializedObject.isListingContainer()) {
        const nestedPathOfOriginalPage = `${pathOfOriginalPage}/container${serializedJson.uniqueId}`;
        const nestedPathOfDuplicatePage = `${pathOfDuplicatePage}/container${deserializedObject.getId()}`
        this.traverseCurrentPage(newPageUIItems, ui_items, nestedPathOfOriginalPage, nestedPathOfDuplicatePage);

      }




    })

  }

  // private traverseCurrentPage=(newPageUIItems:UIItems, ui_items:UIItems, pathFromOriginalPage:string,pathToDuplicatePage:string)=>{

  //   const elements = serialized_ui_items[pathFromOriginalPage] || [];
  // }
  public clonePage = (ui_items: UIItems): UIItems => {
    this.newPageUIItems = { root: [] }
    this.traverseCurrentPage(this.newPageUIItems, ui_items, 'root', 'root')
    return this.newPageUIItems;


  }

  private traversePageUIItems(pageUIItems: UIItems, path: string): any {

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

      if (item.getType() === 'selectedNavbar' || item.getType() === 'selectedSidebar') {
        this.componentMap.set(item.getId(), item.getType())
        console.log("sssssselected nav sidebar", item, this.componentMap);

      }
      if (item.isResource()) {
        if (item.getSelectedOp() === "Create") {
          this.resourceMap.set(item.getId(), item.getResourceName());
          this.operationMap.set(item.getId(), item.getSelectedOp());
          this.componentMap.set(item.getId(), item.getComponentName());
        }
        if (item.getSelectedOp() === "Read") {
          this.resourceMap.set(item.getId(), item.getResourceName());
          this.operationMap.set(item.getId(), item.getSelectedOp());
          this.componentMap.set(item.getId(), item.getComponentName());
          // this.attrMapp.set(item.getId(), item.getAttrMapp());
          this.attrMapp = item.getAttrMapp();
          this.viewModeMap.set(item.getId(), item.getViewMode());
        }
      }

      if (item instanceof InputCalender) {
        this.componentMap.set(item.getId(), item.getComponentName());
      }
      if (item.isCustomView()) {

        this.componentMap.set(item.getId(), item.getType());
        this.apisMap.set(item.getId(), item.getResourceType());
        this.operationMap.set(item.getId(), item.getViewMode());
        this.attrMapp = item.getAttrMapp();
      }
      console.log('cutomview map', this.componentMap)

      console.log("my serialized obj", serializedObject);

      // addUIItemCC(item,traversingPath,serializedObject)
      if (item.isContainer() || item.isListingContainer()) {
        this.serialisePageUIItemsMap.set(
          `${path}/container${item.getId()}`,
          []
        );
        this.traversePageUIItems(
          pageUIItems,
          `${path}/container${item.getId()}`
        );
      }
      item.setPath(path);

      const itemsArr: any = this.serialisePageUIItemsMap.get(path);
      itemsArr.push(serializedObject);
      console.log("ccccccccc", this.serialisePageUIItemsMap.get(path));
    });
    return Object.fromEntries(this.serialisePageUIItemsMap);
  }

  public getHtml(path: string): string {
    let elements = this.pageUIItems[path];

    return elements.map((eleObj: UIElement, idx: number) => {
      // Check if the element is valid
      if (!isValidElement(eleObj.getHtml())) {
        console.log("Invalid React Element: ", eleObj.getHtml());
      }

      let itemHtml: any = eleObj.getStyledHtml();

      // Extract the onClick handler if it exists
      const props = itemHtml.props || {};
      const onClick = props.onClick;

      // Get the HTML representation
      let eleHtmlString = renderToString(itemHtml);
      // If it's a button with onClick, we need to modify the rendered HTML to include the handler
      if (eleObj instanceof Button && onClick) {
        //   // Extract the function body to preserve it
        let onClickFuncStr = onClick.toString();

        //   // For navigation functions like () => navigate('/Page3')
        //   // Find the opening button tag and replace it with one that includes the onClick in React syntax
        eleHtmlString = eleHtmlString.replace('<button', `<button onClick={${onClickFuncStr}}`);
        //   // eleHtmlString = eleHtmlString.replace('<button',`<button data-onclick="${encodeURIComponent(onClickFuncStr)}"`);
      }
      // If it's a button with onClick, we need to modify the rendered HTML to include the handler
      // if (eleObj instanceof Button && onClick) {
      //   // Extract the function body to preserve it
      //   let onClickFuncStr = onClick.toString();

      //   // For navigation functions like () => navigate('/Page3')
      //   // Find the opening button tag and replace it with one that includes the onClick in React syntax
      //   eleHtmlString = eleHtmlString.replace('<button', `<button onClick={${onClickFuncStr}}`);
      //   // eleHtmlString = eleHtmlString.replace('<button',`<button data-onclick="${encodeURIComponent(onClickFuncStr)}"`);
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



  //serialize page
  public serialize() {
    this.styleMap.clear();
    this.apisMap.clear();
    this.componentMap.clear();
    this.resourceMap.clear();
    this.operationMap.clear();
    this.attrMapp.clear();
    this.serialisePageUIItemsMap.clear();
    console.log('Return json of the duplicate page in serialise', this.pageUIItems)

    let retJson = {
      id: this.id,
      pageName: this.name,
      pageContent: {
        html: this.traversePageUIItems(this.pageUIItems, "root"),
        styles: Object.fromEntries(this.styleMap),
        apis: Object.fromEntries(this.apisMap),
        component: Object.fromEntries(this.componentMap),
        resource: Object.fromEntries(this.resourceMap),
        operation: Object.fromEntries(this.operationMap),
        attrMapp: Object.fromEntries(this.attrMapp),
        viewModeMap: Object.fromEntries(this.viewModeMap),
        haveNavbar: this.haveNavbar,
        haveSidebar: this.haveSidebar,
      },
    };
    console.log("serialise page retJson", retJson);

    return retJson;
  }

  private traverseSerialisedMap = (
    serialized_ui_items: any,
    pathToOriginalMap: string,
    pathToNewMap: string,
    appId?: string
  ) => {
    const elements = serialized_ui_items[pathToOriginalMap] || [];
    console.log(`Deserializing Elements:`, elements);
    elements.forEach((item: any) => {
      let serialisedJsonObj = JSON.parse(item);
      console.log("serializedJson obj", serialisedJsonObj)
      let deserializedObject: UIElement | null =
        ElementFactory.deserialiseUIElement(item);
      this.addItemToPageUIItems(deserializedObject, pathToNewMap, appId);

      if (
        deserializedObject?.isContainer() ||
        deserializedObject?.isListingContainer()
      ) {
        let nestedOrginalPath = `${pathToOriginalMap}/container${serialisedJsonObj.uniqueId}`;
        let nestedNewPath = `${pathToNewMap}/container${deserializedObject.getId()}`;

        this.traverseSerialisedMap(
          serialized_ui_items,
          nestedOrginalPath,
          nestedNewPath
        );
      }
    });
  };

  // deserlize
  // public deserialize(pageData: any, pageIdx: number): UIItems {
  //   this.pageUIItems = { root: [] };

  //   let serialisedHtmlContentMap = pageData.pageContent.htmlContent;

  //   if (serialisedHtmlContentMap) {
  //     this.traverseSerialisedMap(serialisedHtmlContentMap, "root", "root");
  //     return this.pageUIItems;
  //   }
  //   return this.pageUIItems;
  // }
  public deserialize(pageContent: any, pageIdx: number, appId?: string): UIItems {
    this.pageUIItems = { root: [] };

    let serialisedHtmlContentMap = pageContent.html;
    console.log("My serialzed content", serialisedHtmlContentMap)
    if (serialisedHtmlContentMap) {
      this.haveNavbar = pageContent.haveNavbar || false;
      this.haveSidebar = pageContent.haveSidebar || false;
      this.traverseSerialisedMap(serialisedHtmlContentMap, "root", "root", appId);
      return this.pageUIItems;
    }
    return this.pageUIItems;
  }


  // Get methods
  public getName(): string {
    return this.name;
  }
  public getId(): string {
    return this.id;
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
  public setId(id: string): void {
    this.id = id;
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

  public addItemToPageUIItems = (ui_item: any, path: string, appId?: string) => {
    console.log("ui elemnts in raspUiPage", ui_item);
    // const appId: any = getAppIdFromUrl();
    if (!this.pageUIItems[path]) {
      this.pageUIItems[path] = [];
    }
    if (ui_item.isResource() && ui_item instanceof ReadResource) {
      const store = useResourceStore.getState();
      const data = store.getSelectedResourceData(appId || "", ui_item.getResourceName());
      console.log("Deserializing Collection data aaaa", appId, ui_item.getResourceName())
      ui_item.setData(data);
    }
    if (ui_item.isListingContainer() || ui_item.isContainer()) {
      let new_path = `${path}/container${ui_item.getId()}`;
      this.pageUIItems[new_path] = [];
    }


    ui_item.setPath(path);
    this.pageUIItems[path].push(ui_item);
  };
}
