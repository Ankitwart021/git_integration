
import React from "react";

const ItemEdits = ({ item, setItem, handleAddItem }: any) => {
  return (
    <div className="d-flex flex-column gap-1">
      <h6
        className="dropdown-toggle fw-bold d-flex align-items-center gap-2"
        data-bs-toggle="collapse"
        data-bs-target="#addItemCollapse"
        role="button"
        style={{color: 'var(--dash-text)', fontSize: '0.9rem'}}
      >
        <i className="fa fa-plus-circle" style={{color: 'var(--dash-accent)'}}></i> ADD ITEMS
      </h6>

      {/* Collapsible Input Section */}
      <div className="collapse show mt-2" id="addItemCollapse">
        <div className="d-flex flex-column gap-2">
          <label className="form-label fw-bold mb-0" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>
            Item Name
          </label>
          <input
            type="text"
            className="form-control modern-input"
            placeholder="Enter Item Name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </div>

        {/* Add Button (Visible only when text is entered) */}
        {item.trim() && (
          <button
            className="primary-btn mt-3 w-100 justify-content-center"
            onClick={handleAddItem}
          >
            <i className="fa fa-plus"></i> Add Item
          </button>
        )}
      </div>
      <hr className="mt-3 mb-2" style={{borderColor: 'var(--dash-border)'}} />
    </div>
  );
};

export default ItemEdits;
