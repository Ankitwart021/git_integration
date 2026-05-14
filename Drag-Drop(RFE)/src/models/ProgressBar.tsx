import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class ProgressBar extends UIElement {
    private value: number = 50;     // current
    private min: number = 0;
    private max: number = 100;

    constructor() {
        super();

        this.type = "progress";
        this.styles = {
            width: "100%",
            height: "12px",
            backgroundColor: "#e9ecef"
        };

        this.classes = "";
        this.html = this.getHtml();
    }

    // Getters & Setters
    public getValue = () => this.value.toString();
    public setValue = (v: string) => (this.value = Number(v) || 0);

    public getMin = () => this.min.toString();
    public setMin = (v: string) => (this.min = Number(v) || 0);

    public getMax = () => this.max.toString();
    public setMax = (v: string) => (this.max = Number(v) || 100);

    // View
    public getHtml = () => {
        const percent = ((this.value - this.min) / (this.max - this.min)) * 100;

        return (
            <div className="progress" id={this.uniqueId}>
                <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{
                        width: `${percent}%`,
                        height: "100%"
                    }}
                ></div>
            </div>
        );
    };

    public getStyledHtml = () => {
        const percent = ((this.value - this.min) / (this.max - this.min)) * 100;

        return (
            <div
                id={this.uniqueId}
                className="progress"
                style={{ ...this.styles }}
            >
                <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{
                        width: `${percent}%`,
                        height: "100%"
                    }}
                ></div>
            </div>
        );
    };

    // Save
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
            value: this.value,
            min: this.min,
            max: this.max,
        };
        return JSON.stringify(retJSON);
    }

    // Load
    public static deserialise(str: string): UIElement {
        const dataJSON = JSON.parse(str);
        const obj = new ProgressBar();

        obj.setStyles(JSON.parse(dataJSON.styles));
        obj.setClasses(dataJSON.classes);
        obj.setType(dataJSON.type);
        obj.setPath(dataJSON.path);
        obj.setMax(dataJSON.max);
        obj.setMin(dataJSON.min);
        obj.setValue(dataJSON.value);

        return obj;
    }

    // Edit panel
    public getEditables = (): Editables[] => {
        const val: SingleEditable = {
            type: EDITABLE_TYPE.SINGLE,
            property: "value",
            getMethod: this.getValue,
            setMethod: this.setValue,
        };

        const min: SingleEditable = {
            type: EDITABLE_TYPE.SINGLE,
            property: "min",
            getMethod: this.getMin,
            setMethod: this.setMin,
        };

        const max: SingleEditable = {
            type: EDITABLE_TYPE.SINGLE,
            property: "max",
            getMethod: this.getMax,
            setMethod: this.setMax,
        };

        return [val, min, max];
    };
}
