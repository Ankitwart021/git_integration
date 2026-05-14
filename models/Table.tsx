import React, { JSX } from "react";
import Container from "./Container";
import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class Table extends UIElement{

    private apiName:string;
    private componentName:string;
    constructor(){
        super();
        this.html=this.getHtml()
        this.styles={'height':'200px'};
        this.classes="ag-theme-quartz-dark border border-2";
        this.type='table';
        this.apiName='http://localhost:8000/api/flightlist1';
        this.componentName='table'

    }

    public serialise(): string {
        let parentJSON = {
            styles: JSON.stringify(this.styles),
            classes: this.classes,
            type: this.type,
            path: this.path,
            uniqueId: this.uniqueId,
        };
       let retJSON ={...parentJSON,'apiName':this.apiName,'componentName':this.componentName}
       return JSON.stringify(retJSON)
        
    }

    public static deserialise(str: string): UIElement | null|Container|Table {
        let desJSON = JSON.parse(str);
        let obj = new Table();
        obj.setClasses(desJSON.classes)
        obj.setStyles(JSON.parse(desJSON.styles))
        obj.setType(desJSON.type)
        obj.setPath(desJSON.path)
        obj.setApi(desJSON.apiName)
        obj.setComponentName(desJSON.componentName)
        return obj
    }

    public getHtml=(): JSX.Element | null=>{
        return (
            <div className={this.classes} id={this.uniqueId} >
           
          </div>
        )
    }

   public isTable = ()=>{
    return true;
   }

//    public isContainer=()=>{
//     return false;
//    }

    public getApi=()=>{
        return this.apiName;
    }
    public getComponentName=()=>{
        return this.componentName;
    }

    public setApi=(apiName:string)=>{
        this.apiName=apiName;
    }
    public setComponentName=(compName:string)=>{
        this.componentName=compName;
    }
    public getStyledHtml = (): JSX.Element | null => {
        return (
            <div className={this.classes} id={this.uniqueId} style={this.styles}>
              
            </div>
        );
    }

    public getEditables=(): Editables[]=> {
        const a:SingleEditable={
            type:EDITABLE_TYPE.SINGLE,
            property:'api',
            getMethod:this.getApi,
            setMethod:this.setApi

        }
        return [a]
    }
}