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
import Link from "./Link";
import Card from "./Card";
import Switches from "./Switches";
import FileUpload from "./FileUpload";
import Tabs from "./Tabs";
import ImageUrl from "./ImageUrl";
import { parse } from "path";
import Menu from "./Menu";
import Audio from "./Audio";
import Video from "./Video";
import ProgressBar from "./ProgressBar";
import Radio from "./Radio";
import Range from "./Range";

import FloatingLabels from "./FloatingLabels";
import InputGroup from "./InputGroup";
import Collection from "./Collection";
import { TABLE_VIEW_STYLE } from "../constants";
import { getAppIdFromUrl } from "../utils/utils";
import { useResourceStore } from "../store/useResourceStore";
import ReadResource from "./ReadResource";
import CreateResource from "./CreateResource";
import SelectedNavbar from "./SelectedNavbar";
import SelectedSidebar from "./SelectedSidebar";


export default class ElementFactory {


    public static createUIElement(eleType: any, item: any) {
        const appId = getAppIdFromUrl();
        if(eleType==='selectedSidebar'){
            return new SelectedSidebar()
        }
        if(eleType==="selectedNavbar"){

            return new SelectedNavbar();
        }
        if (eleType === 'collection') {


            const obj = new Collection(TABLE_VIEW_STYLE)
            return obj;
        }
        if (eleType === 'inputGroup') {
            return new InputGroup();
        }
        if (eleType === 'floatingLabels') {
            return new FloatingLabels();
        }
        if (eleType === 'range') {
            return new Range();
        }
        if (eleType === 'radio') {
            return new Radio();
        }
        if (eleType === 'menu') {
            return new Menu();
        }
        if (eleType === 'image') {
            return new ImageUrl();
        }
        if (eleType === 'tabs') {
            return new Tabs();
        }
        if (eleType === 'fileupload') {
            return new FileUpload();
        }
        if (eleType === 'switches') {
            return new Switches();
        }
        if (eleType === 'card') {
            return new Card();
        }
        if (eleType === 'link') {
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
        if (eleType === 'menu') {
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
        console.log("parsed string RFE", parsedStr);
        // Check the type
        if(parsedStr.type==="selectedSidebar"){
            return SelectedSidebar.deserialise(str)
        }
        if(parsedStr.type === 'selectedNavbar'){
            return SelectedNavbar.deserialise(str);
        }
        if (parsedStr.type === 'collection') {
            // const collObj:any =  Collection.deserialise(str);
            //    await loadDataFromStore(collObj.getResourceType());
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
        if (parsedStr.type === 'menu') {
            return Menu.deserialise(str);
        }
        if (parsedStr.type === 'image') {
            return ImageUrl.deserialise(str);
        }
        if (parsedStr.type === 'tabs') {
            return Tabs.deserialise(str);
        }
        if (parsedStr.type === 'fileupload') {
            return FileUpload.deserialise(str);
        }
        if (parsedStr.type === 'switches') {
            return Switches.deserialise(str);
        }
        if (parsedStr.type === 'card') {
            return Card.deserialise(str);
        }
        if (parsedStr.type === 'link') {
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

        // if (parsedStr.type === 'resource') {
        //     return Resource.deserialise(str)
        // }
        if (parsedStr.type === "create-resource") {
            return CreateResource.deserialise(str);
        }
        if (parsedStr.type === "read-resource") {          
            return ReadResource.deserialise(str);
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

        if (eleType === 'menu') {
            return Menu;
        }
        if (eleType === 'image') {
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
        if (eleType === 'card') {
            return Card;
        }
        if (eleType === 'link') {
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
        if (eleType === 'resource') {
            return Resource
        }
        return Input;
    }
}