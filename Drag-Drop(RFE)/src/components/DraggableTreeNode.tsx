import { useContext } from "react";
import BoardContext from "../context/boardContext";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "../types/constants";

const getIconForType = (type: string) => {
  const t = type?.toLowerCase() || "";
  if (t === "page" || t === "navbar") return "fa-window-maximize";
  if (t.includes("container") || t === "flex") return "fa-square-o";
  if (t === "button") return "fa-square";
  if (t === "input") return "fa-pencil-square";
  if (t.includes("text")) return "fa-font";
  if (t === "image") return "fa-image";
  if (t === "table") return "fa-table";
  if (t === "form") return "fa-list-alt";
  return "fa-cube";
};

// Single draggable + collapsible tree item (recursive)
const DraggableTreeNode = ({
  item,
  ui_items,
  setSelectedEleByCT,
  handleSelectElement,
  idx
}: any) => {
  const { setHoveredItemId, moveItem2 } = useContext(BoardContext);

  const collapseId = `collapse-${item.uniqueId}`;
  const isContainer = item.isContainer?.() || item.isListingContainer?.();
  const pathKey = `${item.path}/container${item.uniqueId}`;
  const nestedItems = ui_items[pathKey] || [];

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "treeText",
    item: item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "treeText",
    drop: (draggedItem: any, monitor) => {
      if (!monitor.didDrop()) {
        console.log("Dropped on:",idx,"==>" ,item, "=>", draggedItem);
        // Add move logic if needed
        moveItem2(item, draggedItem, idx);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const combinedRef = (node: any) => {
    dragRef(node);
    dropRef(node);
  };

  return (
    <div className="tree-node-wrapper">
      <div
        ref={combinedRef}
        className={`tree-node-row ${isDragging ? "tree-node-dragging" : ""} ${isOver ? "tree-node-drop-over" : ""}`}
        onMouseEnter={() => setHoveredItemId(item.uniqueId)}
        onMouseLeave={() => setHoveredItemId(null)}
        onClick={(e) => {
          e.stopPropagation();
          handleSelectElement(null);
          setSelectedEleByCT(item);
        }}
      >
        {/* Chevron Toggle */}
        <div
          className={`tree-node-chevron ${!isContainer || nestedItems.length === 0 ? "hidden" : ""}`}
          data-bs-toggle={isContainer ? "collapse" : undefined}
          data-bs-target={isContainer ? `#${collapseId}` : undefined}
          aria-expanded="true"
          onClick={(e) => {
            // Prevent row click when toggling expand
            e.stopPropagation();
          }}
        >
          <i className="fa fa-chevron-right" />
        </div>

        {/* Icon */}
        <i className={`fa ${getIconForType(item.type)} tree-node-icon`} />

        {/* Label */}
        <span className="tree-node-label">
          {item.type}
        </span>
      </div>

      {isContainer && nestedItems.length > 0 && (
        <div className="collapse show tree-node-children" id={collapseId}>
          {nestedItems.map((nestedItem: any, key: any) => (
            <DraggableTreeNode
              key={nestedItem.uniqueId}
              idx={key}
              item={nestedItem}
              ui_items={ui_items}
              setSelectedEleByCT={setSelectedEleByCT}
              handleSelectElement={handleSelectElement}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DraggableTreeNode;
