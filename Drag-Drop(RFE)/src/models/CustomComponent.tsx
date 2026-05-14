import UIElement from "./UIElement";

export default class CustomComponent extends UIElement {
  private name: string;

  constructor() {
    super();
    this.name = "myCustomComponent";
    this.styles = {};
    this.classes = "";
    this.type = "customComponent";
    this.html = this.getHtml();

    // this.type='customComponent'
  }

  public serialise(): string {
    let parentJSON = {
      styles: JSON.stringify(this.styles),
      classes: this.classes,
      type: this.type,
      path: this.path,
      uniqueId: this.uniqueId,
    };
    let retJSON = parentJSON;
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new CustomComponent();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    return obj;
  }

  public setName = (name: string) => {
    this.name = name;
  };
  //
  public getName = () => {
    return this.name;
  };

  public getStyledHtml = (): JSX.Element | null => {
    return this.html;
  };

  //
  public getHtml(): JSX.Element | null {
    return this.html;
  }
}
