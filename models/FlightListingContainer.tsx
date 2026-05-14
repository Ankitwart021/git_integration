import { JSX } from "react";
import Container from "./Container";
import UIElement from "./UIElement";

export default class FlightListingContainer extends Container{

    private apiName:string;
    private componentName:string;
    constructor(){
        super();
        this.html=this.getHtml()
        this.styles={};
        this.classes="d-flex border border-2 h-50";
        this.type='flightListingContainer';
        this.apiName='flightlist';
        this.componentName='listingContainer'

    }

    public serialise(): string {
        let parentJSON = {
            styles: JSON.stringify(this.styles),
            classes: this.classes,
            type: this.type,
            path: this.path,
            uniqueId:this.uniqueId,
        };
       let retJSON ={...parentJSON,'apiName':this.apiName,'componentName':this.componentName}
       return JSON.stringify(retJSON)
        
    }

    public static deserialise(str: string): UIElement | null|Container {
        let desJSON = JSON.parse(str);
        let obj = new FlightListingContainer();
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

    public isListingContainer=() => {
        return true;
    };

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
}