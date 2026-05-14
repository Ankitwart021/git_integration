import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class InputGroup extends UIElement {
    private placeholder: string
    private label: string
    constructor() {
        super();
        this.placeholder = "Placeholder";
        this.label = "@";
        this.html = this.getHtml();
        this.styles = {};
        this.classes = "input-group form-control";
        this.type = "text";
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
            label: this.label
        };
        return JSON.stringify(retJSON);
    }
    public static deserialise(str: string): UIElement | null {
        let desJSON = JSON.parse(str);
        let obj = new InputGroup();
        obj.setClasses(desJSON.classes);
        obj.setStyles(JSON.parse(desJSON.styles));
        obj.setType(desJSON.type);
        obj.setPath(desJSON.path);
        obj.setPlaceholder(desJSON.placeholder);
        obj.setLabel(desJSON.label);
        obj.setAlignment(desJSON.alignment);
        return obj;
    }

    public getPlaceholder = () => {
        return this.placeholder;
    };

    public setPlaceholder = (txt: string) => {
        this.placeholder = txt;
    };

    public getLabel = () => {
        return this.label;
    };

    public setLabel = (txt: string) => {    
        this.label = txt;
    };

    public getEditables = (): Editables[] => {
            const a: SingleEditable = {
                type: EDITABLE_TYPE.SINGLE,
                property: "placeholder",
                getMethod: this.getPlaceholder,
                setMethod: this.setPlaceholder,
            };
            const b: SingleEditable = {
                type: EDITABLE_TYPE.SINGLE,
                property: "label",
                getMethod: this.getLabel,
                setMethod: this.setLabel,
            };
            return [a,b];
        }



    public getHtml(): JSX.Element | null {
        return (
            <div className="input-group mb-3" id={this.uniqueId}>
                <span className="input-group-text">{this.label}</span>
                <input type={this.type} className={this.classes} placeholder={this.placeholder} />
            </div>
        );
    }

    public getStyledHtml = (): JSX.Element | null => {
        return (
            <div className="input-group mb-3" style={this.styles} id={this.uniqueId}>
                <span className="input-group-text">{this.label}</span>
                <input type={this.type} className={this.classes} placeholder={this.placeholder} />
            </div>
        )
    };



}