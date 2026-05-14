import { useEffect, useState } from "react"
import { fetchEnums } from "../api/enum";
import { useApplicationContext } from "../context/applicationContext";

export const usePageMetaData = (appId: string) => {
    const {selectedAppData} = useApplicationContext();
    return selectedAppData;
}