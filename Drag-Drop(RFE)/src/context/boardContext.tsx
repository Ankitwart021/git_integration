import React, { ReactNode, useContext, useEffect } from "react";
import UIElement from "../models/UIElement";
import Resource from "../models/Resources";
import { findPathById } from "../utils/utils";

export type UIItems = {
  [key: string]: any[];
};

export type BoardContextType = {
  
  hoveredItemId: string | null; // Store the uniqueId of the hovered element
  setHoveredItemId: (uniqueId: string | null) => void; // Function to update the hovered state


  dataToSaveInStore:any;
  setDataToSaveInStore: (data: any) => void; // Function to update the data to save in store
  dataToSaveForEdit: any;
  setDataToSaveForEdit: (data: any) => void; // Function to update the data to save for edit
  // BOARD
  board: {
    ui_items: UIItems;
    // currPage: number,
    currPageName: string;
    currApplicationName: string;
  };
  moveItemWithChildren:(
     targetUIItems: any,
  item: any,
  newPath: string
  )=>void,
  addUIItem: (
    ui_item: any,
    path: string,
    currPageName: any,
    currApplicationName: any
  ) => void;
  addUIItemAtIdx: (
    ui_item: UIElement,
    path: string,
    updatedMap: UIItems,
    index?: number
  ) => UIItems;
  updateBoardUIItems: (
    ui_items: UIItems | undefined,
    currPageName: string | undefined,
    currApplicationName: string | undefined
  ) => void;
  updateBoardUIItemForViewStyle: (
    uniqueId: string,
    path: string,
    newItem: UIElement
  ) => void;
  updateBoardElementClasses: (
    uniqueId: string,
    path: string,
    newClasses: string
  ) => void;
  updateBoardElementStyles: (
    uniqueId: string,
    path: string,
    newStyles: React.CSSProperties
  ) => void;
  updateBoardElementItemsText: (
    uniqueId: string,
    path: string,
    text: string,
    setMethod: Function
  ) => void;

  updateBoardResourceOperation: (
    uniqueId: string,
    path: string,
    operationName: string
  ) => void;
  deleteRaspUIElement: (uniqueId: string, path: string) => void;
  updateBoardElementItems: (
    uniqueId: string,
    path: string,
    newItems: any[]
  ) => void;
  updateBoardArrayElementItems: (
    uniqueId: string,
    path: string,
    arr: string[],
    setArrMethod: Function
  ) => void;

  moveItem: (droppedOnItem: any, droppedItem: any, targetIdx: any) => void; // Function to move an item from one path to another
  moveItem2: (
    droppedOnItem: UIElement,
    droppedItem: UIElement,
    targetIdx: number
  ) => void;
  // moveUIItem:(
  //   uiItemToMove: UIElement,
  //   sourcePath: string,
  //   sourceIndex: number,
  //   targetPath: string,
  //   targetIndex: number

  // )=>void

  // CUSTOM COMPONENT
  customComponent: {
    ui_items_cc: UIItems;
    isReadyToSend: boolean;
  };
  addUIItemCC: (item: UIElement, path: string, objJson: string) => void;
  emptyUIItemsCC: () => void;
  setReadyToSendCC: (status: boolean) => void;
};

// create context
let BoardContext = React.createContext<BoardContextType>({
  hoveredItemId: null, // Initially, no element is hovered
  setHoveredItemId: () => {}, // Empty function placeholder
  dataToSaveInStore: {}, // Initially, no data to save
  setDataToSaveInStore: () => {}, // Empty function placeholder
  dataToSaveForEdit: {}, // Initially, no data to save for edit
  setDataToSaveForEdit: () => {}, // Empty function placeholder

  board: {
    ui_items: { root: [] },
    // currPage: 1,
    currPageName: "",
    currApplicationName: "",
  },
  moveItemWithChildren:()=>{},
  addUIItem: () => {},
  addUIItemAtIdx: () => ({}),
  updateBoardUIItems: () => {},
  updateBoardUIItemForViewStyle: () => {},
  updateBoardElementClasses: () => {},
  updateBoardElementStyles: () => {},
  updateBoardElementItemsText: () => {},
  updateBoardResourceOperation: () => {},
  deleteRaspUIElement: () => {},
  updateBoardElementItems: () => {},
  updateBoardArrayElementItems: () => {},
  customComponent: {
    ui_items_cc: { root: [] },
    isReadyToSend: false,
  },
  addUIItemCC: () => {},
  emptyUIItemsCC: () => {},
  setReadyToSendCC: () => {},
  moveItem: () => {}, // Placeholder for moveItem function
  moveItem2: () => {}, // Placeholder for moveItem function
});

