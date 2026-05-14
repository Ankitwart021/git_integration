import UIElement, {
    ArrayEditable,
    EDITABLE_TYPE,
    Editables,
    SingleEditable,
} from "./UIElement";

export default class SelectedSidebar extends UIElement {
    private items: any;


    constructor() {
        super();

        this.items = ["Home", "Profile", "Settings", "Analytics"];
        this.html = this.getHtml();
        this.styles = {
            width:"260px",
            background:'#1f2933',
            height:'100vh'
        };



        this.classes =
            "custom-sidebar border ";
        this.type = "selectedSidebar";
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
            items: JSON.stringify({ items: this.items }),

        };
        return JSON.stringify(retJSON);
    }

    public static deserialise(str: string): UIElement | null {
        let desJSON = JSON.parse(str);
        let obj = new SelectedSidebar();
        obj.setClasses(desJSON.classes);
        obj.setStyles(JSON.parse(desJSON.styles));
        obj.setType(desJSON.type);
        obj.setPath(desJSON.path);
        let parsedItems = JSON.parse(desJSON.items);
        obj.setItems(parsedItems.items);
        obj.setAlignment(desJSON.alignment);
        return obj;
    }

    public getHtml = (): JSX.Element | null => {
        return (
            <div
                className={this.classes}
                id={this.uniqueId}
            >
                <ul className="nav nav-pills flex-column mt-3 px-2 d-flex gap-3">
                    {
                        this.items.map((item: any, idx: any) => {
                            return (
                                <li className="nav-item" key={item}>
                                    <a href="#" className="nav-link active d-flex align-items-center">
                                        {item}
                                    </a>
                                </li>)
                        })
                    }


                </ul>

            </div>
        );
    };




    public getItems = () => {
        return this.items;
    };

    public setItems = (items: string[]) => {
        this.items = items;
    };

    public getEditables = (): Editables[] => {
        // Creating Editables

        const b: ArrayEditable = {
            type: EDITABLE_TYPE.ARRAY,
            property: "items",
            getArrayMethod: this.getItems,
            setArrayMethod: this.setItems,
        };


        return [b];
    };

    public addItem = (txt: string) => {
        this.items.push(txt);
    };

    public getStyledHtml = (): JSX.Element | null => {
        return (

            <div
                className={this.classes}
                style={this.styles}
                id={this.uniqueId}
            >

                <ul className="nav nav-pills flex-column mt-3 px-2 d-flex gap-3">
                    {
                        this.items.map((item: any, idx: any) => {

                            return (
                                <li className="nav-item ">
                                    <a href="#" className="nav-link active d-flex align-items-center">
                                        {item}
                                    </a>
                                </li>)
                        })
                    }


                </ul>

            </div>

        );
    };
}
