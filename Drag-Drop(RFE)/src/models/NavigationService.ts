import { NavigateFunction } from "react-router-dom";
import { getAppIdFromUrl } from "../utils/utils";

class NavigationService {
  private navigateFn: NavigateFunction | null = null;
  private appId: string | null = null;

  setNavigate(navigate: NavigateFunction) {
    this.navigateFn = navigate;
  }

  setAppId(appId: string) {
    this.appId = appId;
  }

  navigateToEdit(itemId: string, rowData: any) {
    // if (!this.navigateFn || !this.appId) {
    //   console.log("NavigationService not initialized",this.navigateFn,getAppIdFromUrl());
    //   console.error("NavigationService not initialized",this.navigateFn,getAppIdFromUrl());
    //   return;
    // }
    console.log("NavigationService not initialized",getAppIdFromUrl(),rowData);

    if (this.navigateFn) {
      this.navigateFn(`/${getAppIdFromUrl()}/edit/${itemId}`, {
        state: { rowData: rowData },
      });
    } else {
      console.error("Navigation function is not set.");
    }
  }
}

export default new NavigationService();
