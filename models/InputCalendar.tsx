import { JSX, useState } from "react";
import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";
import dayjs from "dayjs";

interface InputCalendarState {
  selectedDate: Date | null;
}
export default class InputCalender extends UIElement {
  private placeholder: string;
  private componentName: string;
  public state: InputCalendarState; //  Define the state property
  private date: string | null;
  private boundResourceName?: string;
  private boundFieldName?: string;
  
  constructor() {
    super();
    this.state = {
      selectedDate: null, // Store the selected date in state
    };
    this.date = null;
    this.html = this.getHtml();
    this.placeholder = "Placeholder";
    this.styles = {};
    // this.classes = "flex flex-col";
    this.classes = "form-control";
    this.type = "inputCalendar";
    this.componentName = "calendar";
    this.boundFieldName = "";
    this.boundResourceName = "";
  }
  public setBoundResourceName = (resName: string) => {
    this.boundResourceName = resName;
  };

  public getBoundResourceName = (): string | undefined => {
    return this.boundResourceName;
  };

  public setBoundFieldName = (field: string) => {
    this.boundFieldName = field;
  };

  public getBoundFieldName = (): string | undefined => {
    return this.boundFieldName;
  };

  public serialise(): string {
    let parentJSON = {
      styles: JSON.stringify(this.styles),
      classes: this.classes,
      type: this.type,
      path: this.path,
      uniqueId: this.uniqueId,
    };
    let retJSON = { ...parentJSON, 'placeholder': this.placeholder, 'componentName': this.componentName, boundResourceName: this.boundResourceName, boundFieldName: this.boundFieldName }
    return JSON.stringify(retJSON)

  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new InputCalender();
    obj.setClasses(desJSON.classes)
    obj.setStyles(JSON.parse(desJSON.styles))
    obj.setType(desJSON.type)
    obj.setPath(desJSON.path)
    obj.setPlaceholder(desJSON.placeholder)
    obj.setComponentName(desJSON.componentName)
    obj.setBoundResourceName(desJSON.boundResourceName || "");
    obj.setBoundFieldName(desJSON.boundFieldName || "");
    return obj
  }
  public getPlaceholder = (): string => {
    return this.placeholder;
  }

  public setPlaceholder = (txt: string) => {
    this.placeholder = txt;
  }

  public setComponentName = (compName: string) => {
    this.componentName = compName;
  }

  public getHtml = (): JSX.Element | null => {
    return (
      <input className={this.classes} placeholder={this.placeholder} id={this.uniqueId} />
    )
  }


  public getEditables = (): Editables[] => {
    const a: SingleEditable = { type: EDITABLE_TYPE.SINGLE, property: "placeholder", getMethod: this.getPlaceholder, setMethod: this.setPlaceholder }

    return [a];
  }

  public getComponentName = (): string => {
    return this.componentName;
  }

  public isInputCalander = (): boolean => {
    return true;
  };
  public setDate = (date: string | null) => {
    this.date = date;
  };
  public getDate = (): string | null => {
    return this.date;
  };

  public getStyledHtml = (): JSX.Element | null => {
    return (


      <input
        type="text"
        className={this.classes}
        id={this.uniqueId}
        value={this.date ? dayjs(this.date).format('YYYY-MM-DD') : ""}
        onFocus={(event) => (event.target.type = "date")}
        onBlur={(event) => (event.target.type = "text")}
        onChange={(event) => this.setDate(event.target.value)}
        style={this.styles}
        placeholder={this.placeholder}
      />
    );
  };

}