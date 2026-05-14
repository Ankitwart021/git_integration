import { JSX } from "react";
import UIElement from "./UIElement"

export default class Logintemplate2 extends UIElement{
    constructor(){
        super();
        this.html= this.getHtml();
         this.styles={};
         this.classes="d-flex align-items-center justify-content-center min-vh-100";
         this.type='loginTemplate2';
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
      let obj = new Logintemplate2();
      obj.setClasses(desJSON.classes)
      obj.setStyles(JSON.parse(desJSON.styles))
      obj.setType(desJSON.type)
      obj.setPath(desJSON.path)
      return obj
  }

    public getHtml=(): JSX.Element | null =>{
        return(
          <div className={this.classes}>
        <div
          className="card shadow-sm"
          style={{ width: "25rem", borderRadius: "15px" }}
        >
          <div className="card-body p-4">
            <h3 className="text-center mb-4">Welcome Back</h3>
            <form>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="name@example.com"
                />
                <label htmlFor="email">Email address</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                />
                <label htmlFor="password">Password</label>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-decoration-none">
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                style={{ borderRadius: "50px" }}
              >
                Login
              </button>
            </form>
            <p className="text-center mt-3">
              Don't have an account?{" "}
              <a href="#" className="text-decoration-none">
                Sign up
              </a>
            </p>
          </div>
        </div>
                </div>
        )
    }
}