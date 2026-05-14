import RASPUIPage from "./RASPUIPage";

export default class RASPUIApplication {
  private name: string;
  private description: string;
  private id: string;
  private number: number;
  private pages: Map<string, RASPUIPage>;
  private haveNavbar: Map<string, boolean>;
  private haveSidebar: Map<string, boolean>;

  constructor() {
    this.name = "";
    this.description = "";
    this.id = "";
    this.number = 1;
    this.pages = new Map<string, RASPUIPage>();
    this.haveNavbar = new Map<string, boolean>();
    this.haveSidebar = new Map<string, boolean>();

  }

  private serializeAppMap: any = new Map();
  private serializedPage: any;
  private allPagesArr: any = [];

  private traverePages = () => {
    this.allPagesArr = [];
    this.pages.forEach((value: RASPUIPage, key: string) => {
      console.log(`Serializing page with key: ${key} and value:`, value);
      this.serializedPage = value.serialize();
      console.log("serialise page:", this.serializedPage);
      this.allPagesArr.push(this.serializedPage);
      this.haveNavbar.set(key, value.getHaveNavbar());
      this.haveSidebar.set(key, value.getHaveSidebar());
      // this.serializeAppMap.set(key,serializedPage);
      console.log("serialise page: allPagesArr", this.allPagesArr);
    });

    // return this.serializeAppMap;
    return this.allPagesArr;
  };

  public getHaveNavbar(pageName: string): boolean {
    return this.haveNavbar.get(pageName) || false;
  }
  public setHaveNavbar(pageName: string, haveNavbar: boolean): void {
    this.haveNavbar.set(pageName, haveNavbar);
  }
  public getHaveSidebar(pageName: string): boolean {
    return this.haveSidebar.get(pageName) || false;
  }
  public setHaveSidebar(pageName: string, haveSidebar: boolean): void {
    this.haveSidebar.set(pageName, haveSidebar);
  }


  public serialise(): string {
    let parentJSON = {
      application: {
        name: this.name,
        description: this.description,
      },
      pages: this.traverePages(),
    };
    let retJson ={
      ...parentJSON,
      haveNavbar: this.haveNavbar,
      haveSidebar: this.haveSidebar,
    }
    console.log("serialise parentJSON", typeof parentJSON);

    return JSON.stringify(retJson);
  }
  // deserlise
  // public deserialize(app: any, idx: number): Map<string, RASPUIPage> {
  //   this.pages.clear();
  //   console.log("Deserializing Elements: app", app);
  //   if (app.pages) {
  //     app.pages.forEach((pageData: any, pageIdx: number) => {
  //       const page = new RASPUIPage();
  //       page.setName(pageData.pageName);
  //       page.setPageNum(pageIdx);

  //       let pageUIItems = page.deserialize(pageData, pageIdx); // Call RASPUIPage's deserialize method
  //       page.setPageUIItems(pageUIItems);
  //       this.pages.set(page.getName(), page);
  //     });
  //     console.log("all pages", this.pages);
  //     return this.pages;
  //   }
  //   return this.pages;
  // }
  public deserialize(pages: any[] | any,appId?:string): Map<string, RASPUIPage> {
    this.pages.clear();
    console.log("Deserializing Pages: ", pages);

    // Normalize to array if single object
    const pagesArray = Array.isArray(pages) ? pages : [pages];

    pagesArray.forEach((pageData: any, pageIdx: number) => {
      const page = new RASPUIPage();
      page.setName(pageData.pageName);
      page.setId(pageData.id)
      page.setPageNum(pageIdx);

      // Pass pageContent (always exists) to RASPUIPage.deserialize
      let pageUIItems = page.deserialize(pageData.pageContent, pageIdx,appId); // Call RASPUIPage's deserialize method
      page.setPageUIItems(pageUIItems);

      this.pages.set(page.getName(), page);
    });

    console.log("All pages after deserialization: ", this.pages);
    return this.pages;
  }



  // Get methods
  getName(): string {
    return this.name;
  }
  getDescription(): string {
    return this.description;
  }
  getId(): string {
    return this.id;
  }
  getNumber(): number {
    return this.number;
  }
  getPages(): Map<string, RASPUIPage> {
    return this.pages;
  }
  // Set methods
  setName(name: string): void {
    this.name = name;
  }
  setDescription(description: string): void {
    this.description = description;
  }
  setId(id: string): void {
    this.id = id;
  }
  setNumber(number: number): void {
    this.number = number;
  }
  setPages(pages: Map<string, RASPUIPage>): void {
    this.pages = pages;
  }

  // Other methods

  // Add page to the application
  // Add page should take name and RASPUIPage as parameters
  addPage(name: string, page: RASPUIPage) {
    this.pages.set(name, page);
  }

  deletePage(pageId: string): void {
    // Find the page by its ID
    const pageEntry = Array.from(this.pages.entries()).find(
      ([, page]) => page.getId() === pageId
    );
    if (pageEntry) {
      const [pageName] = pageEntry;
      this.pages.delete(pageName);
    }
  }

  // Update page UI items
  updatePageUIItems(pageName: string, newUIItems: any): void {
    const page = this.pages.get(pageName);
    if (!page) {
      throw new Error(`Page ${pageName} not found`);
    }
    page.setPageUIItems(newUIItems);
  }
}
