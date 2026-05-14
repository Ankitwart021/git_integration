import { UIItems } from "../context/board-context";
import RASPUIApplication from "./RASPUIApplication";
import RASPUIPage from "./RASPUIPage";
import UIElement from "./UIElement";

export default class UserInfo {
    //user details
    private userId: string;
    private applications: Map<string, RASPUIApplication>;

    //Member variable to store Current application
    public currentApplication: RASPUIApplication | undefined;

    // Member variable to store Current page
    public currentPage: RASPUIPage | undefined;

    // Member variable to store curreent ui_item
    // public ui_items: UIElement | undefined;
    public deserialize(data: any): Map<string, RASPUIApplication> {
        // this.userId = data.userId || '';
        this.applications.clear();
        console.log("data in deserialization 11: ", data)

        if (data) {
            data.map((app: any, idx:number) => {
                console.log("data in deserialization each app: ", app)
                console.log("data in deserialization each idx: ", idx)
                const application = new RASPUIApplication();
                application.setName(app.applicationName);
                application.setId(`${idx+1}`)
                application.setNumber(idx+1)
                // let deserializedApp:RASPUIApplication=application.deserialize(app, idx+1); // Call RASPUIApplication's deserialize method
                let pageMap =application.deserialize(app, idx+1); // Call RASPUIApplication's deserialize method
                application.setPages(pageMap)
                this.applications.set(application.getName(), application);
            });
            console.log("data in deserialization each applications: ", this.applications)
            return this.applications
        }
        return this.applications
    }


    constructor() {
        this.userId = '';
        this.applications = new Map<string, RASPUIApplication>();
        this.currentApplication = undefined;
        this.currentPage = undefined;
    }
    // Get methods
    getApplications(): Map<string, RASPUIApplication> {
        return this.applications;
    }
    getUserId(): string {
        return this.userId;
    }
    getPageForApplication(applicationName: string, pageName: string): RASPUIPage | undefined {
        const application = this.applications.get(applicationName);
        if (application) {
            return application.getPages().get(pageName);
        }
        return undefined


    }

    getApplication(appName:string):RASPUIApplication|undefined{
        return this.applications.get(appName)

    }
   


    //get All pages for currentApplication
    getAllPagesOfCurrApp(): Map<string, RASPUIPage> | undefined {
        
        return this.currentApplication?.getPages();
        
    }   
    //get Current Application
    getCurrentApplication(): RASPUIApplication | undefined {
        return this.currentApplication;
    }
    // get Current Page
    getCurrentPage(): RASPUIPage | undefined {
        return this.currentPage;
    }

    // getCurrent page UI items
    getCurrentPageUIItems(): UIItems | undefined {
        return this.currentPage?.getPageUIItems();
    }

    // Set methods
    // setApplications(applications: Map<string, RASPUIApplication>): void {
    //     this.applications = applications;
    // }

    // set Current Application
    setCurrentApplication(application: RASPUIApplication|undefined): void {
        this.currentApplication = application;
    }
    // set Current Page
    setCurrentPage(page: RASPUIPage|undefined): void {
        this.currentPage = page;
    }

    // Add Application to the user info
    addApplication(name: string, application: RASPUIApplication) {
        this.applications.set(name, application);
    }
    // Inside UserInfo.ts
    setCurrentApplicationAndPage(applicationName: string, pageName: string): void {
        let application = this.applications.get(applicationName);
        if (!application) {
            application = new RASPUIApplication();
            application.setName(applicationName);
            this.applications.set(applicationName, application);
            console.log(`Application "${applicationName}" created and set.`);
        }
        this.currentApplication = application;

        let page = application.getPages().get(pageName);
        if (!page) {
            page = new RASPUIPage();
            page.setName(pageName);
            application.addPage(pageName, page);
            console.log(`Page "${pageName}" created and added to application "${applicationName}".`);
        }
        this.currentPage = page;
    }


    //Update UI items for a specific page in an application
    updatePagesUIItems(applicationName: string, pageName: string, newUIItems: any): void {
        const application = this.applications.get(applicationName);
        if (!application) {
            throw new Error(`Application ${applicationName} not found`);
        }
        application.updatePageUIItems(pageName, newUIItems);
    }


}