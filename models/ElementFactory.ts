// import { createBoardItem} from "../utils/utils";
import { element } from "prop-types";
import AddText from "./AddText";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Container from "./Container";
import CustomComponent from "./CustomComponent";
import DropDown from "./DropDown";
import FlightAccountSignUp from "./FlightAccountSignUp";
import FlightListingContainer from "./FlightListingContainer";
import Flightnav from "./FlightNav";
import FlightSearch from "./FlightSearch";
import Input from "./Input";
import Inputcalender from "./InputCalendar";
import LoginTemplate1 from "./LoginTemplate1";
import Logintemplate2 from "./LoginTemplate2";
import Navbar from "./Navbar";
import promoflightNavCode from "./PromoFlightNavCode";
import ToDoCustomComponent from "./ToDoCustomComponent";
import ToDoCustomContainer from "./ToDoCustomComponent";
import ToDoListingContainer from "./ToDoListingContainer";
import UIElement from "./UIElement";
import flexContainer from "./FlexContainer";
import Table from "./Table";
import Resource from "./Resources";
import CreateResource from "./CreateResource";
import ReadResource from "./ReadResource";
import Link from "./Link";
import Card from "./Card";
import Switches from "./Switches";
import FileUpload from "./FileUpload";
import Tabs from "./Tabs";
import ImageUrl from './ImageUrl'
import Menu from "./Menu";
import Collection from "./Collection";
import {TABLE_VIEW_STYLE} from "../constants";
import Audio from "./Audio";
import Video from "./Video";
import ProgressBar from "./ProgressBar";
import Radio from "./Radio";
import Range from "./Range";
import SelectedNavbar from "./SelectedNavbar";
import SelectedSidebar from "./SelectedSidebar";

export default class ElementFactory {


    public static createUIElement(eleType: any, item:any) {

        if(eleType==="selectedSidebar"){
            return new SelectedSidebar();
        }
         if(eleType==="selectedNavbar"){

            return new SelectedNavbar();
        }
        if (eleType === 'collection') {
            // const apiArray = [
            //     { userId: 1, id: 1, title: "delectus aut autem", completed: false, body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto" },
            //     { userId: 1, id: 2, title: "quis ut nam facilis", completed: false, body: "eos et molestiae\nnesciunt quas ea tenetur non qui\nquasi dignissimos ducimus qui blanditiis\nasperiores dolore magna aliqua", }                // { userId: 1, id: 3, title: "fugiat veniam minus", completed: false, body: "et porro tempora\nmolestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto\nbeatae vitae dicta sunt explicabo", image: "data:image/jpeg;base64,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" }
            // ];


            const obj = new Collection(TABLE_VIEW_STYLE)
            return obj;
        }
        if (eleType === 'range') {
            return new Range();
        }
        if (eleType === 'radio') {
            return new Radio();
        }
        if(eleType==='image'){
            return new ImageUrl()
        }
        if(eleType==='tabs'){
            return new Tabs();
        }
        if(eleType==='fileupload'){
            return new FileUpload();
        }
        if(eleType==='switches'){
            return new Switches();
        }
        if(eleType==='card'){
            return new Card();
        }
        if(eleType==='link'){
            return new Link();
        }
        if (eleType === 'button') {
            return new Button();
        }
        if (eleType === 'input') {
            return new Input();
        }
        if (eleType === 'navbar') {
            return new Navbar();
        }
        if (eleType === 'checkbox') {
            return new Checkbox();
        }
        if (eleType === 'addText') {
            return new AddText();
        }
        if (eleType === 'container') {
            return new Container();
        }
        if (eleType === 'dropdown') {
            return new DropDown();
        }
        if (eleType === 'flex') {
            return new flexContainer();
        }
        if (eleType === 'flexContainer') {
            return new flexContainer();
        }
        if (eleType === 'inputCalendar') {
            return new Inputcalender();
        }
        if (eleType === 'loginTemplate1') {
            return new LoginTemplate1();
        }
        if (eleType === 'loginTemplate2') {
            return new Logintemplate2();
        }
        if (eleType === 'todoListingContainer') {
            return new ToDoListingContainer();
        }
        if (eleType === 'listingContainer') {
            return new FlightListingContainer();
        }
        if (eleType === 'todoCustomContainer') {
            return new ToDoCustomContainer();
        }
        if (eleType === 'flightNav') {
            return new Flightnav();
        }
        if (eleType === 'promoflightNavCode') {
            return new promoflightNavCode();
        }
        if (eleType === 'flightSearch') {
            return new FlightSearch();
        }
        if (eleType === 'flightAccountSignUp') {
            return new FlightAccountSignUp();
        }
        if (eleType === 'todoCustomComponent') {
            return new ToDoCustomComponent()
        }

        if (eleType === 'CustomComponent') {
            return new CustomComponent()
        }

        if (eleType === 'table') {
            return new Table()
        }
        // if (eleType === 'resource') {
        //     return new Resource(item.parent.elementTypes[item.id])
        // }
        if (eleType === "resource-operation") {
            const { resourceName, operation } = item;
 
            if (operation === "Create") {
                return new CreateResource(resourceName);
            }

            if (operation === "Read") {
                const readRes = new ReadResource();
                readRes.setResourceName(resourceName);
                readRes.setSelectedOp("Read");
                return readRes;
            }
        }
        if(eleType === 'menu') {
            return new Menu();
        }
        if (eleType === 'audio') {
            return new Audio();
        }
        if (eleType === 'video') {
            return new Video();
        }
        if (eleType === 'progressBar') {
            return new ProgressBar();
        }
        return null;
    }

