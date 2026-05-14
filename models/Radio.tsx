import UIElement from "./UIElement";
import { JSX } from "react";
export default class Radio extends UIElement {
  constructor() {
    super();
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "form-check-input";
    this.type = "radio";
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
    let retJSON = parentJSON;
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new Radio();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setAlignment(desJSON.alignment);
    return obj;
  }

  public getStyledHtml = (): JSX.Element | null => {
    return (
      <input
        type="radio"
        className={this.classes}
        style={this.styles}
        id={this.uniqueId}
      />
    );
  };
  public getHtml = (): JSX.Element | null => {
    return(
      <input
        type="radio"
        className={this.classes}
        id={this.uniqueId}
      />
    )
  };
}