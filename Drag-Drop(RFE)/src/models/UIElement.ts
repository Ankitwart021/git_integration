import { getNextCCId, getNextId } from "../utils/utils";
import { CSSProperties } from "react";

export enum EDITABLE_TYPE {
    SINGLE,
    ARRAY
}

export interface Editables {
    type: EDITABLE_TYPE,
    property: string
}

export interface SingleEditable extends Editables {
    getMethod: () => any,
    setMethod: (prop: any) => void,
}

export interface ArrayEditable extends Editables {
    getArrayMethod: () => string[],
    setArrayMethod: (prop: string[]) => void
}

export default abstract class UIElement {


    styles: CSSProperties;

    classes: string;

    html: JSX.Element | null = null;

    type: string;

    uniqueId: string;

    ccId: string;

    path: string

    alignment: "left" | "center" | "right" | undefined;



    constructor() {
        this.uniqueId = getNextId();
        this.ccId = getNextCCId();
        this.styles = {};
        this.classes = "";
        this.type = "";
        this.path = "";
        this.alignment = undefined;
    }
    // 
    public static createElement(html: string): UIElement | null {
        return null;
    }
    // 
    public abstract serialise(): string;
    // 
    public static deserialise(str: string): UIElement | null {
        return null;
    }

    //Functions
    // 
    public isContainer = () => {
        return false
    }

    public isTable=()=>{
        return false;
    }

    public isCustomView=()=>{
        return false;
    }

    // 
    public isInputCalander = () => {
        return false;
    }

    // 
    public isListingContainer = () => {
        return false;
    }

    public isResource = ()=>{
        return false;
    }


    // 
    public getEditables(): Editables[] {
        return [] as Editables[];
    }



    //getters
    // 
    public getType = () => {
        return this.type;
    }

    // 
    public getId = () => {
        return this.uniqueId;
    }

    // 
    public getPath = () => {
        return this.path;
    }

    // 
    public getStyles = (): CSSProperties => {
        return this.styles;
    }

    // 
    public getClasses = () => {
        return this.classes;
    }

    // 
    public getCCId = () => {
        return this.ccId;
    }

    public getAlignment = () => {
        return this.alignment;
    }


    //setters
    // 
    public setPath = (path: string) => {
        console.log('first obj: Class', path)
        return this.path = path;
    }

    // 
    public setType = (type: string) => {
        return this.type = type;
    }



    // 
    public setId = (id: string) => {
        return this.uniqueId = id;
    }

    // 
    public setCCId = (id: string) => {
        return this.ccId = id;
    }

    public setAlignment = (alignment: "left" | "center" | "right" | undefined) => {
        this.alignment = alignment;
    }


    // 
    public setStyles = (newStyle: CSSProperties) => {
        this.styles = newStyle;
    }

    // 
    public setClasses = (newClasses: string) => {
        this.classes = newClasses;
    }

    // 
    public setHtml = (html: JSX.Element | null) => {
        this.html = html;
    }

    //get html types
    public getStyledHtml = (): JSX.Element | null => {
        return null
    }

    //abstract methods
    public abstract getHtml(): JSX.Element | null;
    


}