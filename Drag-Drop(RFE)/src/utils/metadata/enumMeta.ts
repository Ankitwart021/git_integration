
import { enumMetaDataType } from "../../types/metaDataTypes";

export const getEnumMetaData = (
  allEnum: any[]
): enumMetaDataType[] => {
  return allEnum.map((enumData) => ({
    enum_name: enumData.enums.enum_name,
    enum_values: enumData.enums.fieldValues.map(
      (value: any) => value.name
    ),
  }));
};
