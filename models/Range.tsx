import UIElement from "./UIElement";
import { JSX } from "react";
export default class Range extends UIElement {
    constructor() {
        super();
        // this.label = "Default range input";
        this.styles = {}
        this.classes = "form-range"
        this.type = "range"
        this.html = this.getHtml();
    }

    public serialise(): string {
        let parentJSON = {
            styles: JSON.stringify(this.styles),
            classes: this.classes,
            type: this.type,
            path: this.path,
            uniqueId: this.uniqueId,
            alignment: this.alignment,
        }
        let retJSON = parentJSON;
        return JSON.stringify(retJSON);
    }
    public static deserialise(str: string): UIElement | null {
        let desJSON = JSON.parse(str);
        let obj = new Range();
        obj.setClasses(desJSON.classes);
        obj.setStyles(JSON.parse(desJSON.styles));
        obj.setType(desJSON.type);
        obj.setPath(desJSON.path);
        obj.setAlignment(desJSON.alignment);
        return obj;
      }

      public getStyledHtml=(): JSX.Element | null =>{
        return(
            <input
                type="range"
                className={this.classes}
                style={this.styles}
                id={this.uniqueId}
            />  
        )
      } ;
      public getHtml =(): JSX.Element | null =>{
        return (
            <input
            type="range"
            className={this.classes}
            id={this.uniqueId}
        />  
        );
      }

}