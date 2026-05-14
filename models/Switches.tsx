import { JSX } from "react";
import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class Switches extends UIElement{
    private label: string;

    constructor(){
        super();
        this.label = "Default switch checkbox input";
        this.styles={};
        this.classes="form-check form-switch";
        this.type="switches";
        this.html=this.getHtml();
    }

    public setSwitchesLabel=(label:string)=>{
        this.label=label;
    }

    public getSwitchesLabel=()=>{
        return this.label;
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
          label: this.label,
        };
        return JSON.stringify(retJSON);
      }
    
      public static deserialise(str: string): UIElement | null {
        let desJSON = JSON.parse(str);
        let obj = new Switches();
        obj.setClasses(desJSON.classes);
        obj.setStyles(JSON.parse(desJSON.styles));
        obj.setType(desJSON.type);
        obj.setPath(desJSON.path);
        obj.setSwitchesLabel(desJSON.label);
    
        return obj;
      }
    

    public getEditables = (): Editables[] => {
        const a: SingleEditable = {
          type: EDITABLE_TYPE.SINGLE,
          property: "label",
          getMethod: this.getSwitchesLabel,
          setMethod: this.setSwitchesLabel,
        };
        return [a];
      };


      public getStyledHtml = (): JSX.Element | null => {
        return (
            <div className={this.classes} style={this.styles} id={this.uniqueId}>
            <label className="form-check-label" >{this.label}</label>
            <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault"/>
            </div>
        );
      };
    
      public getHtml(): JSX.Element | null {
        return (
            <div className={this.classes} id={this.uniqueId}>
            <label className="form-check-label" >{this.label}</label>
            <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault"/>
            </div>
        );
      }


}