export default BoardContext;
type BoardContextProviderProps = {
  children: ReactNode;
};

export const BoardContextProvider: React.FC<BoardContextProviderProps> = ({
  children,
}) => {
  // Board state
  const [board, setBoard] = React.useState<BoardContextType["board"]>({
    ui_items: { root: [] },
    // currPage: 1,
    currPageName: "",
    currApplicationName: "",
  });
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
  const [dataToSaveInStore, setDataToSaveInStore] = React.useState<any>({});
  const [dataToSaveForEdit, setDataToSaveForEdit] = React.useState<any>({});
  // custom component state
  const [customComponent, setCustomComponent] = React.useState<
    BoardContextType["customComponent"]
  >({
    ui_items_cc: { root: [] },
    isReadyToSend: false,
  });

  // BOARD FUNCTIONS

const moveItemWithChildren = (
  targetUIItems: any,
  item: any,
  newPath: string
) => {
  const oldPath = item.getPath();

  // set new path
  item.setPath(newPath);

  // add item to new path
  if (!targetUIItems[newPath]) {
    targetUIItems[newPath] = [];
  }
  targetUIItems[newPath].push(item);

  // if container, recursively move children
  if (item.isContainer?.() || item.isListingContainer?.()) {
    const oldContainerPath = `${oldPath}/container${item.getId()}`;
    const newContainerPath = `${newPath}/container${item.getId()}`;

    const children = targetUIItems.__source?.[oldContainerPath] || [];

    targetUIItems[newContainerPath] = [];

    children.forEach((child: any) => {
      moveItemWithChildren(targetUIItems, child, newContainerPath);
    });
  }
};


  const addUIItem = (
    ui_item: UIElement,
    path: string,
    currPageName: any,
    currApplicationName: any
  ) => {
    setBoard((prevBoard: BoardContextType["board"]) => {
      console.log("add itemmmmmm", ui_item);
      const updatedItems = { ...prevBoard.ui_items };
      if (!updatedItems[path]) {
        updatedItems[path] = [];
      }

      if (ui_item.isListingContainer() || ui_item.isContainer()) {
        const new_path = `${path}/container${ui_item.getId()}`;
        updatedItems[new_path] = [];
      }

      ui_item.setPath(path);
      updatedItems[path].push(ui_item);

      return {
        ...prevBoard,
        ui_items: updatedItems,
        currPageName: currPageName,
        currApplicationName: currApplicationName,
      };
    });
  };

 const updateBoardUIItemForViewStyle = (
    uniqueId: string,
    path: string,
    newItem: UIElement
  ) => {
    setBoard((prevBoard) => {
      const updatedItems = { ...prevBoard.ui_items };

      // If no items exist at this path, return the previous board unchanged
      if (!updatedItems[path]) {
        return prevBoard;
      }

      // Replace the old item with the new one based on uniqueId
      updatedItems[path] = updatedItems[path].map((item: UIElement) => {
        if (item.getId() === uniqueId) {
          // ensure the new item inherits the same path
          newItem.setPath(path);
          return newItem;
        }
        return item;
      });

      return {
        ...prevBoard,
        ui_items: updatedItems,
      };
    });
  };

  const updateBoardElementClasses = (
    uniqueId: string,
    path: string,
    newClasses: string
  ) => {
    setBoard((prevBoard) => {
      const updatedItems = { ...prevBoard.ui_items };
      if (!updatedItems[path]) {
        return prevBoard;
      }
      // console.log("Page Map after updating the Bootstrap: ", pageMap);

      updatedItems[path] = updatedItems[path].map((item: any) => {
        if (item.getId() === uniqueId) {
          item.setClasses(newClasses);
        }
        return item;
      });

      return {
        ...prevBoard,
        ui_items: updatedItems,
      };
    });
  };

  const updateBoardElementStyles = (
    uniqueId: string,
    path: string,
    newStyles: React.CSSProperties
  ) => {
    setBoard((prevBoard) => {
      const updatedItems = { ...prevBoard.ui_items };
      if (!updatedItems[path]) {
        return prevBoard;
      }

      updatedItems[path] = updatedItems[path].map((item: any) => {
        if (item.getId() === uniqueId) {
          item.setStyles(newStyles);
        }
        return item;
      });

      return {
        ...prevBoard,
        ui_items: updatedItems,
      };
    });
  };
  
  const deleteRaspUIElement = (uniqueId: string, path: string) => {
    setBoard((prevBoard) => {
      const new_ui_items = { ...prevBoard.ui_items };

      // Helper recursive function to delete nested containers
      const deleteRecursively = (id: string, currentPath: string) => {
        const items = new_ui_items[currentPath];
        if (!items) return;

        // Find the item to remove
        const itemToRemove = items.find((item) => item.getId() === id);

        // Remove the item from current path
        new_ui_items[currentPath] = items.filter((item) => item.getId() !== id);

        // If it’s a container, find its path and recursively delete its contents
        if (
          itemToRemove &&
          (itemToRemove.isContainer?.() || itemToRemove.isListingContainer?.())
        ) {
          const containerPath = `${currentPath}/container${id}`;

          // If this container has children, recursively delete each
          const childItems = new_ui_items[containerPath] || [];
          for (const child of childItems) {
            deleteRecursively(child.getId(), containerPath);
          }

          // Finally, delete the container path itself
          delete new_ui_items[containerPath];
        }
      };

      // Start the recursive deletion
      deleteRecursively(uniqueId, path);

      return {
        ...prevBoard,
        ui_items: new_ui_items,
      };
    });
  };

  const updateBoardResourceOperation = (
    uniqueId: any,
    path: any,
    operationName: any
  ) => {
    setBoard((prevBoard) => {
      const new_ui_items = { ...prevBoard.ui_items };

      if (!new_ui_items[path]) return prevBoard;

      new_ui_items[path] = new_ui_items[path].map((item) => {
        if (item.getId() === uniqueId) {
          const element = item as Resource;
          element.setSelectedOp(operationName);
          item = element;
        }
        return item;
      });

      return {
        ...prevBoard,
        ui_items: new_ui_items,
      };
    });
  };

  const updateBoardElementItemsText = (
    uniqueId: any,
    path: any,
    text: any,
    setMethod: Function
  ) => {
    // console.log("New text", setMethod(text));
    setBoard((prevBoard) => {
      const new_ui_items = { ...prevBoard.ui_items };

      if (!new_ui_items[path]) {
        return prevBoard;
      }

      new_ui_items[path] = new_ui_items[path].map((item) => {
        if (item.getId() === uniqueId) {
          setMethod(text);
        }
        return item;
      });

      return {
        ...prevBoard,
        ui_items: new_ui_items,
      };
    });
  };
  const updateBoardElementItems = (
    uniqueId: string,
    path: string,
    items: string[]
  ) => {
    console.log("New items", items);
    setBoard((prevBoard) => {
      const new_ui_items = { ...prevBoard.ui_items };

      if (!new_ui_items[path]) {
        return prevBoard;
      }

      new_ui_items[path] = new_ui_items[path].map((item) => {
        if (item.getId() === uniqueId) {
          item.setItems(items);
        }
        return item;
      });

      return {
        ...prevBoard,
        ui_items: new_ui_items,
      };
    });
  };
  const updateBoardArrayElementItems = (
    uniqueId: any,
    path: any,
    arr: string[],
    setArrMethod: Function
  ) => {
    // console.log("New text", setMethod(text));
    setBoard((prevBoard) => {
      const new_ui_items = { ...prevBoard.ui_items };

      if (!new_ui_items[path]) {
        return prevBoard;
      }

      new_ui_items[path] = new_ui_items[path].map((item) => {
        if (item.getId() === uniqueId) {
          setArrMethod(arr);
        }
        return item;
      });

      return {
        ...prevBoard,
        ui_items: new_ui_items,
      };
    });
  };

  const updateBoardUIItems = (
    ui_items: UIItems | undefined,
    currPageName: string | undefined,
    currApplicationName: string | undefined
  ) => {
    setBoard((prevBoard: any) => {
      return {
        ...prevBoard,
        ui_items: ui_items,
      };
    });
  };

  // CUSTOM COMPONENT FUNCTIONS
  const addUIItemCC = (ui_item: UIElement, path: string, objJson: string) => {
    console.log("first obj: context", ui_item);
    setCustomComponent((prevCC) => {
      const updatedItems = { ...prevCC.ui_items_cc };
      // if (!updatedItems[path]) {
      //   updatedItems[path] = [];
      // }

      if (ui_item.isListingContainer() || ui_item.isContainer()) {
        console.log("first obj: insideContainer");
        const new_path = `${path}/container${ui_item.uniqueId}`;
        updatedItems[new_path] = [];
      }

      // ui_item.setPath(path);
      let parsedObjJson = JSON.parse(objJson);
      parsedObjJson.path = path;
      objJson = JSON.stringify(parsedObjJson);

      updatedItems[path].push(objJson);
      console.log("first obj: UpdatedUIItems: ", updatedItems);

      return {
        ...prevCC,
        ui_items_cc: updatedItems,
      };
    });
  };
  const setReadyToSendCC = (status: boolean) => {
    setCustomComponent((prev) => {
      return {
        ...prev,
        isReadyToSend: status,
      };
    });
  };

  const emptyUIItemsCC = () => {
    setCustomComponent((prevCC) => {
      return {
        ...prevCC,
        ui_items_cc: { root: [] },
        isReadyToSend: false,
      };
    });
  };

  const addUIItemAtIdx = (
    ui_item: UIElement,
    path: string,
    updatedMap: UIItems = {},
    index?: number
  ) => {
    if (!updatedMap[path]) {
      updatedMap[path] = [];
    }

    if (ui_item.isListingContainer?.() || ui_item.isContainer?.()) {
      const new_path = `${path}/container${ui_item.getId()}`;
      if (!updatedMap[new_path]) {
        updatedMap[new_path] = [];
      }
    }

    ui_item.path = path;

    if (
      typeof index === "number" &&
      index >= 0 &&
      index <= updatedMap[path].length
    ) {
      updatedMap[path].splice(index, 0, ui_item);
    } else {
      updatedMap[path].push(ui_item);
    }

    return updatedMap;
  };

  const traverseComponent = (
    oldPath: string,
    newPath: string,
    delUiItemsMap: Record<string, UIElement[]>,
    updatedMap: UIItems
  ) => {
    const elements = delUiItemsMap[oldPath] || [];
    elements.forEach((item) => {
      addUIItemAtIdx(item, newPath, updatedMap);

      if (item.isContainer?.() || item.isListingContainer?.()) {
        const nestedOldPath = `${oldPath}/container${item.uniqueId}`;
        const nestedNewPath = `${newPath}/container${item.uniqueId}`;
        traverseComponent(
          nestedOldPath,
          nestedNewPath,
          delUiItemsMap,
          updatedMap
        );
      }
    });
  };

  const traveseContainer = (originalPath: string, newPath: string) => {
    const arr = board.ui_items[originalPath] || [];
    arr.map((item: UIElement) => {
      addUIItem(item, newPath, board.currPageName, board.currApplicationName);
      if (item.isContainer?.() || item.isListingContainer?.()) {
        const nestdedOldPath = `${originalPath}/container${item.getId()}`;
        const nestedNewPath = `${newPath}/container${item.getId()}`;
        traveseContainer(nestdedOldPath, nestedNewPath);
      }
    });
  };

  const moveItem2 = (
    droppedOnItem: UIElement,
    droppedItem: UIElement,
    targetIdx: number
  ) => {
    setBoard((prevBoard) => {
      const new_ui_items = { ...prevBoard.ui_items };

      const originPath = droppedItem.getPath();
      const targetIsContainer =
        droppedOnItem.isContainer() || droppedOnItem.isListingContainer();

      const newPath = targetIsContainer
        ? `${droppedOnItem.getPath()}/container${droppedOnItem.getId()}`
        : droppedOnItem.getPath();

      // Prevent dropping a container on itself
      if (droppedItem.uniqueId === droppedOnItem.uniqueId) {
        return prevBoard;
      }

      // Prevent dropping container into its own subtree
      const isDroppingInSelf = (container: UIElement, target: UIElement) => {
        const containerBasePath = `${container.getPath()}/container${container.getId()}`;
        return newPath.startsWith(containerBasePath);
      };

      if (
        droppedItem.isContainer() &&
        isDroppingInSelf(droppedItem, droppedOnItem)
      ) {
        console.warn("Cannot drop a container into its own subtree.");
        return prevBoard;
      }

      // 1. Remove droppedItem from its origin
      const originArr = [...(new_ui_items[originPath] || [])];
      new_ui_items[originPath] = originArr.filter(
        (item) => item.uniqueId !== droppedItem.uniqueId
      );
      if (!new_ui_items[originPath] || new_ui_items[originPath].length === 0) {
        delete new_ui_items[originPath];
      }

      // 2. Update the droppedItem path
      droppedItem.setPath(newPath);

      // 3. Insert droppedItem into target
      const targetArr = [...(new_ui_items[newPath] || [])];
      const updatedArr: UIElement[] = [];

      let inserted = false;
      for (let i = 0; i < targetArr.length; i++) {
        const currItem = targetArr[i];
        updatedArr.push(currItem);

        if (
          !targetIsContainer &&
          currItem.uniqueId === droppedOnItem.uniqueId
        ) {
          updatedArr.push(droppedItem);
          inserted = true;
        }
      }

      if (targetIsContainer || !inserted) {
        updatedArr.unshift(droppedItem);
      }

      new_ui_items[newPath] = updatedArr;

      // 🔁 4. Move subtree if droppedItem is a container
      if (droppedItem.isContainer() || droppedItem.isListingContainer()) {
        const oldContainerPath = `${originPath}/container${droppedItem.getId()}`;
        const newContainerPath = `${newPath}/container${droppedItem.getId()}`;

        const moveSubtree = (oldPath: string, newPath: string) => {
          const children = new_ui_items[oldPath];
          if (!children) return;

          const movedChildren: UIElement[] = [];

          for (const child of children) {
            child.setPath(newPath);
            movedChildren.push(child);

            if (child.isContainer() || child.isListingContainer()) {
              const childOldPath = `${oldPath}/container${child.getId()}`;
              const childNewPath = `${newPath}/container${child.getId()}`;
              moveSubtree(childOldPath, childNewPath);
            }
          }

          new_ui_items[newPath] = movedChildren;
          if (oldPath !== newPath) {
            // Avoid deleting the path if it hasn't changed
            delete new_ui_items[oldPath];
          }
        };

        moveSubtree(oldContainerPath, newContainerPath);
      }

      return {
        ...prevBoard,
        ui_items: new_ui_items,
      };
    });
  };

  function moveItem(droppedOnItem: any, droppedItem: any, targetIdx: number) {
    const updatedMap: UIItems = {};
    const removedItemsByPath: Record<string, UIElement[]> = {};

    const path = droppedItem.path;
    // Step 1: Find and remove droppedItem from its current location
    const idx = board.ui_items[path]?.findIndex(
      (item) => item.uniqueId === droppedItem.uniqueId
    );

    if (idx === -1 || idx === undefined) {
      console.error("Dropped item not found at path:", path);
      return;
    }

    const isContainer =
      droppedItem.isContainer?.() || droppedItem.isListingContainer?.();

    if (isContainer) {
      const pathsToRemove = Object.keys(board.ui_items).filter(
        (p) => p === path || p.startsWith(`${path}/`)
      );

      for (const nestedPath of pathsToRemove) {
        const removedItems: UIElement[] = [];

        board.ui_items[nestedPath] = board.ui_items[nestedPath].filter(
          (item) => {
            const shouldRemove =
              nestedPath === path
                ? item.uniqueId === droppedItem.uniqueId
                : true;

            if (shouldRemove) {
              removedItems.push(item);
              return false;
            }
            return true;
          }
        );

        if (removedItems.length > 0) {
          removedItemsByPath[nestedPath] = removedItems;
        }

        if (board.ui_items[nestedPath]?.length === 0) {
          delete board.ui_items[nestedPath];
        }
      }
    } else {
      removedItemsByPath[path] = [board.ui_items[path][idx]];
      board.ui_items[path].splice(idx, 1);
    }

    // Step 2: Clone board.ui_items into updatedMap
    for (const key in board.ui_items) {
      updatedMap[key] = [...board.ui_items[key]];
    }

    // Step 3: Determine new path and insert index
    const isDroppedItemContainer =
      droppedItem.isContainer?.() || droppedItem.isListingContainer?.();
    const isDroppedOnContainer =
      droppedOnItem.isContainer?.() || droppedOnItem.isListingContainer?.();

    let newPath: string;
    let insertIndex: number;

    if (isDroppedOnContainer) {
      newPath = `${droppedOnItem.path}/container${droppedOnItem.getId()}`;
      insertIndex = 0;
    } else {
      newPath = droppedOnItem.path;
      insertIndex = targetIdx + 1;
    }

    // Step 4: Reinsert droppedItem (and children if container)
    if (isDroppedItemContainer) {
      const oldPrefix = path;
      const newPrefix = `${newPath}/container${droppedItem.uniqueId}`;

      droppedItem.path = newPath;
      addUIItemAtIdx(droppedItem, newPath, updatedMap, insertIndex);

      traverseComponent(
        `${oldPrefix}/container${droppedItem.uniqueId}`,
        `${newPath}/container${droppedItem.uniqueId}`,
        removedItemsByPath,
        updatedMap
      );
    } else {
      droppedItem.path = newPath;
      addUIItemAtIdx(droppedItem, newPath, updatedMap, insertIndex);
    }

    // Step 5: Final assignment
    board.ui_items = updatedMap;
    console.log(
      "New Path:",
      newPath,
      "Insert Index:",
      insertIndex,
      isDroppedItemContainer,
      // upda tePaths,
      removedItemsByPath,
      droppedItem,
      droppedOnItem,
      board.ui_items
    );
  }

 
  useEffect(() => {
    console.log("new context board", board);
  }, [board]);

  const contextValue: BoardContextType = {
    hoveredItemId, // Expose hovered element state
    setHoveredItemId, // Expose setter function
    dataToSaveInStore,
    setDataToSaveInStore,
    dataToSaveForEdit,
    setDataToSaveForEdit,
    board,
    moveItemWithChildren,
    addUIItem,
    addUIItemAtIdx,
    updateBoardUIItems,
    updateBoardUIItemForViewStyle,
    updateBoardElementClasses,
    updateBoardElementStyles,
    updateBoardElementItemsText,
    updateBoardResourceOperation,
    deleteRaspUIElement,
    updateBoardElementItems,
    updateBoardArrayElementItems,
    customComponent,
    addUIItemCC,
    emptyUIItemsCC,
    setReadyToSendCC,
    moveItem, // Expose moveItem function
    moveItem2, // Expose moveItem function
  };
  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
};
