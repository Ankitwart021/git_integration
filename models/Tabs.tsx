import { JSX } from "react";
import UIElement, {
  ArrayEditable,
  EDITABLE_TYPE,
  Editables,
} from "./UIElement";
import React from "react";

export default class Tabs extends UIElement {
  private items: string[];

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
    return obj;
  }

  public getHtml = (): JSX.Element | null => {
    return (
      <ul className={this.classes} id={this.getId()}>
              {this.items.map((item: string, idx: number) => {
              return (
                <li key={item} className="nav-item ">
                  <a className="nav-link active" aria-current="page" href="#">{item}</a>
                </li>
              );
            })}
      </ul>
    );
  };

  public getItems = (): string[] => {
    return this.items;
  };

  public setItems = (items: string[]) => {
    this.items = items;
  };

  public getEditables = (): Editables[] => {
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
      {this.items.map((item: string, idx: number) => {
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
