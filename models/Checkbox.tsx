// import { createBoardItem } from "../utils/utils";
import { JSX } from "react";
import UIElement from "./UIElement";

export default class Checkbox extends UIElement{
   // private text: any;

   constructor(){
      super();
      this.html= this.getHtml()
      this.styles={};
      this.classes='form-check-input';
      this.type='checkbox';
      
      
   }

   public serialise(): string {
      let parentJSON = {
          styles: JSON.stringify(this.styles),
          classes: this.classes,
          type: this.type,
          path: this.path,
          uniqueId:this.uniqueId,
      };
     let retJSON =parentJSON;
     return JSON.stringify(retJSON)
      
  }

  public static deserialise(str: string): UIElement | null {
      let desJSON = JSON.parse(str);
      let obj = new Checkbox();
      obj.setClasses(desJSON.classes)
      obj.setStyles(JSON.parse(desJSON.styles))
      obj.setType(desJSON.type)
      obj.setPath(desJSON.path)
      return obj
  }

   public getStyledHtml =(): JSX.Element | null => {
      return (
         <input type="radio"  className={this.classes} style={this.styles} id={this.uniqueId}/>
      )
   }
   public getHtml = (): JSX.Element | null => {
      return (
          <div className={this.classes} id={this.uniqueId}>
              
          </div>
      );
  }


}