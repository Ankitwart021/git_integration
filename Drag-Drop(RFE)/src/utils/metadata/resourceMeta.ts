import { resourceMetaDataType } from "../../types/metaDataTypes";

export const getResourceMetaData = (
  allResources: any[]
): resourceMetaDataType[] => {
  return allResources.map((res) => ({
    resourceName: res.resourceName,
    fieldValues: res.attributes.fieldValues,
  }));
};
