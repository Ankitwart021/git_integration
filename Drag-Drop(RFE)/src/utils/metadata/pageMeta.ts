import { pageMetaDataType } from "../../types/metaDataTypes";

export const getPageMetaData = (
  selectedAppData: any[]
): pageMetaDataType[] => {
  return selectedAppData.map((page) => ({
    id: page.id,
    applicationID: page.applicationID,
    pageName: page.pageName,
    pageContent: page.pageContent,
  }));
};
