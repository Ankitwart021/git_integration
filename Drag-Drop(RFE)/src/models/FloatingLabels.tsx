import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class FloatingLabels extends UIElement {
    private placeholder: string;
    constructor() {
        super();
        this.placeholder = "placeholder";
        this.styles = {}
        this.classes = "form-floating mb-3";
        this.type = "input";
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
        };
        let retJSON = {
            ...parentJSON,
            placeholder: this.placeholder,
        };
        return JSON.stringify(retJSON);
    }

    public static deserialise(str: string): UIElement | null {
        let desJSON = JSON.parse(str);
        let obj = new FloatingLabels();
        obj.setClasses(desJSON.classes);
        obj.setStyles(JSON.parse(desJSON.styles));
        obj.setType(desJSON.type);
        obj.setPath(desJSON.path);
        obj.setplaceholder(desJSON.placeholder);
        obj.setAlignment(desJSON.alignment);
        return obj;
    }

    public setplaceholder=(txt: string)=> {
        this.placeholder = txt;
    }

    public getplaceholder=() =>{
        return this.placeholder;
    }

    public getEditables = (): Editables[] => {
        const a: SingleEditable = {
            type: EDITABLE_TYPE.SINGLE,
            property: "placeholder",
            getMethod: this.getplaceholder,
            setMethod: this.setplaceholder,
        };
        return [a];
    }

    public getStyledHtml = (): JSX.Element | null => {
        return (
            <div className={this.classes} style={this.styles} id={this.uniqueId}>
                <input type={this.type} className="form-control form-floating" id="floatingInput" placeholder={this.placeholder}/>
                <label htmlFor="floatingInput">{this.placeholder}</label>
            </div>
        )
    }

    public getHtml(): JSX.Element | null {
        return (
            <div className={this.classes} id={this.uniqueId}>
                <label htmlFor="floatingInput">{this.placeholder}</label>
                <input type={this.type} className="form-control" id="floatingInput" placeholder={this.placeholder}/>
            </div>
        );
    }

}