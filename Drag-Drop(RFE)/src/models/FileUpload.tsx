import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class FileUpload extends UIElement {
  private label: string;
  private boundResourceName?: string;
  private boundFieldName?: string;
  private name :string;
  constructor() {
    super();
    this.label = "Default file input";
    this.styles = {};
    this.classes = "mb-3";
    this.type = "fileupload";
    this.boundFieldName = "";
    this.boundResourceName = "";
    this.html = this.getHtml();
    this.name="dummyName";
  }
//Function to generate onChange string
  private generateOnChangeString(): string {
    return `(e)=> {
      console.log("Input changed in the model:", e.target.name, e.target.value);
      (e) => setDataToSave({ ...dataToSave, [${this.name}]: e.target.files[0] }) 
    }`;
  }
  public setName = (name:string) =>{
    this.name = name;
  } 
  public getName = ():string =>{
    return this.name;
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

  public setFileUploadLabel = (label: string) => {
    this.label = label;
  }

  public getFileUploadLabel = () => {
    return this.label;
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
      label: this.label,
      boundFieldName: this.boundFieldName,
      boundResourceName: this.boundResourceName,
      name:this.name
      
    };
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new FileUpload();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setBoundFieldName(desJSON.boundFieldName);
    obj.setBoundResourceName(desJSON.boundResourceName);
    obj.setFileUploadLabel(desJSON.label);
    obj.setAlignment(desJSON.alignment);
    obj.setName(desJSON.name);


    return obj;
  }


  public getEditables = (): Editables[] => {
    const a: SingleEditable = {
      type: EDITABLE_TYPE.SINGLE,
      property: "label",
      getMethod: this.getFileUploadLabel,
      setMethod: this.setFileUploadLabel,
    };
    return [a];
  };


  public getStyledHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} style={this.styles} id={this.uniqueId}>
        <label className="form-label">{this.label} </label>
        <input className="form-control" type="file" id="formFile" name={`${this.name}`} onChange={eval(this.generateOnChangeString())}/>
      </div>
    );
  };

  public getHtml(): JSX.Element | null {
    return (
      <div className={this.classes} id={this.uniqueId}>
        <label className="form-label">{this.label} </label>
        <input className="form-control" type="file" id="formFile" name={`${this.name}`}/>
      </div>
    );
  }


}

