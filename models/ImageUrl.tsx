import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class ImageUrl extends UIElement {
  private imageUrl: string;
  private alternate:string;

  private styleType: "square" | "circle" = "square";
  private aspectRatio: string = "auto";
  private size: "S" | "M" | "Full" = "M";
  private objectFit: "fill" | "fit" = "fill";

  constructor() {
    super();

    this.imageUrl =
      "https://www.adobe.com/acrobat/hub/media_173d13651460eb7e12c0ef4cf8410e0960a20f0ee.jpg?width=750&format=jpg&optimize=medium'";

    this.type = "image";
    this.alternate = "a Image";
    this.alignment = "center";

    // DEFAULT styles (React handlers will update these)
    this.styles = {
      width: "200px",
      height: "200px",
      objectFit: "cover",
      borderRadius: "0px",
    };

    this.classes = "d-flex flex-column border border-1";
    this.html = this.getHtml();
  }

  /** Image URL Access */
  public getImageUrl = (): string => this.imageUrl;
  public setImageUrl = (url: string) => {
    this.imageUrl = url;
  };

  public getAlt = (): string => this.alternate;
  public setAlt = (alt: string) => {
    this.alternate = alt;
  };

  /** Stores UI state chosen through panel */
  public setStyleType = (type: any) => (this.styleType = type);
  public setAspectRatio = (ratio: any) => (this.aspectRatio = ratio);
  public setSize = (size: any) => (this.size = size);
  public setObjectFit = (fit: any) => (this.objectFit = fit);
  // public setAlignment(align: "left" | "center" | "right" | undefined) {
  //   super.setAlignment(align);
  // }

 
  public getHtml = () => {
    return (
      <img src={this.imageUrl} alt={this.alternate} className={this.classes} id={this.uniqueId} />
    );
  };


  public getStyledHtml = () => {
  const hasAspect = !!this.styles.aspectRatio;
  return (
    <img
      src={this.imageUrl}
      alt={this.alternate}
      className={this.classes}
      id={this.uniqueId}
      style={{
        ...this.styles,

        // If aspect ratio is present → height must be auto
        // If auto → use fixed height so object-fit can work
        height: hasAspect ? "auto" : "200px",
      }}
    />
  );
};

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
      imageUrl: this.imageUrl,
      alt: this.alternate,

      // Store UI selections for consistency
      styleType: this.styleType,
      aspectRatio: this.aspectRatio,
      size: this.size,
      objectFit: this.objectFit,
      alignment: this.alignment,
    };

    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new ImageUrl();

    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setImageUrl(desJSON.imageUrl);
    obj.setAlt(desJSON.alt);

    // restore UI config
    obj.setStyleType(desJSON.styleType);
    obj.setAspectRatio(desJSON.aspectRatio);
    obj.setSize(desJSON.size);
    obj.setObjectFit(desJSON.objectFit);
    obj.setAlignment(desJSON.alignment);

    return obj;
  }

  /** Edit panel registration */
  public getEditables = (): Editables[] => {
    const a: SingleEditable = {
      type: EDITABLE_TYPE.SINGLE,
      property: "imageUrl",
      getMethod: this.getImageUrl,
      setMethod: this.setImageUrl,
    }
    const b: SingleEditable = {
      type: EDITABLE_TYPE.SINGLE,
      property: "alternate",
      getMethod: this.getAlt,
      setMethod: this.setAlt,
    };
    return [a, b];
  };
}
