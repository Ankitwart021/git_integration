import UIElement from "./UIElement";


export default class flexContainer extends UIElement{


    constructor(){
      super();     
      this.styles={};
      this.classes="d-flex border border-2 w-100 h-100";
      this.type='flexContainer';
      this.html=this.getHtml();
      
    }
    public serialise(): string {
      let parentJSON = {
          styles: JSON.stringify(this.styles),
          classes: this.classes,
          type: this.type,
          path: this.path,
          uniqueId:this.uniqueId,
          alignment: this.alignment,
          
      };
     let retJSON =parentJSON
     return JSON.stringify(retJSON)
      
  }

  public static deserialise(str: string): UIElement | null {
      let desJSON = JSON.parse(str);
      let obj = new flexContainer();
      obj.setClasses(desJSON.classes)
      obj.setStyles(JSON.parse(desJSON.styles))
      obj.setType(desJSON.type)
      obj.setPath(desJSON.path)
      obj.setAlignment(desJSON.alignment);
     
      return obj
  }

    public isContainer =(): boolean =>{
        return true;
    }

    public getStyledHtml=(): JSX.Element | null=> {
      return (
          <div className={this.classes} style={this.styles} id={this.uniqueId}>
          </div>
      );
    }
    public getHtml = (): JSX.Element | null => {
      return (
          <div className={this.classes} id={this.uniqueId}>
            
          </div>
      );
  }



   

}