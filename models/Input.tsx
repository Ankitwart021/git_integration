import { JSX } from "react";
import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

// export const data=[
//     {html:`<input className="form-control" placeholder="placeholder" />`,}
// ]

export default class Input extends UIElement {
  private placeholder: string;
  private boundResourceName?: string;
  private boundFieldName?: string;
  // private html:any;

  constructor() {
    // console.log("object inside Input constructor: ", elementObject);

    super(); // Pass the elementObject to the base class UIElement
    this.placeholder = "Placeholder";
    this.html = this.getHtml();
    this.styles ={};
    this.classes = "form-control";
    this.type = "input";
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
   let retJSON ={...parentJSON,'placeholder':this.placeholder, boundResourceName: this.boundResourceName, boundFieldName: this.boundFieldName}
   return JSON.stringify(retJSON)
    
}

public static deserialise(str: string): UIElement | null {
    try {
        let desJSON = JSON.parse(str);
        let obj = new Input();
        obj.setClasses(desJSON.classes)
        obj.setStyles(JSON.parse(desJSON.styles))
        obj.setType(desJSON.type)
        obj.setPath(desJSON.path)
        obj.setPlaceholder(desJSON.placeholder)
        obj.setBoundResourceName(desJSON.boundResourceName || "");
        obj.setBoundFieldName(desJSON.boundFieldName || "");
        obj.setId(desJSON.uniqueId);
        return obj
    } catch (e) {
        console.error("Error parsing JSON string in Input.deserialise:", str, e);
        return null;
    }
}

  public getPlaceholder =() =>{
    return this.placeholder;
  }

  public setPlaceholder =(txt: string)=> {
    this.placeholder = txt;
  }

  public getHtml=(): JSX.Element | null =>{
    return <input className={this.classes} placeholder={this.placeholder} id={this.uniqueId} />;
  }

  public getEditables=():Editables[]=>{
    const a: SingleEditable = {type: EDITABLE_TYPE.SINGLE, property: "placeholder", getMethod: this.getPlaceholder, setMethod: this.setPlaceholder}

    return [a];
}
public getStyledHtml = (): JSX.Element | null => {
  return <input className={this.classes} placeholder={this.placeholder} style={this.styles} id={this.getId()} />
}
}
