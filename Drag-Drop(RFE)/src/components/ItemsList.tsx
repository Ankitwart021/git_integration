/**
 * ItemsList Component
 * -------------------
 *
 * What it does:
 *  - Renders a dropdown menu for a category of UI elements in the sidebar/toolbox.
 *  - Displays a list of draggable items (using the `Item` component) for each element type in the category.
 *
 * Where it is used:
 *  - Used in the `Accordian` sidebar component (`src/components/Accordian.tsx`), which is rendered in the `DragDrop` page (`src/components/DragDrop.tsx`).
 *  - The `DragDrop` page is registered as a route in `App.tsx` at `/DragDrop`.
 *
 * @param {object} element - The category object containing `header`, `iconClass`, and `elementTypes` for the dropdown.
 *
 * @return {JSX.Element} The rendered dropdown menu with draggable items for each element type.
 */

import { useQueryClient } from '@tanstack/react-query';
import { deleteCustomComponent } from '../api/customComponents';
import { notifyCustomComponentDeleted } from '../utils/utils';
import Item from './Item';
import '../accordian.css'
import '../resources.css'
import { useState } from 'react';

const ItemsList = ({ element, isOpen, onClick }: any) => {
  const queryClient = useQueryClient();
  const isResources = element.header === "Resources";
  const [openResource, setOpenResource] = useState<string | null>(null);



  return (
    <div className="mb-1">
      <div
        className={`list-item modern-list-item cursor-pointer ${isOpen ? 'active' : ''}`}
        onClick={onClick}
      >
        <div className="list-item-content">
          {element.iconClass && <i className={`${element.iconClass} list-item-icon`}></i>}
          <span className="title" style={{fontSize:"0.95rem"}}>{element.header}</span>
        </div>
        <i className={`fa fa-chevron-${isOpen ? "up" : "down"}`} style={{fontSize:"12px", color: 'var(--dash-text-dim)'}}></i>
      </div>

      {/* {isOpen && (
        <div className="d-flex flex-wrap gap-3 mt-2 p-2" style={{background: 'rgba(0,0,0,0.15)', borderRadius: '8px', margin: '0 0.5rem 0.5rem 0.5rem'}}>
          {element.elementTypes.map((item: any, index: any) => {
            const itemId = element.elementIds ? element.elementIds[index] : index;
            return (
              <div key={itemId} className="text-center d-flex" style={{ width: "60px" }}>
                <Item type={item} id={itemId} parent={element} />
                {element.header === "CustomComponents" && (
                  <i
                    className="fa fa-trash small text-danger mt-1"
                    onClick={async () => {
                      try {
                        await deleteCustomComponent(itemId);
                        notifyCustomComponentDeleted();
                        queryClient.invalidateQueries({
                          queryKey: ["customComponents"],
                        });
                      } catch (error) {
                        console.error("Failed to delete custom component:", error);
                      }
                    }}
                  ></i>
                )}
              </div>
            );
          })}
        </div>
      )} */}
      {isOpen && (
        <div
         className={`d-flex gap-2 mt-2 p-2 ${isResources ? "flex-column" : "flex-wrap"}`}
          style={{
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '8px',
            margin: '0 0.5rem 0.5rem 0.5rem'
          }}
        >
          {isResources ? (
            element.elementTypes.map((res: any) => {
              const isOpen = openResource === res.resourceName;

              return (
                <div key={res.resourceName} className="mb-2">

                  {/* Resource Header */}
                  <div
                    className="d-flex align-items-center px-4 py-1 fw-semibold cursor-pointer"
                    style={{ color: 'var(--dash-text)', fontSize: '0.8rem' }}
                    onClick={() =>
                      setOpenResource(isOpen ? null : res.resourceName)
                    }
                  >
                    {/* <i className="fa fa-database me-2" /> */}
                    <span className="flex-grow-1">{res.resourceName}</span>
                    <i
                      className={`fa fa-chevron-${isOpen ? "down" : "right"}`}
                      style={{ fontSize: "11px", opacity: 0.7 }}
                    />
                  </div>

                  {/* Operations (collapsed) */}
                  {isOpen && (
                    <div className="d-flex gap-3 ps-4 mt-1">
                      {res.operations.map((op: string) => (
                        <div
                          key={op}
                          className="text-center"
                          style={{ width: "60px" }}
                        >
                          <Item
                            type={op}
                            parent={{ header: "ResourceOperation" , resourceName: res.resourceName}}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            element.elementTypes.map((item: any, index: any) => {
              const itemId = element.elementIds ? element.elementIds[index] : index;
              return (
                <div key={itemId} className="text-center d-flex" style={{ width: "60px" }}>
                  <Item type={item} id={itemId} parent={element} />
                  {element.header === "CustomComponents" && (
                  <i
                    className="fa fa-trash small text-danger mt-1"
                    onClick={async () => {
                      try {
                        await deleteCustomComponent(itemId);
                        notifyCustomComponentDeleted();
                        queryClient.invalidateQueries({
                          queryKey: ["customComponents"],
                        });
                      } catch (error) {
                        console.error("Failed to delete custom component:", error);
                      }
                    }}
                  ></i>
                )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};

export default ItemsList;