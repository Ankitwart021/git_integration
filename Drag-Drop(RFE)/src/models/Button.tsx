import UIElement, {
  EDITABLE_TYPE,
  Editables,
  SingleEditable,
} from "./UIElement";

export default class Button extends UIElement {
  private text: string;
  private navigateTo: string; // Now only a single string
  private onClick: string; // Stored as a string function
  private boundResourceName?: string;
  private boundFieldName?: string;
  private api?: string;
  private isLogout: boolean;
  constructor() {
    super();
    this.text = "Submit";
    this.navigateTo = "/";
    this.styles = {};
    this.classes = "btn btn-success";
    this.type = "button";
    this.html = this.getHtml();
    this.onClick = this.generateOnClickString(); // Store as a string function
    this.boundFieldName="";
    this.boundResourceName="";
    this.api="";
    this.isLogout=false;
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

  public setApi = (api: string) => {
    this.api = api;
  };

  public getApi = (): string | undefined => {
    return this.api;
  };
    public setIsLogout = (isLogout: boolean) => {
    this.isLogout = isLogout;
    if(isLogout)
     this.onClick = this.generateOnClickString();
  }
 public getIsLogout = (): boolean => {
    return this.isLogout
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
      text: this.text,
      navigateTo: this.navigateTo,
      onClick: this.generateOnClickString(), // Store function as a string
      boundFieldName: this.boundFieldName,
      boundResourceName: this.boundResourceName,
      isLogout: this.isLogout
    };

    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new Button();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setText(desJSON.text);
    obj.setNavigateTo(desJSON.navigateTo);
    obj.onClick = desJSON.onClick; // Restore function string
    obj.setBoundFieldName(desJSON.boundFieldName);
    obj.setBoundResourceName(desJSON.boundResourceName);
     obj.setIsLogout(desJSON.isLogout);
    return obj;
  }


  // Get navigateTo method
  public getNavigateTo = (): string => {
    return this.navigateTo;
  };

  // Set navigateTo method and update onClick string
  public setNavigateTo = (page: string) => {
    this.navigateTo = page;
    this.onClick = this.generateOnClickString(); // Update the serialized function
  };

  // get text method
  public getText = (): string => {
    console.log("Text inside getText: ", this.text);
    return this.text;
  };

  // set text method
  public setText = (txt: string) => {
    this.text = txt;
  };

  public getEditables = (): Editables[] => {
    const a: SingleEditable = {
      type: EDITABLE_TYPE.SINGLE,
      property: "text",
      getMethod: this.getText,
      setMethod: this.setText,
    };
     const b:SingleEditable={
      type:EDITABLE_TYPE.SINGLE,
      property:"isLogout",
      getMethod: this.getIsLogout,
      setMethod: this.setIsLogout


    }
    return [a];
  };

  public getStyledHtml = (): JSX.Element | null => {
    return (
      <button className={this.classes} id={this.uniqueId} style={this.styles}>
        {this.text}
      </button>
    );
  };

    // Function to generate the string format of onClick
  private generateOnClickString(): string {
    // if (
    //   !this.navigateTo ||
    //   this.navigateTo.trim() === "" ||
    //   this.navigateTo === "/"
    // )
    // if(this.isLogout){
    //   return `() => {logout();
    //   navigate('/login');
    // }` 
    // } else 
      // if(this.getBoundResourceName()) {
        console.log("ttttttttttttttttttttttttttttttttt");
      //  setResourcesData(appId??"",selectedResource.resourceName, rowDataTemp); 
      return `() => {
       
      setResourcesData(appId??"",item.getBoundResourceName(), dataToSaveInStore[item.getBoundResourceName()]); ;
    }`
    // }
    // else {
      // return "() => {}"; // No navigation if reset
    // }
    // return `() => navigate('/${this.navigateTo}')`;
  }


  // onClick={new Function(`return ${this.onClick}`)()}
  // onClick={eval(this.generateOnClickString())}
  // onClick={()=>{}}
  private handleClick = () => {
  if (this.navigateTo && this.navigateTo !== "/") {
    // console.log(`Navigating to ${this.navigateTo}`);
    // You can replace this with real navigation logic, like:
    // navigate(this.navigateTo); <-- pass navigate function via props or context
  } else {
    // console.log("No navigation set.");
  }
};
// onClick={this.handleClick}
  public getHtml = (): JSX.Element | null => {
  // let onClickFn: () => void;

  // try {
  //   // Turn string like "() => navigate('/home')" into a real function
  //   // Function constructor safely creates a new function instance
  //   onClickFn = new Function(`return ${this.onClick}`)();
  // } catch (e) {
  //   console.error("Invalid onClick function string:", e);
  //   onClickFn = () => {};
  // }

  return (
    <button
      className={this.classes}
      id={this.uniqueId}
      // onClick={eval(this.generateOnClickString())}
    >
      {this.text}
    </button>
  );
};
}
