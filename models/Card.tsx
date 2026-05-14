import { JSX } from "react";
import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class Card extends UIElement{
    private cardImage: string;
    private cardTitle: string;
    private cardDescription: string;
    private cardButtomText: string;

    constructor(){
        super();
        this.cardImage = "";
        this.cardTitle = "Card Title11";
        this.cardDescription =
          "Some quick example text to build on the card title and make up the bulk of the card content.";
        this.cardButtomText = "Goto";
        this.styles={width: '18rem'};
        // this.styles={width: '18rem'};
        this.classes="card";
        this.type="card";
        this.html=this.getHtml();
    }

    public setCardTitle=(title:string)=>{
        this.cardTitle=title;
    }

    public getCardTitle=()=>{
        return this.cardTitle;
    }

    public getCardImage=()=>{
        
        return this.cardImage;
    }

    public setCardImage=(cardImage:string)=>{
        this.cardImage=cardImage
    }

    public getCardDescription=()=>{
        return this.cardDescription;
    }

    public setCardDescription=(cardDescription:string)=>{
        this.cardDescription=cardDescription;
    }

    public getCardButtomText=()=>{
        return this.cardButtomText;
    }   

    public setCardButtomText=(cardButtomText:string)=>{
        this.cardButtomText=cardButtomText;
    }

    public getEditables = (): Editables[] => {
        const a: SingleEditable = {
          type: EDITABLE_TYPE.SINGLE,
          property: "cardImage",
          getMethod: this.getCardImage,
          setMethod: this.setCardImage,
        };
    
        const b: SingleEditable = {
          type: EDITABLE_TYPE.SINGLE,
          property: "cardTitle",
          getMethod: this.getCardTitle,
          setMethod: this.setCardTitle,
        };
    
        const c: SingleEditable = {
          type: EDITABLE_TYPE.SINGLE,
          property: "cardDescription",
          getMethod: this.getCardDescription,
          setMethod: this.setCardDescription,
        };
    
        const d: SingleEditable = {
          type: EDITABLE_TYPE.SINGLE,
          property: "cardButtomText",
          getMethod: this.getCardButtomText,
          setMethod: this.setCardButtomText,
        };
    
        return [a, b, c, d];
      };


      public getStyledHtml = (): JSX.Element | null => {
        return (
          <div className={this.classes} style={this.styles} id={this.uniqueId}>
            {this.cardImage!==''&&<img src={this.cardImage} className="card-img-top" alt="..." />}
            <div className="card-body">
              <h5 className="card-title">{this.cardTitle}</h5>
              <p className="card-text">{this.cardDescription}</p>
              <a href="#" className="btn btn-primary">
                {this.cardButtomText}
              </a>
            </div>
          </div>
        );
      };
    
      public getHtml(): JSX.Element | null {
        return (
          <div className={this.classes} id={this.uniqueId}>
            <img src={this.cardImage} className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">{this.cardTitle}</h5>
              <p className="card-text">{this.cardDescription}</p>
              <a href="#" className="btn btn-primary">
                {this.cardButtomText}
              </a>
            </div>
          </div>
        );
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
      cardImage: this.cardImage,
      cardTitle: this.cardTitle,
      cardDescription: this.cardDescription,
      cardButtomText: this.cardButtomText,
    };
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new Card();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setCardImage(desJSON.cardImage);
    obj.setCardTitle(desJSON.cardTitle);
    obj.setCardDescription(desJSON.cardDescription);
    obj.setCardButtomText(desJSON.cardButtomText);

    return obj;
  }

}

