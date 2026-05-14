import { JSX } from "react";
import UIElement from "./UIElement";

export default class LoginTemplate1 extends UIElement {
  constructor() {
    super()
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "card";
    this.type = 'loginTemplate1';
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
    let obj = new LoginTemplate1();
    obj.setClasses(desJSON.classes)
    obj.setStyles(JSON.parse(desJSON.styles))
    obj.setType(desJSON.type)
    obj.setPath(desJSON.path)
    return obj
}

  public getHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} id={this.uniqueId}>
        <div className="card-header text-center">
          <h4>Login</h4>
        </div>
        <div className="card-body">
          <form>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }
  public getStyledHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} style={this.styles} id={this.uniqueId}>
        <div className="card-header text-center">
          <h4>Login</h4>
        </div>
        <div className="card-body">
          <form>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }
}
