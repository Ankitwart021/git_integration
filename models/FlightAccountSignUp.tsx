import { JSX } from "react";
import UIElement from "./UIElement";

export default class FlightAccountSignUp extends UIElement {
  constructor() {
    super();
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "d-flex flex-column  gap-3 border p-4 w-50 rounded";
    this.type = 'flightAccountSignUp';
  }

  public serialise(): string {
    let parentJSON = {
        styles: JSON.stringify(this.styles),
        classes: this.classes,
        type: this.type,
        path: this.path,
        uniqueId:this.uniqueId,
    };
   let retJSON =parentJSON
   return JSON.stringify(retJSON)
    
}

public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new FlightAccountSignUp();
    obj.setClasses(desJSON.classes)
    obj.setStyles(JSON.parse(desJSON.styles))
    obj.setType(desJSON.type)
    obj.setPath(desJSON.path)
    return obj
}

  public getHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} id={this.uniqueId}>
        <div>
          <h5 className="">Sign up</h5>
        </div>
        <div className="border p-1 rounded">
          <input
            type="text"
            placeholder="Email or phone number"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div className="border p-1 rounded">
          <input
            type="password"
            placeholder="Password"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div>
          <div className="form-check ">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="termscondition"
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              I agree to the{" "}
              <span style={{ color: "#605DEC" }}>terms and condition</span>
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name=""
              id="alerts"
            />
            <label className="form-check-label" htmlFor="alerts">
              Send me the latest deal alerts
            </label>
          </div>
        </div>

        <div
          className="btn text-white rounded"
          style={{ background: "#605DEC" }}
        >
          Create account
        </div>
      </div>
    )
  }
  public getstyledHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} style={this.styles} id={this.uniqueId}>
        <div>
          <h5 className="">Sign up</h5>
        </div>
        <div className="border p-1 rounded">
          <input
            type="text"
            placeholder="Email or phone number"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div className="border p-1 rounded">
          <input
            type="password"
            placeholder="Password"
            className="border-0"
            style={{ outline: "none" }}
          />
        </div>
        <div>
          <div className="form-check ">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="termscondition"
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              I agree to the{" "}
              <span style={{ color: "#605DEC" }}>terms and condition</span>
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name=""
              id="alerts"
            />
            <label className="form-check-label" htmlFor="alerts">
              Send me the latest deal alerts
            </label>
          </div>
        </div>

        <div
          className="btn text-white rounded"
          style={{ background: "#605DEC" }}
        >
          Create account
        </div>
      </div>
    )
  }
}