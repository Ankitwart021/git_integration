import { useContext, useCallback } from "react";
import { getCookieValue } from "../utils/utils";
import { useApplicationContext } from "../context/applicationContext";
import UserInfoContext from "../context/userContext";
import apiConfig from "../config/apiConfig";

export const useFetchAppContext = () => {
  const {
    setSelectedAppData,
    setSelectedAppName,
    setSelectedAppDescription
  } = useApplicationContext();

  const { deserlisation } = useContext(UserInfoContext);

  const fetchAppContext = useCallback(async (appId: string) => {
    const token = getCookieValue("jwt");
    if (!token) {
      alert("Please login again");
      return;
    }

    try {
      const res = await fetch(`${apiConfig.API_BASE_URL}/setAppContext/${appId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });

      const result = await res.json();
      console.log("resultttttttttt", result);

      if (result?.application && Array.isArray(result.pages)) {
        const { application, pages } = result;

        setSelectedAppName(application.name || "");
        setSelectedAppDescription(application.description || "");
        setSelectedAppData(pages || []);
        deserlisation(pages, appId || "", application.name || "", application.description || "");

        console.log("Context from backend:", {
          name: application.name,
          description: application.description,
          pagesCount: pages.length,
        });
      } else {
        console.warn("No valid application data found");
      }
    } catch (err) {
      console.error("Error rehydrating context:", err);
    }
  }, [setSelectedAppName, setSelectedAppDescription, setSelectedAppData, deserlisation]);

  return fetchAppContext;
};
