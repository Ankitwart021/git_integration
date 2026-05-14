import { JSX } from "react";
import UIElement, { ArrayEditable, EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class Navbar extends UIElement {
    private items: string[];
    private navLogoText: string;


    constructor() {
        super(); 
        this.navLogoText = 'Navbar';
        this.items = ['Home'];
        this.html = this.getHtml();
        this.styles ={};
        this.classes ="navbar bg-light rounded-pill d-flex justify-content-between ";
        this.type ='navbar';

    }

    public serialise(): string {
        let parentJSON = {
            styles: JSON.stringify(this.styles),
            classes: this.classes,
            type: this.type,
            path: this.path,
            uniqueId:this.uniqueId,
            
        };
       let retJSON ={...parentJSON,'items':JSON.stringify({'items':this.items}),'navLogoText':this.navLogoText}
       return JSON.stringify(retJSON)
        
    }
    
    public static deserialise(str: string): UIElement | null {
        let desJSON = JSON.parse(str);
        let obj = new Navbar();
        obj.setClasses(desJSON.classes)
        obj.setStyles(JSON.parse(desJSON.styles))
        obj.setType(desJSON.type)
        obj.setPath(desJSON.path)
        obj.setNavLogoText(desJSON.navLogoText)
        let parsedItems = JSON.parse(desJSON.items)
        obj.setItems(parsedItems.items)
        return obj
    }

    public getHtml = (): JSX.Element | null =>{
        return (
            <nav className={this.classes}  id={this.getId()}>
                <div className="navbar-brand ms-4">{this.navLogoText}</div>
            <ul className="navbar-nav d-flex flex-row justify-content-between px-2">
                <div className="d-flex gap-4 me-4">
                    { this.items.map((item: string, idx: number)=>{
                        return <li   key={item} className="nav-item my-auto">{item}</li>
                    })}
                </div>
            </ul>
        </nav>
        )
    }

    public setNavLogoText =(txt: string)=> {
        this.navLogoText = txt;
    }

    public getNavLogoText = () =>{
        return this.navLogoText;
    }

    public getItems =(): string[]=> {
        return this.items;
    }

    public setItems = (items:string[])=>{
        this.items=items;
      }
    
      public getEditables = (): Editables[] => {

        // Creating Editables
         const a: SingleEditable = {type: EDITABLE_TYPE.SINGLE, property: "navLogoText", getMethod: this.getNavLogoText, setMethod: this.setNavLogoText}
         const b: ArrayEditable = {type: EDITABLE_TYPE.ARRAY, property: "items", getArrayMethod: this.getItems, setArrayMethod: this.setItems}
    
        return (
          [a, b]
          )
      };

    public addItem= (txt:string)=>{
        this.items.push(txt)
    }

    public getStyledHtml = (): JSX.Element | null =>{
        return (
            <nav className={this.classes} style={this.styles} id={this.uniqueId} >
                <div className="navbar-brand ms-4">{this.navLogoText}</div>
            <ul className="navbar-nav d-flex flex-row justify-content-between px-2">
                <div className="d-flex gap-4 me-4">
                    { this.items.map((item: string, idx: number)=>{
                        return <li   key={item} className="nav-item my-auto">{item}</li>
                    })}
                </div>
            </ul>
        </nav>
        )
    }

}