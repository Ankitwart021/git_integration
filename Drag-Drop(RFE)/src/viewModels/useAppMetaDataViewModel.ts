import { useContext } from "react";
import { useAppMetaDataStore } from "../store/useAppMetaDataStore"
import UserInfoContext from "../context/userContext";
import { getAppMetaData, getEnumMetaData, getPageMetaData, getResourceMetaData } from "../utils/metadata";

export const useAppMetaDataViewModel = () => {

  const { userInfo, updateUserInfo, deserlisation } = useContext(UserInfoContext);

  const setAppMetaData = useAppMetaDataStore(
    (state) => state.setAppMetaData
  )

  const storeAppMetaData = (appId: string, pageMetaData: any, resourcesMetaData: any, enumMetaData: any) => {

    setAppMetaData(
      appId,
      getAppMetaData(userInfo),
      getPageMetaData(pageMetaData),
      getResourceMetaData(resourcesMetaData),
      getEnumMetaData(enumMetaData)
    );
  }
  return {
    storeAppMetaData,

  }
}