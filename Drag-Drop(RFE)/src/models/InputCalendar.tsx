import { useState } from "react";
import UIElement, {
  EDITABLE_TYPE,
  Editables,
  SingleEditable,
} from "./UIElement";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from "dayjs";

interface InputCalendarState {
  selectedDate: Date | null;
}
export default class InputCalender extends UIElement {
  private placeholder: any;
  private componentName: string;
  public state: InputCalendarState; //  Define the state property
  private date: any
  private boundResourceName?: string;
  private boundFieldName?: string;
  private onChange:string;
 private name :string;
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
      console.log("Input changed in the model:",e.target.name, e.target.value);
      // Add your custom logic here
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
      componentName: this.componentName,
      boundFieldName: this.boundFieldName,
      onClick: this.generateOnChangeString(),
      boundResourceName: this.boundResourceName,
      name: this.name
    };
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new InputCalender();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setPlaceholder(desJSON.placeholder);
    obj.setComponentName(desJSON.componentName);
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
  public setDate = (date: any) => {
    this.date = date;
  };
  public getDate = () => {
    return this.date;
  };

  public setPlaceholder = (txt: any) => {
    this.placeholder = txt;
  };

  public setComponentName = (compName: string) => {
    this.componentName = compName;
  };

  public getHtml = (): JSX.Element | null => {
    // const [showCal, setShowCal] = useState(false);
    // const [active1] = useState(false);
    // const [value1] = useState<dayjs.Dayjs | null>(this.date);
    return (

        <input
        type="text"
        className={this.classes}
        id={this.uniqueId}
        onChange={eval(this.generateOnChangeString())}
        name={this.name}
        onFocus={(event) => (event.target.type = "date")}
        onBlur={(event) => (event.target.type = "text")}
      
        placeholder={this.placeholder}
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

  public getComponentName = () => {
    return this.componentName;
  };

  public isInputCalander = () => {
    return true;
  };
  // const [showCalendar, setShowCalendar] = useState(false);
  // const [active] = useState(false);
  // const [value] = useState<dayjs.Dayjs | null>(this.date);
  public getStyledHtml = (): JSX.Element | null => {
   
    return (


      <input
        type="text"
        className={this.classes}
        id={this.uniqueId}
        // value={this.date ? dayjs(this.date).format('YYYY-MM-DD') : ""}
        // value={dataToSave[this.name] || ""}
        name={this.name}
        onFocus={(event) => (event.target.type = "date")}
        onBlur={(event) => (event.target.type = "text")}
        // onChange={(event) => {
        //   console.log("Input changed in the model:", event.target.value);
        //   this.setDate(event.target.value)}}
        style={this.styles}
        placeholder={this.placeholder}
      />
    );
  };
}
