import { JSX } from "react";
import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class FileUpload extends UIElement{
    private label: string;

    constructor(){
        super();
        this.label = "Default file input";
        this.styles={};
        this.classes="mb-3";
        this.type="fileupload";
        this.html=this.getHtml();
    }

    public setFileUploadLabel=(label:string)=>{
        this.label=label;
    }

    public getFileUploadLabel=()=>{
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
        let obj = new FileUpload();
        obj.setClasses(desJSON.classes);
        obj.setStyles(JSON.parse(desJSON.styles));
        obj.setType(desJSON.type);
        obj.setPath(desJSON.path);
        obj.setFileUploadLabel(desJSON.label);
    
        return obj;
      }
    

    public getEditables = (): Editables[] => {
        const a: SingleEditable = {
          type: EDITABLE_TYPE.SINGLE,
          property: "label",
          getMethod: this.getFileUploadLabel,
          setMethod: this.setFileUploadLabel,
        };
        return [a];
      };


      public getStyledHtml = (): JSX.Element | null => {
        return (
            <div className={this.classes} style={this.styles} id={this.uniqueId}>
            <label  className="form-label">{this.label} </label>
            <input className="form-control" type="file" id="formFile"/>
            </div>
        );
      };
    
      public getHtml(): JSX.Element | null {
        return (
            <div className={this.classes} id={this.uniqueId}>
            <label  className="form-label">{this.label} </label>
            <input className="form-control" type="file" id="formFile"/>
            </div>
        );
      }


}

