import { JSX } from "react";
import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class AddText extends UIElement {

    private text: string;
    constructor() {
        // const eleobj= createBoardItem('Addtext')
        super()
        this.text = 'Add Text';
        this.styles = {}
        this.classes = 'border';
        this.type = 'addText';
        this.html =this.getHtml();

    }

    public serialise(): string {
        let parentJSON = {
            styles: JSON.stringify(this.styles),
            classes: this.classes,
            type: this.type,
            path: this.path,
            uniqueId:this.uniqueId,
            
        };
       let retJSON ={...parentJSON,'text':this.text}
       return JSON.stringify(retJSON)
        
    }

    public static deserialise(str: string): UIElement | null {
        let desJSON = JSON.parse(str);
        let obj = new AddText();
        obj.setClasses(desJSON.classes)
        obj.setStyles(JSON.parse(desJSON.styles))
        obj.setType(desJSON.type)
        obj.setPath(desJSON.path)
        obj.setText(desJSON.text)
        return obj
    }

    public getStyledHtml=(): JSX.Element | null=> {
        return (
            <div className={this.classes} style={this.styles} id={this.uniqueId}>{ this.text}</div>
        );
    }
    public getText=()=> {
        console.log('Text inside getText: ', this.text);
        return this.text;
    }

    public setText=(txt: string)=> {
        this.text = txt;
        this.html=this.getHtml();
    }

    public getEditables =(): Editables[] => {
        const a: SingleEditable = {type: EDITABLE_TYPE.SINGLE, property: "text", getMethod: this.getText, setMethod: this.setText}

        return [a] ;
    }
    public getHtml = (): JSX.Element | null => {
        return (
            <div className={this.classes} id={this.uniqueId}>
                {this.text}
            </div>
        );
    }
    

}