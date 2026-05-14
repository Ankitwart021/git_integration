import UIElement, { ArrayEditable, EDITABLE_TYPE, Editables } from "./UIElement";

export default class Menu extends UIElement {
  private items: any;
  constructor() {
    super();
    this.items = ["Home"];
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "bg-light d-flex justify-content-between align-items-center ";
    this.type = "menu";
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
      let obj = new Menu();
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
      <div className={this.classes} id={this.getId()}>
        <ul className=" d-flex flex-row justify-content-between align-items-center px-2 list-unstyled">
          <div className="d-flex gap-4 me-4">
            {this.items.map((item: any, idx: any) => {
              return (
                <li key={item} className="mt-1 ">
                  {item}
                </li>
              );
            })}
          </div>
        </ul>
      </div>
    );
  };

  public getStyledHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} style={this.styles} id={this.uniqueId}>
        <ul className="d-flex flex-row justify-content-between px-2 list-unstyled">
          <div className="d-flex gap-4 me-4 justify-content-center align-items-center">
            {this.items.map((item: any, idx: any) => {
              return (
                <li key={item} className=" mt-1">
                  {item}
                </li>
              );
            })}
          </div>
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
  
   
      return [ b];
    };
}
