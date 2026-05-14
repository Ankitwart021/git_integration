import { appMetaDataType } from "../../types/metaDataTypes";

export const getAppMetaData = (userInfo: any): appMetaDataType => {
  const app = userInfo.getCurrentApplication();

  return {
    id: app?.getId() ?? "",
    name: app?.getName() ?? "",
    description: app?.getDescription() ?? "",
  };
};
