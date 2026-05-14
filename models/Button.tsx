// import { Expose } from "class-transformer";
import { JSX } from "react";
import UIElement, {
  EDITABLE_TYPE,
  Editables,
  SingleEditable,
} from "./UIElement";
// import { getNextId } from "../utils/utils";

export default class Button extends UIElement {
  private text: string;
  private navigateTo: string; // Now only a single string
  private onClick: string; // Stored as a string function
  private boundResourceName?: string;
  private boundFieldName?: string;
  private isLogout: boolean;
  private api?: string;

  constructor() {
    super();
    this.text = "Submit";
    this.navigateTo = "/";
    this.styles = {};
    this.classes = "btn btn-success";
    this.type = "button";
    this.html = this.getHtml();
    this.onClick = this.generateOnClickString(); // Store as a string function
    this.boundFieldName = "";
    this.boundResourceName = "";
    this.api = "";
    this.isLogout = false;
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
      boundResourceName: this.boundResourceName,
      boundFieldName: this.boundFieldName,
       isLogout: this.isLogout
    };
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new Button();
    console.log("des obj before initialization", obj);
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setText(desJSON.text);
    obj.setNavigateTo(desJSON.navigateTo);
    obj.onClick = desJSON.onClick; // Restore function string
    obj.setBoundResourceName(desJSON.boundResourceName || "");
    obj.setBoundFieldName(desJSON.boundFieldName || "");
     obj.setIsLogout(desJSON.isLogout);

    return obj;
  }

  // public save(): string {
  //     // Read property values from the object
  //     // Convert the property values to string (JSON object)

  //     return "";
  // }
  // public static load(str: string): UIElement {
  //     // Read Property values from str
  //     // text, styles, classes, type
  //     let button: Button = new Button();
  //     button.setText("");
  //     button.setStyles("");
  //     return button;
  // }

  //

  private generateOnClickString(): string {
    if (
      !this.navigateTo ||
      this.navigateTo.trim() === "" ||
      this.navigateTo === "/"
    ) {
      return "() => {}"; // No navigation
    }
      if(this.isLogout){
      return `() => {logout();
      navigate('/login');
    }` 
    }
    return `() => navigate('/${this.navigateTo}')`;
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

  public getStyledHtml = (): JSX.Element | null => {
    return (
      <button className={this.classes} id={this.uniqueId} style={this.styles}>
        {this.text}
      </button>
    );
  };

  //
  public getText = () => {
    console.log("Text inside getText: ", this.text);
    return this.text;
  };

  //
  public setText = (txt: string) => {
    this.text = txt;
  };

  //
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

    return [a, b];
  };

  //
  // onClick={new Function(`return ${this.onClick}`)()}
  // onClick={eval(this.generateOnClickString())}
  // onClick={() => {}}
  private handleClick = () => {
    if (this.navigateTo && this.navigateTo !== "/") {
      // console.log(`Navigating to ${this.navigateTo}`);
      // You can replace this with real navigation logic, like:
      // navigate(this.navigateTo); <-- pass navigate function via props or context
    } else {
      // console.log("No navigation set.");
    }
  };

  //   onClick={this.handleClick}
  public getHtml = (): JSX.Element | null => {
    // Safe dispatch: resolve the click handler from known properties instead of
    // eval-ing the stored onClick string (which would be a dynamic code injection risk).
    let onClickFn: () => void;

    if (this.isLogout) {
      // Caller must provide a logout + navigate implementation via context/props;
      // here we produce a no-op that can be overridden by the consumer.
      onClickFn = () => {
        console.warn('Button: logout handler not bound. Wire up via props/context.');
      };
    } else if (this.navigateTo && this.navigateTo !== '/') {
      // Safe navigation: use a closure over the known, validated navigateTo value.
      const destination = this.navigateTo;
      onClickFn = () => {
        // Consumer should bind a real navigate fn; this is a safe fallback.
        console.warn(`Button: navigate handler not bound for route '${destination}'.`);
      };
    } else {
      onClickFn = () => {};
    }

    return (
      <button
        className={this.classes}
        id={this.uniqueId}
        onClick={onClickFn}
      >
        {this.text}
      </button>
    );

  };
}

// public serialise(): string {
//     super.serialise();
// }