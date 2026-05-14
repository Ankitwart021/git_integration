import React, { ReactNode, useRef, useState } from "react";
import RASPUIApplication from "../models/RASPUIApplication";
import RASPUIPage from "../models/RASPUIPage";
import UIElement from "../models/UIElement";
// import UserInfo from "../models/UserInfo";
import { UIItems } from "./boardContext";
import UserInfo from "../models/UserInfo";

export type UserInfoContextType = {
  userInfo: UserInfo;
  updateUserInfo: (applicationName: any, pageName: any, ui_item: any) => void;
  setCurrentPageAndApplication: (
    applicationName: string,
    pageName: string
  ) => void;
  returnPageUIItems: () => UIItems | undefined;
  // deserlisation: (jsonstring: any, currAppIdx: number) => void;
  deserlisation: (appArr: any, appId: string, appName: string,appDescription:string) => void;

};
// create context
export const UserInfoContext = React.createContext<UserInfoContextType>({
  userInfo: new UserInfo(),
  updateUserInfo: () => { },
  setCurrentPageAndApplication: () => { },
  returnPageUIItems: () => {
    return { root: [] };
  },
  deserlisation: () => { },
});
export default UserInfoContext;
type UserContextProviderProps = {
  children: ReactNode;
};
// provider
export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const userInfo = new UserInfo();

  const updateUserInfo = (
    applicationName: any,
    pageName: any,
    newUIItems: any
  ): void => {
    try {
      // userInfo.setCurrentApplicationAndPage(applicationName, pageName);

      userInfo.updatePagesUIItems(applicationName, pageName, newUIItems);
      console.log(
        `Updated UI items for page ${pageName} in application ${applicationName}`
      );
    } catch (error) {
      console.error(error);
    }
  };

  // function that return the PageUIItems of current page current app
  const returnPageUIItems = () => {
    return userInfo.getCurrentPageUIItems();
  };
  // set current page and current application
  const setCurrentPageAndApplication = (
    applicationName: string,
    pageName: string
  ): void => {
    userInfo.setCurrentApplicationAndPage(applicationName, pageName);
  };

  /**
   * Deserialize the given application array and set the current application and page
   * @param {any} appArr - The array of applications to deserialize
   * @param {number} currAppIdx - The index of the application to set as current
   */
  // const deserlisation = (appArr: any, currAppIdx: number) => {
  //   const allApplicationsMap = userInfo.deserialize(appArr);

  //   console.log("deserialization appMap: ", allApplicationsMap);
  //   const currApp: RASPUIApplication = Array.from(allApplicationsMap.values())[
  //     currAppIdx
  //   ];
  //   // if(currApp){
  //   // }

  //   const currPage: RASPUIPage = Array.from(currApp.getPages().values())[0];

  //   userInfo.setCurrentApplicationAndPage(
  //     currApp.getName(),
  //     currPage.getName()
  //   );
  // };
  const deserlisation = (appArr: any, appId: string, appName: string,appDescription:string) => {
    console.log("app name and description in userContext", appName,appDescription)
    const allApplicationsMap = userInfo.deserialize(appArr, appId, appName,appDescription);

    console.log("Deserialization appMap: ", allApplicationsMap);
    const currApp: RASPUIApplication | undefined = allApplicationsMap.get(appName);
    console.log("current application in userContext", currApp)
    if (!currApp) return;

    const currPage: RASPUIPage = Array.from(currApp.getPages().values())[0];

    userInfo.setCurrentApplicationAndPage(
      currApp.getName(),
      currPage.getName()
    );
  };



  const ContextValue: UserInfoContextType = {
    userInfo,
    updateUserInfo,
    setCurrentPageAndApplication,
    returnPageUIItems,
    deserlisation,
  };
  return (
    <UserInfoContext.Provider value={ContextValue}>
      {children}
    </UserInfoContext.Provider>
  );
};
