import UIElement from "./UIElement";

export default class FlightSearch extends UIElement {
  constructor() {
    super();
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "d-flex justify-content-between w-75";
    this.type = "flightSearch";
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
    let retJSON = parentJSON;
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new FlightSearch();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setAlignment(desJSON.alignment);
    return obj;
  }

  public getHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} id={this.uniqueId}>
        <div className="d-flex gap-2 align-items-center border p-1 flex-grow-1">
          <i className="fa fa-plane" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="From where?"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div className="d-flex gap-2 align-items-center border p-1 flex-grow-1">
          <i className="fa fa-plane" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="Where to?"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div className="d-flex gap-2 align-items-center border p-1 flex-grow-1">
          <i className="fa fa-plane" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="Depart - Return"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div className="d-flex gap-2 align-items-center border p-1 flex-grow-1">
          <i className="fa fa-plane" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="1 adult"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div>
          <button className="btn text-white " style={{ background: "#605DEC" }}>
            Search
          </button>
        </div>
      </div>
    );
  };
  public getStyledHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} style={this.styles} id={this.uniqueId}>
        <div className="d-flex gap-2 align-items-center border p-1 flex-grow-1">
          <i className="fa fa-plane" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="From where?"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div className="d-flex gap-2 align-items-center border p-1 flex-grow-1">
          <i className="fa fa-plane" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="Where to?"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div className="d-flex gap-2 align-items-center border p-1 flex-grow-1">
          <i className="fa fa-plane" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="Depart - Return"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div className="d-flex gap-2 align-items-center border p-1 flex-grow-1">
          <i className="fa fa-plane" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="1 adult"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div>
          <button className="btn text-white " style={{ background: "#605DEC" }}>
            Search
          </button>
        </div>
      </div>
    );
  };
}
