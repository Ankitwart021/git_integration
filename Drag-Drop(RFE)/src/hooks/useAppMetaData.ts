import { useEffect, useState } from "react"
import { useEnumMetaData } from "./useEnumMetaData";
import { useResourceMetaData } from "./useResourceMetaData";
import { usePageMetaData } from "./usePageMetaData";
import { useAppMetaDataViewModel } from "../viewModels/useAppMetaDataViewModel";

export const userAppMetaData = (appId: any) => {

    const allEnumMetaData = useEnumMetaData(appId);
    const allResourcesMetaData = useResourceMetaData(appId);
    const allPageMetaData = usePageMetaData(appId);


    const { storeAppMetaData } = useAppMetaDataViewModel();
    useEffect(() => {

        if (!appId) return;

        storeAppMetaData(appId,
            allPageMetaData,
            allResourcesMetaData,
            allEnumMetaData
        )

    }, [appId, allEnumMetaData, allResourcesMetaData, allPageMetaData]);

}