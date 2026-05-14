import { useQuery } from "@tanstack/react-query";
import apiConfig from "../config/apiConfig";
export const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

const fetchDataById = async (id: string, resourceName: string) => {
//   const baseUrl = 'http://localhost:8082/api/airline';

const baseUrl = apiConfig.getResourceUrl(resourceName.toLowerCase());

  const params = new URLSearchParams({
    args: `id:${id}`,
    queryId: 'GET_BY_ID',
  });

  const url = `${baseUrl}?${params.toString()}`;
const accessToken = getCookie("access_token");
  const response = await fetch(url,{
    headers: {
        //   "Content-Type": "application/x-www-form-urlencoded",
          'Authorization': `Bearer ${accessToken}`, // Add token here
        },
        credentials: 'include', // include cookies if needed
  });
  if(response.status === 401){
    window.location.href = apiConfig.LOGIN_URL;
  }
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data;
};

export const useGetById = (id: string, resourceName: string) => {
  return useQuery({
    queryKey: ['getById', resourceName, id],
    queryFn: () => fetchDataById(id, resourceName),
    enabled: !!id && !!resourceName,
  });
};