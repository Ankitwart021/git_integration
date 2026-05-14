// import { getNextId } from "../utils/utils";
import { JSX } from "react";
import UIElement from "./UIElement";


export default class Container extends UIElement{


    constructor(){
      super();     
      this.styles={};
      this.classes=" border border-2 h-50 w-50";
      this.type='container';
      this.html=this.getHtml();
      
    }
    public serialise(): string {
      let parentJSON = {
          styles: JSON.stringify(this.styles),
          classes: this.classes,
          type: this.type,
          path: this.path,
          uniqueId:this.uniqueId,
          
      };
     let retJSON =parentJSON
     return JSON.stringify(retJSON)
      
  }

  public static deserialise(str: string): UIElement | null {
      let desJSON = JSON.parse(str);
      let obj = new Container();
      obj.setClasses(desJSON.classes)
      obj.setStyles(JSON.parse(desJSON.styles))
      obj.setType(desJSON.type)
      obj.setPath(desJSON.path)
     
      return obj
  }

    public isContainer =(): boolean =>{
        return true;
    }

    public getStyledHtml=(): JSX.Element | null=> {
      return (
          <div className={this.classes} style={this.styles} id={this.uniqueId}>
          </div>
      );
    }
    public getHtml = (): JSX.Element | null => {
      return (
          <div className={this.classes} id={this.uniqueId}>
            
          </div>
      );
  }



   

}