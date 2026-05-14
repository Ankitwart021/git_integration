import UIElement, {
  ArrayEditable,
  EDITABLE_TYPE,
  Editables,
  SingleEditable,
} from "./UIElement";

export default class SelectedNavbar extends UIElement {
  private items: any;
  private navLogoText: any;

  constructor() {
    super();
    this.navLogoText = "Navbar";
    this.items = ["Home", "Profile", "Settings"];
    this.html = this.getHtml();
    this.styles = {
      background: "linear-gradient(90deg, #1e3c72, #2a5298)",
      padding: "12px 20px",
    };



    this.classes =
      "custom-navbar navbar navbar-expand-lg navbar-dark shadow";
    this.type = "selectedNavbar";
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
      items: JSON.stringify({ items: this.items }),
      navLogoText: this.navLogoText,
    };
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new SelectedNavbar();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setNavLogoText(desJSON.navLogoText);
    let parsedItems = JSON.parse(desJSON.items);
    obj.setItems(parsedItems.items);
    obj.setAlignment(desJSON.alignment);
    return obj;
  }

  public getHtml = (): JSX.Element | null => {
    return (
      <nav
        className={this.classes}
        id={this.getId()}

      >
        <div className="container-fluid">
          <span className="navbar-brand fw-bold fs-4 cursor-pointer">
            {this.navLogoText}
          </span>

          <ul className="navbar-nav ms-auto d-flex flex-row gap-4">
            {this.items.map((item: any, idx: any) => (
              <li key={idx} className="nav-item">
                <span className="nav-link text-white cursor-pointer">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  };

  public setNavLogoText = (txt: any) => {
    this.navLogoText = txt;
  };

  public getNavLogoText = () => {
    return this.navLogoText;
  };
  // public setnavItems =(txt: any)=> {
  //     this.items.push(txt);
  // }

  public getItems = () => {
    return this.items;
  };

  public setItems = (items: string[]) => {
    this.items = items;
  };

  public getEditables = (): Editables[] => {
    // Creating Editables
    const a: SingleEditable = {
      type: EDITABLE_TYPE.SINGLE,
      property: "navLogoText",
      getMethod: this.getNavLogoText,
      setMethod: this.setNavLogoText,
    };
    const b: ArrayEditable = {
      type: EDITABLE_TYPE.ARRAY,
      property: "items",
      getArrayMethod: this.getItems,
      setArrayMethod: this.setItems,
    };


    return [a, b];
  };

  public addItem = (txt: string) => {
    this.items.push(txt);
  };

  public getStyledHtml = (): JSX.Element | null => {
    return (
      <nav
        className={this.classes}
        id={this.getId()}
        style={this.styles}   // ⬅ stays as-is
      >
        <div className="container-fluid">
          <span className="navbar-brand fw-bold fs-4 cursor-pointer">
            {this.navLogoText}
          </span>

          <ul className="navbar-nav ms-auto d-flex flex-row gap-4">
            {this.items.map((item: any, idx: any) => (
              <li key={idx} className="nav-item">
                <span className="nav-link text-white cursor-pointer">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  };
}
