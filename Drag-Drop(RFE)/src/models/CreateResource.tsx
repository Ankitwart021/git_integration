import { generateCreateFormUI } from "../utils/utils";
import UIElement, {
    EDITABLE_TYPE,
    Editables,
} from "./UIElement";

export default class CreateResource extends UIElement {
    private resourceName: string;
    private componentName: string;
    private selectedOp: string;
    private resMetadata: any;

    constructor(resName: string) {
        super();

        this.type = "create-resource";
        this.componentName = "resource";
        this.selectedOp = "Create";
        this.resourceName = resName;

        this.styles = {};
        this.classes =   "d-flex flex-column border border-2 p-2 gap-1 mb-2";
        this.resMetadata = null;
        this.html = this.render();
    }

    // =================================================
    // RENDER (TEMP PLACEHOLDER)
    // =================================================


    public getFormDefinition(requiredFields: any[]) {
        return generateCreateFormUI(this.resourceName, requiredFields);
    }
    private render = (): JSX.Element => {
        return (
            <div className="w-100">
                <div className="fw-semibold mb-1">
                    Create {this.resourceName || "Resource"}
                </div>

                <div
                    className="border rounded p-3 text-muted"
                    style={{ minHeight: "120px" }}
                >
                    Drop form fields here
                </div>
            </div>
        );
    };

    // =================================================
    // SETTERS
    // =================================================
    public setResourceName = (name: string) => {
        this.resourceName = name;
        this.html = this.render();
    };

    public setResMetadata = (meta: any) => {
        this.resMetadata = meta;
        this.html = this.render();
    };
    public setComponentName = (name: string) => {
        this.componentName = name;
    };
    public setSelectedOp = (op: string) => {
        this.selectedOp = op;
    };
    public isContainer = () => true;

    // =================================================
    // GETTERS
    // =================================================
    public getResourceName = () => this.resourceName;
    public getSelectedOp = () => this.selectedOp;
    public getComponentName = () => this.componentName;
    public getResMetadata = () => this.resMetadata;
    public getHtml = (): JSX.Element | null => {
        return this.render();
    }
    public getStyledHtml = (): JSX.Element | null => {
        return this.html;
    }
    public isResource = () => true;

    // =================================================
    // EDITABLES (BASIC)
    // =================================================
    // public getEditables = (): Editables[] => {
    //     return [
    //         {
    //             type: EDITABLE_TYPE.SINGLE,
    //             property: "resourceName",
    //             getMethod: this.getResourceName,
    //             setMethod: this.setResourceName,
    //         },
    //     ];
    // };

    // =================================================
    // SERIALIZATION
    // =================================================
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
            componentName: this.componentName,
            resourceName: this.resourceName,
            selectedOp: this.selectedOp,
        };
        return JSON.stringify(retJSON);
    }

    // =================================================
    // DESERIALIZATION
    // =================================================
    public static deserialise(str: string): UIElement | null {
        const json = JSON.parse(str);
        const obj = new CreateResource(json.resourceName);

        obj.setStyles(JSON.parse(json.styles));
        obj.setClasses(json.classes);
        obj.setType(json.type);
        obj.setPath(json.path);
        obj.setAlignment(json.alignment);
        obj.setResourceName(json.resourceName);
        obj.setComponentName(json.componentName);
        obj.setSelectedOp(json.selectedOp);
        return obj;
    }
}
