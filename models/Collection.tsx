import { CARD_VIEW_STYLE, TABLE_VIEW_STYLE } from "../constants";
import TableStyle from "./TableStyle";
import UIElement from "./UIElement";
import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import CardStyle from "./CardStyle";
import { JSX } from "react";
// import { CARD_VIEW_STYLE } from "../constants";
// ModuleRegistry.registerModules([AllCommunityModule]);
// import { useResourceStore } from "../store/useResourceStore";
import { getAppIdFromUrl } from "../utils/utils";
import { useResourceStore } from "../store/useResourceStore";
export default class Collection extends UIElement {
  private data: Record<string, any>[] = [];
  private viewMode: string;
  private attrMapp: Map<string, string>;

  // Renderers
  private cardStyler: CardStyle;
  private tableStyler: TableStyle;
  private resourceType: string;
  constructor( viewMode: string) {
    super();
    this.type = "collection";
    this.data = [];
    this.viewMode = viewMode;
    this.attrMapp = new Map<string, string>();

    this.cardStyler = new CardStyle();
    this.tableStyler = new TableStyle();

    this.html = this.render();
    this.resourceType = "";
  }


  public setResourceType(resourceType: string) {
    this.resourceType = resourceType;
  }
  public getResourceType(): string {
    return this.resourceType;
  }

  private render = (): JSX.Element | null => {
    if (this.viewMode === CARD_VIEW_STYLE) {
      return this.cardStyler.getStyledHtml(this.data, this.attrMapp);
    }
    if (this.viewMode === TABLE_VIEW_STYLE) {
      console.log(
        "column data for aggrid",
        // this.tableStyler.getColDef(this.data)
      );

      return this.tableStyler.getStyledHtml(this.data);
    }
    return null;
  };

  // --- Getters ---
  public getData = (): Record<string, any>[] => this.data;
  public getViewMode = (): string => this.viewMode;
  public getAttrMapp = (): Map<string, string> => this.attrMapp;
  public getHtml = (): JSX.Element | null => this.render();
  public getStyledHtml = (): JSX.Element | null => this.html;

  // --- Setters ---
  public setData = (data: Record<string, any>[]) => {
    this.data = [...data];
    this.html = this.render();
  };

  public setViewMode = (viewMode: string) => {
    this.viewMode = viewMode;
    this.html = this.render();
  };

  public setAttrMapp = (newMap: Map<string, string>) => {
    this.attrMapp = newMap;
    this.html = this.render();
  };

  public setAttrMappEntry = (key: string, value: string) => {
    this.attrMapp.set(key, value);
    this.html = this.render();
  };

  public isCustomView = () => true;
 public loadDataFromStore(resourceName: string) {
    const appId = getAppIdFromUrl();
    if (!appId) {
      console.error("No appId found in URL!");
      return;
    }
    console.log("Deserializing Collection---",appId)

    const store = useResourceStore.getState();
    const data = store.getSelectedResourceData(appId, resourceName);
    console.log("Deserializing Collection data:",data)
    this.setData(data);
    this.html = this.render();
  }
  public serialise(): string {
    let parentJSON = {
      styles: JSON.stringify(this.styles),
      classes: this.classes,
      type: this.type,
      path: this.path,
      uniqueId: this.uniqueId,
    };
    let attrMappObj = Object.fromEntries(this.attrMapp);
    let collectionObj = {
        ...parentJSON,
      // data: this.data,
      viewMode: this.viewMode,
      attrMapp: attrMappObj,
      cardStyler: this.cardStyler.serialise(),
      tableStyler: this.tableStyler.serialise(),
      resourceType: this.resourceType,
    };
    return JSON.stringify(collectionObj);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new Collection( desJSON.viewMode);
    // obj.setData(this.data)
    let attrMappObj = desJSON.attrMapp;
    let newMap = new Map<string, string>();
    if (attrMappObj) {
      for (let [key, value] of Object.entries(attrMappObj)) {
        newMap.set(key, value as string);
      }
    }
obj.loadDataFromStore(desJSON.resourceType);
    obj.setAttrMapp(newMap);
    obj.setViewMode(desJSON.viewMode);
    if (desJSON.cardStyler) {
      let cardStyler = CardStyle.deserialise(desJSON.cardStyler);
      if (cardStyler) obj.cardStyler = cardStyler;
    }
    if (desJSON.tableStyler) {
      let tableStyler = TableStyle.deserialise(desJSON.tableStyler);
      if (tableStyler) obj.tableStyler = tableStyler;
    }

    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setResourceType(desJSON.resourceType);


    obj.html = obj.render();
    return obj;
  }
}
