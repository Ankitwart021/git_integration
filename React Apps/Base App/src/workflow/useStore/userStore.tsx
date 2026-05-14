import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User{
    id: string;
    name: string,
    role: string, 
}

interface UserStoreState{
    currentUser:any;
    setCurrentUser: (user: any) => void;
}

export const useUserStore = create<UserStoreState>()(
  devtools((set) => ({
    currentUser: null,
    setCurrentUser: (user: any) => set({ currentUser: user }),
  }))
);