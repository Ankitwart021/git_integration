import React, { JSX } from "react";
import Container from "./Container";
import UIElement, { ArrayEditable, EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class Resource extends UIElement {
  private resourceName: string;
  private componentName: string;
  private opName: string[];
  private selectedOp:string;
  constructor(resName:string) {
    super();
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "d-flex flex-column border border-2 h-50";
    this.type = "resource";
    this.resourceName = resName;
    this.componentName = "resource";
    this.opName = ["Create",'Read','Update'];
    this.selectedOp='Create'
  }


  public serialise(): string {
    let parentJSON = {
      styles: JSON.stringify(this.styles),
      classes: this.classes,
      type: this.type,
      path: this.path,
      uniqueId: this.uniqueId,
    };
    let retJSON = {
      ...parentJSON,
      componentName: this.componentName,
      resourceName: this.resourceName,
      selectedOp:this.selectedOp
    };
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null | Container {
    let desJSON = JSON.parse(str);
    let obj = new Resource(desJSON.resourceName);
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setResourceName(desJSON.resourceName);
    obj.setComponentName(desJSON.componentName);
    obj.setSelectedOp(desJSON.selectedOp)
    return obj;
  }
  public getStyledHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} style={this.styles} id={this.uniqueId}>
        {/* <h1>{this.resourceName}</h1>
        <h3>{this.getSelectedOp()}</h3> */}
      </div>
    );
  };

  public getOpName = () => {
    return this.opName;
  };

  public setOpName = (opName: string[]) => {
    this.opName = opName;
  };
  public getResourceName = () => {
    return this.resourceName;
  };
  public getComponentName = () => {
    return this.componentName;
  };

  public setResourceName = (resourceName: string) => {
    this.resourceName = resourceName;
  };

  public setSelectedOp = (currOp:string)=>{
    this.selectedOp=currOp
  }



  public getSelectedOp = ()=>{
    return this.selectedOp
  }

  public isResource=()=>{
    return true;
  }
  public isContainer=()=>{
    return true;
  }

  public setComponentName = (compName: string) => {
    this.componentName = compName;
  };
  public getHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} id={this.uniqueId}>
        {/* <h1 >{this.resourceName}</h1>
        <h3>{this.getSelectedOp()}</h3> */}
      </div>
    );
  };

  public getEditables=(): Editables[]=> {

    // const a:SingleEditable={
    //     type:EDITABLE_TYPE.SINGLE,
    //     property:'resourceName',
    //     getMethod:this.getResourceName,
    //     setMethod:this.setResourceName,
    // }
    const b:ArrayEditable={
        type:EDITABLE_TYPE.ARRAY,
        property:'opName',
        getArrayMethod:this.getOpName,
        setArrayMethod:this.setOpName,
    }
    return [b]
      
  }
}
