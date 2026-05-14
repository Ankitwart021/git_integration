
import React from "react";
import ResourceAttributes from "../ResourceAttributes";

const ResourceEdits = ({ activeElement, matchedResource, ui_items }: any) => {
  return (
    <div className="d-flex flex-column gap-2">
      <div className="collapse show mt-2" id="resourceCollapse">
        {/* Show resource name */}
        <div className="d-flex flex-column gap-1 mb-3">
          <label className="form-label fw-bold mb-0" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>
            Resource Name
          </label>
          <div className="rounded px-3 py-2 border" style={{
            backgroundColor: 'rgba(40, 167, 69, 0.1)', 
            color: '#28a745', 
            borderColor: 'rgba(40, 167, 69, 0.2)',
            fontSize: '0.9rem'
          }}>
            <i className="fa fa-database me-2"></i>
            {activeElement.getResourceName()}
          </div>
        </div>

        {/* Show selected operation */}
        <div className="d-flex flex-column gap-1 mb-3">
          <label className="form-label fw-bold mb-0" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>
            Resource Operation
          </label>
          <div className="rounded px-3 py-2 border" style={{
            backgroundColor: 'rgba(23, 162, 184, 0.1)', 
            color: '#17a2b8', 
            borderColor: 'rgba(23, 162, 184, 0.2)',
            fontSize: '0.9rem'
          }}>
            <i className="fa fa-cogs me-2"></i>
            {activeElement.getSelectedOp()}
          </div>
        </div>

        {/* Show Attributes List */}
        <div className="mt-3 text-white">
          <label className="form-label fw-bold mb-2" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>
            Attributes To Bind
          </label>
          <ul className="list-group" style={{backgroundColor: 'transparent'}}>
            {matchedResource?.attributes?.fieldValues
              ?.filter((field: any) => field.name.toLowerCase() !== "id")
              .map((field: any, index: number) => {
                const isBound = Object.values(ui_items)
                  .flat()
                  .some(
                    (el: any) =>
                      el.getBoundFieldName?.() === field.name &&
                      el.getBoundResourceName?.() ===
                        activeElement?.getResourceName()
                  );

                return (
                  <ResourceAttributes
                    key={index}
                    field={field}
                    resourceName={activeElement?.getResourceName?.()}
                    isBound={isBound}
                  />
                );
              })}
          </ul>
        </div>
      </div>

      <hr className="mb-2" style={{borderColor: 'var(--dash-border)'}} />
    </div>
  );
};

export default ResourceEdits;
