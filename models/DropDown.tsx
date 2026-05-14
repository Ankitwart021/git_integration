// import { createBoardItem } from "../utils/utils";
import { JSX } from "react";
import UIElement, { EDITABLE_TYPE, Editables, SingleEditable, ArrayEditable } from "./UIElement";

export default class DropDown extends UIElement {
  private text: any;
  private items: any;
  private myItemClick:Function;
  private boundResourceName?: string;
  private boundFieldName?: string;

  constructor() {
    super();
    this.items = ["Home"];
    this.text = "Select";
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "btn btn-secondary dropdown-toggle";
    this.type = "dropdown";
    this.myItemClick=(item:any,idx:any)=>{
    

    };
    this.boundFieldName="";
    this.boundResourceName="";
  }
 public setBoundResourceName = (resName: string) => {
    this.boundResourceName = resName;
  };

  public getBoundResourceName = (): string | undefined => {
    return this.boundResourceName;
  };

  public setBoundFieldName = (field: string) => {
    this.boundFieldName = field;
  };

  public getBoundFieldName = (): string | undefined => {
    return this.boundFieldName;
  };

  public serialise(): string {
    let parentJSON = {
        styles: JSON.stringify(this.styles),
        classes: this.classes,
        type: this.type,
        path: this.path,
        uniqueId:this.uniqueId,
        
    };
   let retJSON ={...parentJSON,'items':JSON.stringify({'items':this.items}),'text':this.text, boundResourceName: this.boundResourceName, boundFieldName: this.boundFieldName}
   return JSON.stringify(retJSON)
    
}

public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new DropDown();
    obj.setClasses(desJSON.classes)
    obj.setStyles(JSON.parse(desJSON.styles))
    obj.setType(desJSON.type)
    obj.setPath(desJSON.path)
    obj.setText(desJSON.text)
    let parsedItems = JSON.parse(desJSON.items)
    obj.setItems(parsedItems.items)
    obj.setBoundResourceName(desJSON.boundResourceName || "");
    obj.setBoundFieldName(desJSON.boundFieldName || "");
    return obj
}

  public getStyledHtml = (): JSX.Element | null => {
    return (
      <div className="dropdown">
        <button
          className={this.classes}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={this.styles} id={this.uniqueId}
        >
          {this.text}
        </button>
        <ul className="dropdown-menu">
          {this.items.map((item: any, idx: any) => {
            return (
              <li>
                <a className="dropdown-item" href="#" id={idx} onClick={()=>this.myItemClick(item,idx)}>
                  {item}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  public getText = () => {
    return this.text;
  };
  public setText = (txt: any) => {
    this.text = txt;
  };
  public getItems = () => {
    return this.items;
  };
  public getEditables = (): Editables[] => {

    // Creating Editables
     const a: SingleEditable = {type: EDITABLE_TYPE.SINGLE, property: "text", getMethod: this.getText, setMethod: this.setText}
     const b: ArrayEditable = {type: EDITABLE_TYPE.ARRAY, property: "items", getArrayMethod: this.getItems, setArrayMethod: this.setItems}

    //  const e:Editables = a;
    //  if(e.type === EDITABLE_TYPE.SINGLE) {
    //   const s = e as SingleEditable;
      
    //  }
    return (
      [a, b]
      )
  };

  public setItems = (items:string[])=>{
    this.items=items;
  }

  public addItem = (txt: string) => {
    this.items.push(txt);
  };
  public getHtml = (): JSX.Element | null => {
    return (
      <div className="dropdown">
        <button
          className={this.classes}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          id={this.uniqueId}
          
        >
          {this.text}
        </button>
        <ul className="dropdown-menu">
          {this.items.map((item: any, idx: any) => {
            return (
              <li>
                <a className="dropdown-item" href="#" id={idx} onClick={()=>this.myItemClick(item,idx)}>
                  {item}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  public getstyledHtml = (): JSX.Element | null => {
    return (
      <div className="dropdown">
        <button
          className={this.classes}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          style={this.styles} id={this.uniqueId}
        >
          {this.text}
        </button>
        <ul className="dropdown-menu">
          {this.items.map((item: any, idx: any) => {
            return (
              <li>
                <a className="dropdown-item" href="#" id={idx} onClick={()=>this.myItemClick(item,idx)}>
                  {item}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
}