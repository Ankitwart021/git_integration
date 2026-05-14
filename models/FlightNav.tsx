import { JSX } from "react";
import UIElement from "./UIElement";

export default class Flightnav extends UIElement {
  constructor() {
    super();
    this.html = this.getHtml()
    this.styles = {};
    this.classes = "d-flex justify-content-between align-items-center m-4 ";
    this.type = 'flightNav'
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
    let obj = new Flightnav();
    obj.setClasses(desJSON.classes)
    obj.setStyles(JSON.parse(desJSON.styles))
    obj.setType(desJSON.type)
    obj.setPath(desJSON.path)
    return obj
}

  public getStyledHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} style={this.styles} id={this.uniqueId}>
        <div className="fs-3 fw-bold" style={{ color: "#605DEC" }}>
          Flight App
        </div>
        <div className="d-flex justfy-content-between align-items-center  gap-4">
          <div style={{ color: "#605DEC" }}>Flight</div>
          <div>Hotel</div>
          <div>Package</div>
          <div>Sign in</div>
          <div className="align-self-start">
            <div className="btn" style={{ background: "#605DEC" }}>
              Sign up
            </div>
          </div>
        </div>
      </div>
    )
  }
  public getHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} id={this.uniqueId}>
        <div className="fs-3 fw-bold" style={{ color: "#605DEC" }}>
          Flight App
        </div>
        <div className="d-flex justfy-content-between align-items-center  gap-4">
          <div style={{ color: "#605DEC" }}>Flight</div>
          <div>Hotel</div>
          <div>Package</div>
          <div>Sign in</div>
          <div className="align-self-start">
            <div className="btn" style={{ background: "#605DEC" }}>
              Sign up
            </div>
          </div>
        </div>
      </div>
    )
  }
}