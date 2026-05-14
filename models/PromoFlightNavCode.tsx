import { JSX } from "react";
import UIElement from "./UIElement";

export default class promoflightNavCode extends UIElement {
    constructor() {
        super();
        this.html = this.getHtml();
        this.styles = {background: "#605DEC"};
        this.classes = "border p-3 text-white text-center fs-6";
        this.type = 'promoflightNavCode';
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
        let obj = new promoflightNavCode();
        obj.setClasses(desJSON.classes)
        obj.setStyles(JSON.parse(desJSON.styles))
        obj.setType(desJSON.type)
        obj.setPath(desJSON.path)
        return obj
    }

    public getHtml = (): JSX.Element | null => {
        return (
            <div
                className={this.classes} id={this.uniqueId}
               
            >
                Join today and save up to 20% on your flight using code TRAVEL at
                checkout. Promotion valid for new users only
            </div>
        )
    }
    public getStyledHtml = (): JSX.Element | null => {
        return (
            <div
                className={this.classes}
                style={this.getStyles()}
                id={this.uniqueId}
            >
                Join today and save up to 20% on your flight using code TRAVEL at
                checkout. Promotion valid for new users only
            </div>
        )
    }

}