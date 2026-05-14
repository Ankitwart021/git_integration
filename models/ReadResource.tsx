import { CARD_VIEW_STYLE, TABLE_VIEW_STYLE } from "../constants";
import { useResourceStore } from "../store/useResourceStore";
import { getAppIdFromUrl } from "../utils/utils";
import { JSX } from "react"
import CardStyle from "./CardStyle";
import TableStyle from "./TableStyle";
import UIElement, { ArrayEditable, EDITABLE_TYPE, Editables } from "./UIElement";

export default class ReadResource extends UIElement {
  private selectedOp: string;
  private resourceName: string;
  private componentName: string;
  private api?: string;

  private data: Record<string, any>[] = [];
  private viewMode: string;
  private attrMapp: Map<string, string>;

  private cardStyler: CardStyle;
  private tableStyler: TableStyle;

  constructor() {
    super();
    this.type = "read-resource";
    // this.html = this.render();
    this.resourceName = "";
    this.componentName = "resource";
    this.selectedOp = "";
    this.styles = {};
    this.classes = "d-flex flex-column border border-2 p-2  gap-2 mb-2";
    // this.api = '';
    this.data = [];
    this.viewMode = TABLE_VIEW_STYLE;
    this.attrMapp = new Map<string, string>();

    this.cardStyler = new CardStyle();
    this.tableStyler = new TableStyle();
    this.html = this.render();
  }
  // public loadDataFromStore(resourceName: string) {
  //   const appId = getAppIdFromUrl();
  //   console.log("Deserializing Collection---", appId)
  //   if (!appId) {
  //     console.error("No appId found in URL!");
  //     return;
  //   }
  //   const store = useResourceStore.getState();
  //   const data = store.getSelectedResourceData(appId, resourceName);
  //   console.log("Deserializing Collection data:", data)
  //   this.setData(data);
  //   this.html = this.render();
  // }


  public getHtml = (): JSX.Element | null => this.render();

  public getStyledHtml = (): JSX.Element | null => {
    return this.html;
  };

  public getData = (): Record<string, any>[] => this.data;
  public getViewMode = (): string => this.viewMode;
  public getAttrMapp = (): Map<string, string> => this.attrMapp;


  private render = (): JSX.Element | null => {
    if (this.viewMode === CARD_VIEW_STYLE) {
      return this.cardStyler.getStyledHtml(this.data, this.attrMapp, this.selectedOp);
    }
    if (this.viewMode === TABLE_VIEW_STYLE) {
      return this.tableStyler.getStyledHtml(this.data, this.selectedOp);
    }
    return (
    <div style={{ minHeight: "40px" }}>
      Select viewMode for Resource
    </div>)
  };

  public setSelectedOp = (op: string) => {
    this.selectedOp = op;
    this.html = this.render();
  }
  public setViewMode = (viewMode: string) => {
    this.viewMode = viewMode;
    this.html = this.render();
  }

  public setResourceName = (name: string) => {
    this.resourceName = name;
  }
  public setComponentName = (name: string) => {
    this.componentName = name;
  }


  public setApi = (api: string) => {
    this.api = api;
  }

  public setData = (data: Record<string, any>[]) => {
    this.data = [...data];
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


  // ============================================================
  // GETTERS
  // ============================================================

//   public getOpName = () => {
//     return this.opName;
//   }

  public getSelectedOp = () => {
    return this.selectedOp;
  }

  public getResourceName = () => {
    return this.resourceName;
  }
  public getComponentName = () => {
    return this.componentName;
  }
  public getApi = (): string | undefined => {
    return this.api;
  };

  public isResource = () => {
    return true;
  }


  // ============================================================
  // SERIALIZATION
  // ============================================================
  public serialise(): string {
    let parentJSON = {
      styles: JSON.stringify(this.styles),
      classes: this.classes,
      type: this.type,
      path: this.path,
      uniqueId: this.uniqueId,
      alignment: this.alignment,
    };
    let attrMappObj = Object.fromEntries(this.attrMapp);
    let retJSON = {
      ...parentJSON,
      componentName: this.componentName,
      resourceName: this.resourceName,
      selectedOp: this.selectedOp,
      api: this.api,
      // data: this.data,
      viewMode: this.viewMode,
      attrMapp: attrMappObj,
      cardStyler: this.cardStyler.serialise(),
      tableStyler: this.tableStyler.serialise(),
    };
    return JSON.stringify(retJSON);
  }

  // ============================================================
  // DESERIALIZATION
  // ============================================================
  public static deserialise(str: string): UIElement | null  {
    let desJSON = JSON.parse(str);
    let obj = new ReadResource();
    let attrMappObj = desJSON.attrMapp;
    let newMap = new Map<string, string>();
    if (attrMappObj) {
      for (let [key, value] of Object.entries(attrMappObj)) {
        newMap.set(key, value as string);
      }
    }
    // obj.loadDataFromStore(desJSON.resourceName);
    // obj.setData(obj.data);
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
    obj.setResourceName(desJSON.resourceName);
    obj.setComponentName(desJSON.componentName);
    obj.setSelectedOp(desJSON.selectedOp);
    obj.setApi(desJSON.api);
    obj.setAlignment(desJSON.alignment);
    return obj;
  }

//   public getEditables = (): Editables[] => {

//     // const a:SingleEditable={
//     //     type:EDITABLE_TYPE.SINGLE,
//     //     property:'resourceName',
//     //     getMethod:this.getResourceName,
//     //     setMethod:this.setResourceName,
//     // }
//     const b: ArrayEditable = {
//       type: EDITABLE_TYPE.ARRAY,
//       property: 'opName',
//       getArrayMethod: this.getOpName,
//       setArrayMethod: this.setOpName,
//     }
//     return [b]

//   }
}