import PageUIStructure from "./PageUIStructure";

export default class AppUIStructure {
  name: string;
  pages: Map<number, PageUIStructure>;
  currentPageIndex: number;
  pageJson: any;

  constructor() {
    this.name = "My App";
    this.pages = new Map<number, PageUIStructure>();
    this.currentPageIndex = 1;
    this.pageJson = [];
  }

  public addPage() {
    // Create a new page

    const newPageNo = this.pages.size + 1;
    this.pages.set(newPageNo, new PageUIStructure(newPageNo));
    console.log("All pages in appUI: ", this.pages);
  }

  public removePage(index: number) {
    // Remove page at index
  }

  public createApplicationFromAPIData(data: JSON): AppUIStructure {
    // Create a new Applicatioin from API data
    return new AppUIStructure();
  }

  public getPages = () => {
    return this.pages;
  };
  public setPages = (pages: Map<number, PageUIStructure>) => {
    this.pages = pages;
  };

  public getPageJson = () => {
    return this.pageJson;
  };

  public addToPageJson = (pageDataObj: {}) => {
    this.pageJson.push(pageDataObj);
  };
}
