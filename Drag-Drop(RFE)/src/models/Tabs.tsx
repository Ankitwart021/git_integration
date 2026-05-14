import UIElement, {
  ArrayEditable,
  EDITABLE_TYPE,
  Editables,
  SingleEditable,
} from "./UIElement";

export default class Tabs extends UIElement {
  private items: any;


  constructor() {
    super();
    this.items = ["Home"];
    this.html = this.getHtml();
    this.styles = {};
    this.classes ="nav nav-tabs";
    this.type = "tabs";
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
    let obj = new Tabs();
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
      <ul className={this.classes} id={this.getId()}>
              {this.items.map((item: any, idx: any) => {
              return (
                <li key={item} className="nav-item ">
                  <a className="nav-link active" aria-current="page" href="#">{item}</a>
                </li>
              );
            })}
      </ul>
    );
  };

  // public setnavItems =(txt: any)=> {
  //     this.items.push(txt);
  // }

  public getItems = () => {
    return this.items;
  };

  public setItems = (items: string[]) => {
    this.items = items;
  };

  public getEditables = (): Editables[] => {
    // Creating Editables
    const a: ArrayEditable = {
      type: EDITABLE_TYPE.ARRAY,
      property: "items",
      getArrayMethod: this.getItems,
      setArrayMethod: this.setItems,
    };

 
    return [a];
  };

  public addItem = (txt: string) => {
    this.items.push(txt);
  };

  public getStyledHtml = (): JSX.Element | null => {
    return (
      <ul className={this.classes} style={this.styles} id={this.getId()}>
      {this.items.map((item: any, idx: any) => {
      return (
        <li key={item} className="nav-item ">
          <a className="nav-link active" aria-current="page" href="#">{item}</a>
        </li>
      );
    })}
</ul>
    );
  };
}
