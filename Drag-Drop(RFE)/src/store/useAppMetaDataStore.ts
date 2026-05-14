
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getUserIdFromJWT } from "../utils/utils"
import { appMetaDataType, enumMetaDataType, pageMetaDataType, resourceMetaDataType } from "../types/metaDataTypes";
import { userAppMetaData } from "../hooks/useAppMetaData";




//store type
interface AppMetaDataStore {
    userAppMetaData: any;
    currApplicationId: any;
    setAppIdInStore: (appId: any) => void;
    getAppIdFromStore: () => any;
    getSelectedResourceMetaData: (appId:any,resName:any) => any;
    setAppMetaData: (appId: string, appMetaData: appMetaDataType, pageMetaData: pageMetaDataType[], resourceMetaData?: resourceMetaDataType[], enumMetaData?: enumMetaDataType[]) => void
    getSelectedEnumValues: (appId: string, enumName: string) => any[];
    clearMetaData: () => void
}



export const useAppMetaDataStore = create<AppMetaDataStore>()(


    persist(
        (set, get) => ({
            userAppMetaData: {},
            currApplicationId: "",
            setAppMetaData: (appId, appMetaData, pageMetaData, resourceMetaData, enumMetaData) => {
                const userId = getUserIdFromJWT();
                if (!userId || !appId) return;
                set((state) => ({
                    userAppMetaData: {
                        ...state.userAppMetaData,
                        [userId]: {
                            ...(state.userAppMetaData[userId] || {}),
                            [appId]: {
                                ...(state.userAppMetaData[userId]?.[appId] || {}),
                                "name": appMetaData.name,
                                "pageMetaData": pageMetaData,
                                "resourceMetaData": resourceMetaData,
                                "enumMetaData": enumMetaData

                            }

                        }
                    }
                }))
            },
            setAppIdInStore: (appId) => {
                set((state) => ({
                    currApplicationId: appId
                }))
            },
            getAppIdFromStore: () => {
                return get().currApplicationId;
            },
            getSelectedResourceMetaData: (appId:any,resName:any) => {
                const userId = getUserIdFromJWT();
                if (!userId|| !appId) {return {} }
                console.log("resource meta in table model in store" , get().userAppMetaData[userId]?.[appId]?.['resourceMetaData'].filter((resObj:any)=>resObj.resourceName==='Student'));
                return get().userAppMetaData[userId]?.[appId]?.['resourceMetaData'].filter((resObj:any)=>resObj.resourceName===resName)[0] || {};
            },
            getSelectedEnumValues: (appId, enumName) => {

                const userId = getUserIdFromJWT();
                if (!userId || !appId) return [];
                const enumObj = get().userAppMetaData[userId]?.[appId]?.['enumMetaData']?.find((enumItem: enumMetaDataType) => enumItem.enum_name === enumName);
                console.log("all items in dropdown enum", enumObj);
                return enumObj?.enum_values || [];
            },

            clearMetaData: () => {
                const userId = getUserIdFromJWT();
                if (!userId) return;
                set((state) => {
                    const newState = { ...state.userAppMetaData };
                    delete newState[userId]
                    return { userAppMetaData: newState }
                })
            }
        }),

        {
            name: "appMetaData-store"
        }
    )


)