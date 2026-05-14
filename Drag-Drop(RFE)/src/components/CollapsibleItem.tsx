/**
 * CollapsibleItem Component
 * ------------------------
 *
 * What it does:
 *  - Recursively renders a collapsible, hierarchical tree of UI elements (containers and items) for a page structure.
 *  - Allows users to expand/collapse containers and select nested UI elements.
 *  - Handles hover and selection events for UI elements in the tree.
 *
 * Where it is used:
 *  - Used by the `CollectionTree` component (`src/components/CollectionTree.tsx`) to display nested UI elements.
 *  - Ultimately rendered in the `Accordian` sidebar (`src/components/Accordian.tsx`), which is used in the `DragDrop` page (`src/components/DragDrop.tsx`).
 *  - The `DragDrop` page is registered as a route in `App.tsx` at `/DragDrop`.
 *
 * @param {any} item - The current UI element to render (container or item).
 * @param {any} ui_items - The full UI items object, used to find nested children.
 * @param {function} setSelectedEleByCT - Callback to set the selected element from the tree.
 * @param {function} handleSelectElement - Callback to handle selection logic for an element.
 *
 * @return {JSX.Element} The rendered collapsible tree node for the given UI element and its children.
 */
import { useContext } from "react";
import BoardContext from "../context/boardContext";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "../types/constants";

const CollapsibleItem = ({
  item,
  ui_items,
  setSelectedEleByCT,
  handleSelectElement,
}: any) => {
  const { setHoveredItemId } = useContext(BoardContext);
  const nestedItems = ui_items[`${item.path}/container${item.uniqueId}`] || [];
          console.log("nestedItem check for item path",`${item.path}/container${item.uniqueId}`);

  const isContainer = item.isContainer() || item.isListingContainer();

//  const [{ isDragging }, drag] = useDrag(() => ({
//     type: "treeText",
//     item: {
//       id: item.uniqueId,
//       parentId: item.parentId,
//       fullItem: item, // <-- Make sure this is the right element
//     },
//     collect: (monitor) => {
//       const isDragging = !!monitor.isDragging();
//       if (isDragging) {
//         console.log("Dragging item:xxx", item);
//       }
//       return { isDragging };
//     },
//   }));

  const [{ isOver }, drop] = useDrop(() => ({
    // accept: [ItemTypes.ELEMENT, ItemTypes.CONTAINER],
    accept: "treeText",
    drop: (draggedItem: any, monitor) => {
      if (!monitor.didDrop()) {
        // if (draggedItem.id !== item.uniqueId) {
        // moveItem(draggedItem.id, item.uniqueId);
        console.log("Dropped item in page structure ele:", draggedItem);
        // }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      // ref={drop }
      className={`ps-3 border-start mt-2 ${isOver ? "bg-secondary" : ""}`}
    >
      {nestedItems.map((nestedItem: any) => {
        const collapseId = `collapse-nested-${nestedItem.uniqueId}`;
        const isNestedContainer =
          nestedItem.isContainer() || nestedItem.isListingContainer();
        console.log("nestedItem check for item",item, nestedItem);
         const [{ isDragging }, drag] = useDrag(() => ({
    type: "treeText",
    item: {
      id: nestedItem.uniqueId,
      parentId: nestedItem.parentId,
      fullItem: nestedItem, // <-- Make sure this is the right element
    },
    collect: (monitor) => {
      const isDragging = !!monitor.isDragging();
      if (isDragging) {
        console.log("Dragging item:xxx", nestedItem);
      }
      return { isDragging };
    },
  }));
        return (
          <div
          //  ref={drag}
            key={nestedItem.uniqueId}
            className={`p-2 border border-4 ${isDragging ? "opacity-50" : ""}`}
            onMouseEnter={() => setHoveredItemId(nestedItem.uniqueId)}
            onMouseLeave={() => setHoveredItemId(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleSelectElement(null);
              setSelectedEleByCT(nestedItem);
            }}
          >
            <div>
              <h6
               ref={drag}
                className={isNestedContainer?"dropdown-toggle":"text-white"}
                data-bs-toggle={isNestedContainer ? "collapse" : undefined}
                data-bs-target={
                  isNestedContainer ? `#${collapseId}` : undefined
                }
                role={isNestedContainer?"button": undefined}
              >
                {nestedItem.type}
              </h6>
             {isNestedContainer&& 
             (<div className="collapse show" id={collapseId}>
                <CollapsibleItem  
                  item={nestedItem}
                  ui_items={ui_items}
                  setSelectedEleByCT={setSelectedEleByCT}
                  handleSelectElement={handleSelectElement}
                />
              </div>)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CollapsibleItem;
