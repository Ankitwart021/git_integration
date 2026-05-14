import UIElement, {
  EDITABLE_TYPE,
  Editables,
  SingleEditable,
} from "./UIElement";

export default class Link extends UIElement {
  private text: string;
  private link:string

  constructor() {
    super();
    this.text = "Link";
    this.styles = {};
    this.classes = "text-decoration-none";
    this.type = "link";
    this.link=''
    this.html = this.getHtml();
  }

  public serialise(): string {
    let parentJSON = {
      styles: JSON.stringify(this.styles),
      classes: this.classes,
      type: this.type,
      path: this.path,
      uniqueId: this.uniqueId,
      link:this.link,
    };
    let retJSON = { ...parentJSON, text: this.text, link:this.link };
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new Link();
    console.log("des obj before initialization", obj);
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setText(desJSON.text);
    obj.setLink(desJSON.link)

    return obj;
  }

  public getStyledHtml = (): JSX.Element | null => {
    return (
        <p>

      <a
        className={this.classes}
        href={this.link}
        style={this.styles}
        id={this.uniqueId}
      >
        {this.text}
      </a>
        </p>
    );
  };
  public getText = () => {
    console.log("Text inside getText: ", this.text);
    return this.text;
  };

  //
  public setText = (txt: any) => {
    this.text = txt;
  };

  public setLink = (link:string)=>{
    this.link=link
  }
  public getLink = ()=>{
    return this.link;
  }

  public getEditables = (): Editables[] => {
    const a: SingleEditable = {
      type: EDITABLE_TYPE.SINGLE,
      property: "text",
      getMethod: this.getText,
      setMethod: this.setText,
    };
    const b:SingleEditable={
        type:EDITABLE_TYPE.SINGLE,
        property:'link',
        getMethod:this.getLink,
        setMethod:this.setLink
    }
    return [a,b];
  };

  public getHtml = (): JSX.Element | null => {
    return (
        <p>

      <a className={this.classes} href={this.link} id={this.uniqueId}>
        {this.text}
      </a>
        </p>
    );
  };
}
