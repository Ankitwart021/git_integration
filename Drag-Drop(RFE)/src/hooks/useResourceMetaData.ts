import { useEffect, useState } from "react"
import { fetchEnums } from "../api/enum";
import { fetchResources } from "../api/resources";

export const useResourceMetaData = (appId: string) => {
    const [allResourceMetaData, setAllResourceMetaData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            if (!appId) return;
            let data: any = await fetchResources(appId);
            setAllResourceMetaData(data);
        };
        fetchData();
    }, [appId])

    return allResourceMetaData;
}