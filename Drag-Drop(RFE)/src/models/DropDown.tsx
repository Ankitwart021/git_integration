import { useContext } from "react";
import { useAppMetaDataStore } from "../store/useAppMetaDataStore";
import { useResourceStore } from "../store/useResourceStore";
import UIElement, {
  EDITABLE_TYPE,
  Editables,
  SingleEditable,
  ArrayEditable,
} from "./UIElement";
import { getAppIdFromUrl, getAppIdFromUrl1 } from "../utils/utils";


export default class DropDown extends UIElement {
  private text: any;
  private items: any;
  private myItemClick: Function;
  private boundResourceName?: string;
  private boundFieldName?: string;
  private name: string;
  private isForeignKey: boolean;
  private foreignResourceName?: string;
  private isEnum:boolean

  constructor() {
    super();
    this.items = ["Home"];
    this.text = "Select";
    // this.html = this.getHtml();
    this.styles = {};
    this.classes = "btn btn-secondary dropdown-toggle ";
    this.type = "dropdown";
    this.myItemClick = (item: any, idx: any) => {
     
    };
    this.boundFieldName = "";
    this.boundResourceName = "";
    this.name = "dummyName"
    this.isForeignKey = false;
    this.foreignResourceName = "";
    this.isEnum= false;

  }

  public setIsEnum =(isEnum:boolean)=>{
    this.isEnum=isEnum;
  }

  public getIsEnum=()=>{
    return this.isEnum;
  }

  public setForeignResourceName = (resName: string) => {
    this.foreignResourceName = resName;
  }
  public getForeignResourceName = (): string | undefined => {
    return this.foreignResourceName;
  };
  public prepare() {
    const appId = getAppIdFromUrl();

    console.log("all items in dropdown html :out ", this.isForeignKey, this.foreignResourceName, this.boundResourceName, this.name);
    if (this.isForeignKey) {
      const { getSelectedResourceData } = useResourceStore.getState();

      const resourceData = getSelectedResourceData(
        appId,
        this.foreignResourceName || ""
      );

      // this.items = resourceData.map(
      //   (item: any) => item['id']
      // );
      this.setItems(resourceData.map(
        (item: any) => item['id']
      ))
      this.html = this.getHtml();
      console.log("all items in dropdown html :foreign ", this.items, resourceData, this.boundFieldName);
    }
    if (this.isEnum) {
      const { getSelectedEnumValues } = useAppMetaDataStore.getState();
      this.setItems(getSelectedEnumValues(
        appId,
        this.boundFieldName
          ? this.boundFieldName.charAt(0).toUpperCase() +
          this.boundFieldName.slice(1)
          : ""
      ) || [])
      this.html = this.getHtml();
      console.log("all items in dropdown html :enum ", this.boundFieldName
        ? this.boundFieldName.charAt(0).toUpperCase() +
        this.boundFieldName.slice(1)
        : "", this.items)
    }
    if(!this.isEnum && !this.isForeignKey){
      const booleanValues = ['true', 'false'];
      this.setItems(booleanValues)
    }
  }

  public getIsForeignKey = () => {
    return this.isForeignKey;
  }

  public setIsForeignKey = (isFK: boolean) => {
    this.isForeignKey = isFK;
  }

  public getName = () => {
    return this.name;
  }

  public setName = (name: string) => {
    this.name = name;
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

  private handleItemClick(item: any) {
    this.setText(item);
   

    // Example (call actual store or callback instead)
    ` setDataToSave(prev => ({
      ...prev,
      [this.name]: item
      }));`

  }


  private generateOnClickString(item: any): string {
    return `(e)=> {
      this.setText(item);
     
      e.preventDefault();
    
    
      (e) => setDataToSave({ ...dataToSave, ['${this.name}']: '${item}' }) 
    }`;
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
      // items: JSON.stringify({ items: this.items }),
      // text: this.text,
      boundFieldName: this.boundFieldName,
      boundResourceName: this.boundResourceName,
      name: this.name,
      isForeignKey: this.isForeignKey,
      foreignResourceName: this.foreignResourceName,
      isEnum:this.isEnum,

    };
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    console.log("desssssss");
    let desJSON = JSON.parse(str);
    let obj = new DropDown();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    // obj.setText(desJSON.text);
    obj.setBoundFieldName(desJSON.boundFieldName);
    obj.setBoundResourceName(desJSON.boundResourceName);
    // let parsedItems = JSON.parse(desJSON.items);
    // obj.setItems(parsedItems.items);
    obj.setAlignment(desJSON.alignment);
    obj.setName(desJSON.name);
    obj.setIsForeignKey(desJSON.isForeignKey);
    obj.setIsEnum(desJSON.isEnum)
    obj.setForeignResourceName(desJSON.foreignResourceName);
    return obj;
  }

  // public getStyledHtml = (): JSX.Element | null => {

  //    return (
  //     <button
  //       // className={this.classes}
  //       className={`${this.classes}`}
  //       type="button"
  //       data-bs-toggle="dropdown"
  //       aria-expanded="false"
  //       style={this.styles}
  //       id={this.uniqueId}
  //       name={this.name}
  //       onClick={() => this.prepare()}

  //     >
  //       {this.text}
  //       <ul className="dropdown-menu" >
  //         {this.items.map((item: any, idx: any) => {
  //           return (
  //             <li>
  //               <a
  //                 className="dropdown-item"
  //                 href="#"
  //                 id={idx}
  //                 // onClick={() => this.myItemClick(item, idx)}
  //                 onClick={
  //                   eval(this.generateOnClickString(item))
  //                 }
  //               >
  //                 {item}
  //               </a>
  //             </li>
  //           );
  //         })}
  //       </ul>
  //     </button>
  //   );
  // };


  public getStyledHtml = (): JSX.Element | null => {
    return (
      // <div className="dropdown">
      <button
        className={this.classes}
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={this.styles}
        id={this.uniqueId}
        name={this.name}
        onMouseDown={() => this.prepare()} // 👈 KEY FIX
      >
        {this.text}
        <ul className="dropdown-menu">
          {this.items.map((item: any, idx: number) => (
            <li key={idx}>
              <a
                className="dropdown-item"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  this.handleItemClick(item);
                }}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </button>

      // {/* </div> */}
    );
  };



  public getText = () => {
    return this.text;
  };
  public setText = (txt: any) => {
    this.text = txt;
  };
  public getItems = () => {
    return this.items;
  };
  public getEditables = (): Editables[] => {
    const a: SingleEditable = {
      type: EDITABLE_TYPE.SINGLE,
      property: "text",
      getMethod: this.getText,
      setMethod: this.setText,
    };
    const b: ArrayEditable = {
      type: EDITABLE_TYPE.ARRAY,
      property: "items",
      getArrayMethod: this.getItems,
      setArrayMethod: this.setItems,
    };

    return [a, b];
  };

  public setItems = (items: string[]) => {
    this.items = items;
  };

  public addItem = (txt: string) => {
    this.items.push(txt);
  };
  public getHtml = (): JSX.Element | null => {

    return (
      <div className="dropdown">
        <button
          className={this.classes}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          name={this.name}
        >
          {this.text}
        </button>
        <ul className="dropdown-menu">
          {this.items.map((item: any, idx: any) => {
            return (
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  id={idx}
                  onClick={() => this.myItemClick(item, idx)}
                >
                  {item}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
}
