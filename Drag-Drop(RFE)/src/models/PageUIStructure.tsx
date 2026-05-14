import { UIItems } from "../context/boardContext";

export default class PageUIStructure {
  private name: string;
  private pageNo: number;
  private page: UIItems;

  constructor(pageNo: number) {
    this.name = "";
    this.pageNo = pageNo;
    this.page = { root: [] };

  }



  public getPage = () => {
    return this.page;
  };

  public setPage = (page: UIItems) => {
    this.page = page;
  };

  public getPageNo = () => {
    return this.pageNo;
  };

  public setPageNo = (pageNo: number) => {
    this.pageNo = pageNo;
  };
  public setName = (pageName: string) => {
    this.name = pageName;
  };
  public getName = () => {
    return this.name;
  };


}