    public static deserialiseUIElement(str: string): UIElement | null {
        let parsedStr = JSON.parse(str);
        console.log("parsed string",parsedStr);
        // Check the type
        if(parsedStr.type==='selectedSidebar'){
            return SelectedSidebar.deserialise(str);
        }
        if(parsedStr.type === 'selectedNavbar'){
            return SelectedNavbar.deserialise(str);
        }
        if(parsedStr.type === 'collection'){
            return Collection.deserialise(str);
        }
        if (parsedStr.type === 'audio') {
            return Audio.deserialise(str)
        }
        if (parsedStr.type === 'video') {
            return Video.deserialise(str)
        }
        if (parsedStr.type === 'progressBar') {
            return ProgressBar.deserialise(str)
        }
        if(parsedStr.type==='image'){
            return ImageUrl.deserialise(str);
        }
        if(parsedStr.type === 'tabs'){
            return Tabs.deserialise(str);
        }
        if(parsedStr.type === 'fileupload'){
            return FileUpload.deserialise(str);
        }
        if(parsedStr.type === 'switches'){
            return Switches.deserialise(str);
        }
        if(parsedStr.type==='card'){
            return Card.deserialise(str);
        }
        if(parsedStr.type==='link'){
            return Link.deserialise(str)
        }

        if (parsedStr.type === 'button') {
            return Button.deserialise(str);
        }
        if (parsedStr.type === 'input') {
            return Input.deserialise(str);
        }
        if (parsedStr.type === 'navbar') {
            return Navbar.deserialise(str);
        }
        if (parsedStr.type === 'checkbox') {
            return Checkbox.deserialise(str);
        }
        if (parsedStr.type === 'addText') {
            return AddText.deserialise(str);
        }
        if (parsedStr.type === 'container') {
            return Container.deserialise(str);
        }
        if (parsedStr.type === 'dropdown') {
            return DropDown.deserialise(str);
        }
        if (parsedStr.type === 'flex') {
            return flexContainer.deserialise(str);
        }
        if (parsedStr.type === 'flexContainer') {
            return flexContainer.deserialise(str);
        }
        if (parsedStr.type === 'inputCalendar') {
            return Inputcalender.deserialise(str);
        }
        if (parsedStr.type === 'loginTemplate1') {
            return LoginTemplate1.deserialise(str);
        }
        if (parsedStr.type === 'loginTemplate2') {
            return Logintemplate2.deserialise(str);
        }
        if (parsedStr.type === 'todoListingContainer') {
            return ToDoListingContainer.deserialise(str);
        }
        if (parsedStr.type === 'listingContainer') {
            return FlightListingContainer.deserialise(str);
        }
        if (parsedStr.type === 'todoCustomContainer') {
            return ToDoCustomContainer.deserialise(str);
        }
        if (parsedStr.type === 'flightNav') {
            return Flightnav.deserialise(str);
        }
        if (parsedStr.type === 'promoflightNavCode') {
            return promoflightNavCode.deserialise(str);
        }
        if (parsedStr.type === 'flightSearch') {
            return FlightSearch.deserialise(str);
        }
        if (parsedStr.type === 'flightAccountSignUp') {
            return FlightAccountSignUp.deserialise(str);
        }
        if (parsedStr.type === 'todoCustomComponent') {
            return ToDoCustomComponent.deserialise(str)
        }

        if (parsedStr.type === 'CustomComponent') {
            return CustomComponent.deserialise(str)
        }

        if (parsedStr.type === 'table') {
            return Table.deserialise(str)
        }

        // if(parsedStr.type === 'resource') {
        //     return Resource.deserialise(str)
        // }
         if (parsedStr.type === "create-resource") {
            return CreateResource.deserialise(str);
        }
        if (parsedStr.type === "read-resource") {
            return ReadResource.deserialise(str);
        }
        if(parsedStr.type === 'menu') {
            return Menu.deserialise(str)
        }
        console.log("Unable to load object from string");
        return null;
    }

