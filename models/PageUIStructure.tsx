import { UIItems } from "../context/board-context";

export default class PageUIStructure  {

    private name:string;
    // private pageMap: Map<number, UIItems>
    private pageNo:number;
    private page:UIItems;

    
    constructor(pageNo:number){
    
        this.name='';
        this.pageNo=pageNo;
        this.page={ root: [] }

        // this.pageMap = new Map<number, UIItems>();
    }

    // public createPageFromAPIData(data:JSON): PageUIStructure {
    //     return new PageUIStructure();
    // }

    public getPage=()=>{
        return this.page;
    }

    public setPage=(page:UIItems)=>{
        this.page=page;
    }

    public getPageNo=()=>{
        return this.pageNo;
    }

    public setPageNo=(pageNo:number)=>{
        this.pageNo=pageNo;
    }
    public setName=(pageName:string)=>{
        this.name=pageName;
    }
    public getName = ()=>{
        return this.name;
    }
    
    // public setPageMap= (mpp:Map<number,UIItems>)=>{
    //     this.pageMap=mpp;
    // }

    // public getMap = ()=> {
    //     return this.pageMap;
    // }

}
