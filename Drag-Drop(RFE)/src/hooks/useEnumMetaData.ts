import { useEffect, useState } from "react"
import { fetchEnums } from "../api/enum";

export const useEnumMetaData = (appId:string)=>{
    const [allEnumMetaData, setAllEnumMetaData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            if(!appId) return ;
            let data:any = await fetchEnums(appId);
            setAllEnumMetaData(data);
        };
        fetchData();
    },[appId])

    return allEnumMetaData
}