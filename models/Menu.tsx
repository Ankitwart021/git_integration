import React, { JSX } from "react";
import UIElement, { ArrayEditable, EDITABLE_TYPE, Editables } from "./UIElement";

export default class Menu extends UIElement {
  private items: string[];
  constructor() {
    super();
    this.items = ["Home"];
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "bg-light d-flex justify-content-between ";
    this.type = "menu";
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
      let obj = new Menu();
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
      <nav className={this.classes} id={this.getId()}>
        <ul className=" d-flex flex-row justify-content-between px-2">
          <div className="d-flex gap-4 me-4">
            {this.items.map((item: string, idx: number) => {
              return (
                <li key={item} className=" my-auto">
                  {item}
                </li>
              );
            })}
          </div>
        </ul>
      </nav>
    );
  };

  public getStyledHtml = (): JSX.Element | null => {
    return (
      <nav className={this.classes} style={this.styles} id={this.uniqueId}>
        <ul className="d-flex flex-row justify-content-between px-2">
          <div className="d-flex gap-4 me-4">
            {this.items.map((item: string, idx: number) => {
              return (
                <li key={item} className="my-auto">
                  {item}
                </li>
              );
            })}
          </div>
        </ul>
      </nav>
    );
  };
  public getItems = (): string[] => {
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
