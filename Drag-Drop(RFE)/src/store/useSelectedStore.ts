import { create } from 'zustand';

interface SelectedStoreState {
  isSelected: boolean;
  typeSelected: 'node' | 'edge' | null;
  idSelected: string | null;
  panelMode: 'properties' | 'io' | null;
  setSelected: (type: 'node' | 'edge' | null, id: string | null, mode?: 'properties' | 'io') => void;
  getIsSelected: () => boolean;
  getTypeSelected: () => 'node' | 'edge' | null;
  getIdSelected: () => string | null;
  clearSelection: () => void;
  setPanelMode: (mode: 'properties' | 'io' | null) => void;
}

export const useSelectedStore = create<SelectedStoreState>((set, get) => ({
  isSelected: false,
  typeSelected: null,
  idSelected: null,
  panelMode: null,
  
  setSelected: (type, id, mode) => {
    set({
      isSelected: type !== null && id !== null,
      typeSelected: type,
      idSelected: id,
      panelMode: mode,
    });
  },
  
  setPanelMode: (mode) => {
    set({
      panelMode: mode,
    });
  },  
  getIsSelected: () => get().isSelected,
  
  getTypeSelected: () => get().typeSelected,
  
  getIdSelected: () => get().idSelected,
  
  clearSelection: () => {
    set({
      isSelected: false,
      typeSelected: null,
      idSelected: null,
    });
  },
}));
