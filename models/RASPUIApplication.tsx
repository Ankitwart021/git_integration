import RASPUIPage, {  UIItems } from "./RASPUIPage";
// import { UIItems } from "./types";

interface ApiApplication {
    pages: any[];
    [key: string]: any;
}

export default class RASPUIApplication {
    private name: string;
    private id: string;
    private number: number;
    private pages: Map<string, RASPUIPage>;

    constructor() {
        this.name = '';
        this.id = '';
        this.number = 1;
        this.pages = new Map<string, RASPUIPage>();
    }

    private serializedPage: any | undefined;
    private allPagesArr: any[] = [];

    private traverePages = (): any[] => {
        this.allPagesArr = [];
        this.pages.forEach((value: RASPUIPage, key: string) => {
            this.serializedPage = value.serialize();
            this.allPagesArr.push(this.serializedPage);
        })

        return this.allPagesArr;
    }

    public serialise(): string {
        let parentJSON = {
            "project": this.name,
            "loginPageId": 1,
            "pages": this.traverePages(),
        };

        return JSON.stringify(parentJSON);
    }

    public deserialize(app: ApiApplication, idx: number): Map<string, RASPUIPage> {
        this.pages.clear();
        if (app.pages) {
            app.pages.forEach((pageData: any, pageIdx: number) => {
                const page = new RASPUIPage();
                page.setName(pageData.name);
                page.setPageNum(pageIdx);

                let pageUIItems = page.deserialize(pageData);
                page.setPageUIItems(pageUIItems);
                this.pages.set(page.getName(), page);
            });
        }
        return this.pages;
    }

    // Get methods
    getName(): string {
        return this.name;
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
    addPage(name: string, page: RASPUIPage) {
        this.pages.set(name, page);
    }

    updatePageUIItems(pageName: string, newUIItems: UIItems): void {
        const page = this.pages.get(pageName);
        if (!page) {
            throw new Error(`Page ${pageName} not found`);
        }
        page.setPageUIItems(newUIItems);
    }
}