import { useState } from "react";
import UIElement, {
  EDITABLE_TYPE,
  Editables,
  SingleEditable,
} from "./UIElement";
import { renderToStaticMarkup } from "react-dom/server";

export default class Input extends UIElement {
  private placeholder: string;
  private boundResourceName?: string;
  private boundFieldName?: string;
  private onChange:string;
  private name :string;
  // private html:any;

  constructor() {
    super(); // Pass the elementObject to the base class UIElement
    this.placeholder = "Placeholder";
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "form-control";
    this.type = "input";
    this.boundFieldName="";
    this.boundResourceName="";
    this.onChange = eval(this.generateOnChangeString()); 
    this.name="dummyName";
  }


public setName = (name:string) =>{
  this.name = name;
}

public getName = ():string =>{
  return this.name;
}


//Function to generate onChange string
  private generateOnChangeString(): string {
    return `(e)=> {
      console.log("Input changed in the model:", e.target.name, e.target.value);
      (e) => setDataToSave({ ...dataToSave, [${this.name}]: e.target.value }) 
    }`;
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
      alignment: this.alignment,
    };
    let retJSON = { 
      ...parentJSON, 
      placeholder: this.placeholder,
      boundFieldName: this.boundFieldName,
       onClick: this.generateOnChangeString(),
      boundResourceName: this.boundResourceName,
      name: this.name
    };
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new Input();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setPlaceholder(desJSON.placeholder);
    obj.setBoundFieldName(desJSON.boundFieldName);
    obj.setBoundResourceName(desJSON.boundResourceName);
    obj.setAlignment(desJSON.alignment);
    obj.setName(desJSON.name);
     obj.onChange = desJSON.onChange; 
    return obj;
  }

  public getPlaceholder = () => {
    return this.placeholder;
  };

  public setPlaceholder = (txt: string) => {
    this.placeholder = txt;
  };

  public getHtml = (): JSX.Element | null => {
    // const [dataToSave, setDataToSave] = useState<{[key:string]:any}>({});
    return (
      <input
        className={this.classes}
        placeholder={this.placeholder}
        name={this.name}
        onChange={eval(this.generateOnChangeString())}
        id={this.uniqueId}

      />
    );
  };

  public getEditables = (): Editables[] => {
    const a: SingleEditable = {
      type: EDITABLE_TYPE.SINGLE,
      property: "placeholder",
      getMethod: this.getPlaceholder,
      setMethod: this.setPlaceholder,
    };

    return [a];
  };
  public getStyledHtml = (): JSX.Element | null => {
    let dataToSave:any={};
    return (
      <input
        className={this.classes}
        placeholder={this.placeholder}
        style={this.styles}
        // value={dataToSave[this.name] || ""}
        name={this.name}
        // onChange={eval(this.generateOnChangeString())}
        id={this.getId()}
      />
    );
  };
}
