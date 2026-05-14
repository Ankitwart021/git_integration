import { UIItems } from "../context/boardContext";
import RASPUIApplication from "./RASPUIApplication";
import RASPUIPage from "./RASPUIPage";


export default class UserInfo {
  //user details
  private userId: string;
  private userName: string;

  private applications: Map<string, RASPUIApplication>;

  //Member variable to store Current application
  public currentApplication: RASPUIApplication | undefined;

  // Member variable to store Current page
  public currentPage: RASPUIPage | undefined;

  // public deserialize(data: any): Map<string, RASPUIApplication> {
  //   // this.userId = data.userId || '';
  //   this.applications.clear();
  //   console.log("data in deserialization 11: ", data);

  //   if (data) {
  //     data.map((app: any, idx: number) => {
  //       console.log("data in deserialization each app: ", app);
  //       console.log("data in deserialization each idx: ", idx);
  //       const application = new RASPUIApplication();
  //       // application.setName(app.applicationName);
  //       application.setName("newww");
  //       application.setId(`${idx + 1}`);
  //       application.setNumber(idx + 1);
  //       // let deserializedApp:RASPUIApplication=application.deserialize(app, idx+1); // Call RASPUIApplication's deserialize method
  //       let pageMap = application.deserialize(app, idx + 1); // Call RASPUIApplication's deserialize method
  //       application.setPages(pageMap);
  //       this.applications.set(application.getName(), application);
  //     });
  //     console.log(
  //       "data in deserialization each applications: ",
  //       this.applications
  //     );
  //     return this.applications;
  //   }
  //   return this.applications;
  // }
public deserialize(data: any, appId: string, appName: string,appDescription:string): Map<string, RASPUIApplication> {
  this.applications.clear();
  console.log("Deserializing applications: ", data);

  const application = new RASPUIApplication();
  application.setName(appName);
  application.setDescription(appDescription); // Set description if available in data
  application.setId(appId);
  application.setNumber(1);

  // Normalize pages: if data is a single object, wrap in array
  const pagesArray = Array.isArray(data) ? data : [data];

  const pageMap = application.deserialize(pagesArray,appId);
  application.setPages(pageMap);

  this.applications.set(application.getName(), application);

  console.log("Deserialization appMap: ", this.applications);
  return this.applications;
}



  constructor() {
    this.userId = "";
    this.userName = "";
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
  setUserId(userId: string): void {
    this.userId = userId;
  }

  getUserName(): string {
    return this.userName;
  }
  setUserName(userName: string): void {
    this.userName = userName;
  }

  getPageForApplication(
    applicationName: string,
    pageName: string
  ): RASPUIPage | undefined {
    const application = this.applications.get(applicationName);
    if (application) {
      return application.getPages().get(pageName);
    }
    return undefined;
  }

  getApplication(appName: string): RASPUIApplication | undefined {
    return this.applications.get(appName);
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

  // get Current page name
  getCurrentPageName():string | undefined{
    return this.currentPage?.getName();
  }

  // get page by pageName
  getPageByName(pageName: string): RASPUIPage | undefined {
    return this.currentApplication?.getPages().get(pageName);
  }
  
  // getCurrent page UI items
  getCurrentPageUIItems(): UIItems | undefined {
    return this.currentPage?.getPageUIItems();
  }

  // set Current Application
  setCurrentApplication(application: RASPUIApplication | undefined): void {
    this.currentApplication = application;
  }

  removePageById(pageId: string) {
  const currentApp = this.getCurrentApplication();
  if (!currentApp) return;

  const pages = currentApp.getPages(); // assume you have a getter
  if (!pages || !pages.has(pageId)) return;

  // Remove from Map
  pages.delete(pageId);

  // If current page was deleted, clear it
  if (this.currentPage?.getId() === pageId) {
    this.currentPage = undefined;
  }

  // Update the app’s internal map
  currentApp.setPages(pages);
}

  
  // set Current Page
  setCurrentPage(page: RASPUIPage | undefined): void {
    this.currentPage = page;
  }

  // Add Application to the user info
  addApplication(name: string, application: RASPUIApplication) {
    this.applications.set(name, application);
  }
  // Inside UserInfo.ts
  setCurrentApplicationAndPage(
    applicationName: string,
    pageName: string
  ): void {
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
      console.log(
        `Page "${pageName}" created and added to application "${applicationName}".`
      );
    }
    this.currentPage = page;
  }

  //Update UI items for a specific page in an application
  updatePagesUIItems(
    applicationName: string,
    pageName: string,
    newUIItems: any
  ): void {
    const application = this.applications.get(applicationName);
    if (!application) {
      throw new Error(`Application ${applicationName} not found`);
    }
    application.updatePageUIItems(pageName, newUIItems);
  }
}
