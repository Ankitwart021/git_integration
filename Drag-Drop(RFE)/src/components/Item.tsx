/**
 * Item Component
 * --------------
 *
 * What it does:
 *  - Renders a draggable list item for a UI element type in the sidebar/toolbox.
 *  - Integrates with react-dnd to enable drag-and-drop functionality for adding elements to the board.
 *
 * Where it is used:
 *  - Used in the `ItemsList` component, which is rendered in the `Accordian` sidebar (`src/components/Accordian.tsx`).
 *  - The `Accordian` is used in the `DragDrop` page (`src/components/DragDrop.tsx`), registered as a route in `App.tsx` at `/DragDrop`.
 *
 * @param {string} type - The type of UI element to render as a draggable item.
 * @param {string|number} id - The unique identifier for the item.
 * @param {object} parent - The parent category or group for the item (used for context in drag-and-drop).
 *
 * @return {JSX.Element} The rendered draggable list item.
 */

import { useDrag } from 'react-dnd';

const Item = ({ type, id, parent }: any) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "text",
        // item: {
        //     itemType: parent.header === "Resources" ? "resource" : type,
        //     id: id,
        //     parent: parent,
        // },
        item: parent.header === "ResourceOperation"
            ? {
                itemType: "resource-operation",
                operation: type,               // "Create" | "Read"
                resourceName: parent.resourceName,
            }
            : {
                itemType: type,
                id,
                parent,
            },

        collect: (monitor: any) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    const iconMapping: Record<string, string> = {
        input: "fa fa-pencil",
        inputCalendar: "fa fa-calendar",
        addText: "fa fa-font",
        navbar: "fa fa-window-minimize",
        button: "fa fa-hand-pointer-o",
        dropdown: "fa fa-caret-square-o-down",
        flex: "fa fa-th-large",
        container: "fa fa-square-o",
        checkbox: "fa fa-check-square-o",
        radio: "fa fa-dot-circle-o",
        range: "fa fa-sliders",
        inputGroup: "fa fa-object-group",
        floatingLabels: "fa fa-arrows-v",
        listingContainer: "fa fa-list",
        table: "fa fa-table",
        link: "fa fa-link",
        card: "fa fa-clone",
        switches: "fa fa-toggle-on",
        fileupload: "fa fa-upload",
        tabs: "fa fa-tablet",
        image: "fa fa-image",
        customComponent: "fa fa-cogs",
        menu: "fa fa-bars",
        collection: "fa fa-cube",
        resource: "fa fa-database",
        custom: "fa fa-puzzle-piece",
        audio: "fa fa-volume-up",
        video: "fa fa-video-camera",
        progressBar: "fa fa-tasks",
        Create: "fa fa-plus-circle",
        Read: "fa fa-table",
    };

    return (
        <div
            ref={drag}
            className=" d-flex flex-column align-items-center justify-content-center text-center rounded"
            style={{
                width: "90px",
                height: "65px",
                // backgroundColor: isDragging ? "#2b2b2b" : "#1e1e1e",
                // border: isDragging ? "2px solid #3f3f3f" : "1px solid #2c2c2c",
                cursor: "grab",
                transition: "all 0.2s ease",
            }}
        >
            {/* Icon */}
            <div
                className="icon-wrapper d-flex align-items-center justify-content-center rounded mb-1"
                style={{
                    backgroundColor: "var(--dash-surface-alt)",
                    width: "42px",
                    height: "42px",
                    border: "1px solid var(--dash-border)"
                }}
            >
                <i className={`${iconMapping[type] || "fa fa-cube"} `} style={{ fontSize: "20px" , color: "var(--dash-accent)" }}></i>
            </div>

            {/* Label */}
            <div
                className="fw-normal"
                style={{
                    color: "var(--dash-text)",
                    fontSize: "0.75rem",
                    lineHeight: "1.1",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "70px",
                }}
            >
                {type.length > 14 ? type.replace(/([A-Z])/g, " $1").trim() : type}
            </div>
        </div>
    );
};

export default Item;