    public static createUIElementFromString(html: string): UIElement {


        let element: UIElement | null = Button.createElement(html);
        if (element !== null) {
            return element
        }

        throw Error("something")
    }


    public static createElement(eleType: any) {
        console.log('object type in createElement', eleType)

        if(eleType==='image'){
            return ImageUrl;
        }

        if (eleType === 'tabs') {
            return Tabs;
        }
        if (eleType === 'fileupload') {
            return FileUpload;
        }
        if (eleType === 'switches') {
            return Switches;
        }
        if(eleType==='card'){
            return Card;
        }
        if(eleType==='link'){
            return Link;
        }
        if (eleType === 'button') {
            return Button;
        }

        if (eleType === 'input') {
            return Input;
        }
        if (eleType === 'navbar') {
            return Navbar;
        }
        if (eleType === 'checkbox') {
            return Checkbox;
        }
        if (eleType === 'addText') {
            return AddText;
        }
        if (eleType === 'container') {
            return Container;
        }
        if (eleType === 'dropdown') {
            return DropDown;
        }
        if (eleType === 'flex') {
            return flexContainer
        }
        if (eleType === 'inputCalendar') {
            return Inputcalender
        }
        if (eleType === 'loginTemplate1') {
            return LoginTemplate1
        }
        if (eleType === 'loginTemplate2') {
            return Logintemplate2
        }
        if (eleType === 'todoListingContainer') {
            return ToDoListingContainer
        }
        if (eleType === 'listingContainer') {
            return FlightListingContainer
        }
        if (eleType === 'todoCustomContainer') {
            return ToDoCustomContainer
        }
        if (eleType === 'flightNav') {
            return Flightnav
        }
        if (eleType === 'promoflightNavCode') {
            return promoflightNavCode
        }
        if (eleType === 'flightSearch') {
            return FlightSearch
        }
        if (eleType === 'flightAccountSignUp') {
            return FlightAccountSignUp
        }
        if (eleType === 'todoCustomComponent') {
            return ToDoCustomComponent
        }

        if (eleType === 'CustomComponent') {
            return CustomComponent
        }
        if (eleType === 'table') {
            return Table
        }
        if(eleType === 'resource') {
            return Resource
        }
        return Input;
    }
}