/**
 * CollectionTree Component
 * -----------------------
 *
 * What it does:
 *  - Renders a collapsible, hierarchical tree view of the current page's UI elements.
 *  - Allows users to expand/collapse containers and select UI elements in the structure.
 *  - Handles hover and selection events for UI elements, and integrates with the board context.
 *  - Recursively renders nested containers using the CollapsibleItem component.
 *
 * Where it is used:
 *  - Used in the `Accordian` sidebar component (`src/components/Accordian.tsx`), which is rendered in the `DragDrop` page (`src/components/DragDrop.tsx`).
 *  - The `DragDrop` page is registered as a route in `App.tsx` at `/DragDrop`.
 *
 * Parameters:
 *  @param {function} setSelectedEleByCT - (element: any) => void
 *      Callback to set the selected element from the tree.
 *  @param {function} handleSelectElement - (element: any) => void
 *      Callback to handle selection logic for an element.
 * Returns:
 * @returns {JSX.Element}
 *      The rendered collapsible tree UI for the page structure, including all nested UI elements and containers.
 *      Also handles hover and selection functionality.
 */

import { useContext, useEffect } from "react";
import BoardContext from "../context/boardContext";
import CollapsibleItem from "./CollapsibleItem";
import { useDrag, useDrop } from "react-dnd";
import DraggableTreeNode from "./DraggableTreeNode";

type CollectionTreeProps = {
  setSelectedEleByCT: (item: any) => void;
  handleSelectElement: (item: any) => void;
};



const CollectionTree = ({
  setSelectedEleByCT,
  handleSelectElement,
}: CollectionTreeProps) => {
  const { board, setHoveredItemId } = useContext(BoardContext);
  const { ui_items } = board || { ui_items: { root: [] } };

  const [{ isOverBoard }, dropRef] = useDrop(() => ({
    accept: "treeText",
    drop: (draggedItem: any, monitor) => {
      if (!monitor.didDrop()) {
        console.log("Dropped item in page structure:", draggedItem);
      }
    },
    collect: (monitor: any) => ({
      isOverBoard: monitor.isOver({ shallow: true }),
    }),
  }));

  useEffect(() => {
    console.log("isOverBoard changed:", isOverBoard);
  }, [isOverBoard]);



  return (
    <div ref={dropRef} className="d-flex flex-column gap-1" style={{ minWidth: "max-content", paddingRight: "10px" }} >
      {Object.entries(ui_items?.root || {}).map(([key, item]) => (
        <DraggableTreeNode
          key={item.uniqueId}
          idx={Number(key)}
          item={item}
          ui_items={ui_items}
          setSelectedEleByCT={setSelectedEleByCT}
          handleSelectElement={handleSelectElement}
        />
      ))}
    </div>
  );
};

export default CollectionTree;
