//resource meta data types
type fielValuesType=any[]
export interface resourceMetaDataType {
    "resourceName":string;
    "fieldValues":fielValuesType

}


//app meta data types
export type appMetaDataType = {
    "id":string,
    "name":string,
    "description": string
   
}


//page meta data types
type pageContentType ={
    "apis":any
    "html":any
    "styles":any
    "attrMapp":any
    "resource":any
    "component":any
    "operation":any
    "viewModeMap":any
}    

export interface pageMetaDataType{
    "id":string,
    "applicationID":string,
    "pageName":string,
    "pageContent":pageContentType

}    






//enum meta data types
type enumValuesType=string[];
export interface enumMetaDataType{
    "enum_name":string,
    "enum_values":enumValuesType
}
