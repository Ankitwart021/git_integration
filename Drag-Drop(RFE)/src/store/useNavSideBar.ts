import { create } from "zustand";
import { persist } from "zustand/middleware";
import SelectedNavbar from "../models/SelectedNavbar";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import SelectedSidebar from "../models/SelectedSidebar";



// --- Helper: extract userId from JWT in cookies ---
const getUserIdFromJWT = (): string | null => {
    try {
        const token = Cookies.get("jwt"); // adjust cookie name if different
        if (!token) return null;

        const decoded: any = jwtDecode(token);
        console.log("all the resource but selected decoded", decoded)
        // assuming your token payload has "userId" or "sub" field
        return decoded.userId || decoded.sub || null;
    } catch {
        return null;
    }
};

interface NavSideBarStore {
    //navbar object

    getNavbarObj: (appId: any) => any;
    setNavbarObj: (appId: any, navObj: any) => void;
    navabarModel: any;

    //sidebar obj

    getSidebarObj: (appId: any) => any;
    setSidebarObj: (appId: any, sidebarObj: any) => void;
    sidebarModel: any;
    clearNavSidebarData:()=>void;

}

export const useNavSideBarStore = create<NavSideBarStore>()(
    persist(
        (set, get) => ({

            // navabarModel: new SelectedNavbar(),
            navabarModel: {},
            // sidebarModel: new SelectedSidebar(),
            sidebarModel: {},
            setNavbarObj: (appId: any, navObj: any) => {
                console.log("my navbar obj in the setnavbarobj",navObj);
                const userId = getUserIdFromJWT();
                if (!userId || !appId) return;
                const obj = new SelectedNavbar()
                let navJson = obj.serialise();
                if(navObj instanceof SelectedNavbar){

                     navJson = navObj.serialise()
                }
                set((state: any) => ({
                    navabarModel: {
                        ...state.navabarModel,
                        [userId]: {
                            ...(state.navabarModel[userId] || {}),
                            [appId]: navJson,
                        }
                    }
                }))


            },
            getNavbarObj: (appId: any) => {
                const userId:any = getUserIdFromJWT()
                if (!userId || !appId) return {};
                console.log("getNavbarObjjjjjj",get().navabarModel[userId]);
                const stored = get().navabarModel[userId]?.[appId];
                return stored ? SelectedNavbar.deserialise(stored):{};

            },
            setSidebarObj: (appId: any, sidebarObj: any) => {
                const userId = getUserIdFromJWT();
                if (!userId || !appId) return;
                const obj = new SelectedSidebar();
                let sidebarJson=obj.serialise()
                if(sidebarObj instanceof SelectedSidebar){

                    sidebarJson = sidebarObj.serialise()
                }
                set((state: any) => ({
                    sidebarModel: {
                        ...state.sidebarModel,
                        [userId]: {
                            ...(state.sidebarModel[userId] || {}),
                            [appId]: sidebarJson,
                        }
                    }
                }))

            },
            getSidebarObj: (appId: any) => {
                const userId = getUserIdFromJWT()
                if (!userId || !appId) return {};
                const stored = get().sidebarModel[userId]?.[appId]
                return stored ? SelectedSidebar.deserialise(stored):{};
               

            },


            clearNavSidebarData: () => {
                const userId = getUserIdFromJWT();
                if (!userId) return;
                set((state) => {
                    const newStateNavbar = { ...state.navabarModel };
                    const newStateSidebar = { ...state.sidebarModel };

                    delete newStateNavbar[userId];
                    delete newStateSidebar[userId];
                    return { navabarModel: newStateNavbar, sidebarModel: newStateSidebar }
                })
            }

        }),
        {
            name: 'navbar-sidebar-store'
        }
    )
)