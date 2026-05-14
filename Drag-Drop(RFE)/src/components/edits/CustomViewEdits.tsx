
import React from "react";
import {
  CARD_ATTR_DESC,
  CARD_ATTR_META,
  CARD_ATTR_TITLE,
  CARD_VIEW_STYLE,
  TABLE_VIEW_STYLE,
} from "../../constants";

const CustomViewEdits = ({
  activeElement,
  resources,
  setDataForCustomView,
  handleSetAttrMappEntry,
  updateBoardUIItemForViewStyle,
}: any) => {
  return (
    <>
      {/* View Style Section */}
      <div className="d-flex flex-column gap-1 mb-3">
        <h6
          className="dropdown-toggle fw-bold d-flex align-items-center gap-2"
          data-bs-toggle="collapse"
          data-bs-target="#customViewHtmlCollapse"
          role="button"
          style={{color: 'var(--dash-text)', fontSize: '0.9rem'}}
        >
          <i className="fa fa-eye" style={{color: 'var(--dash-accent)'}}></i> View Style
        </h6>
        <div className="collapse show mt-2" id="customViewHtmlCollapse">
          <div className="d-flex gap-3 align-items-center ">
            <i
              className="fa fa-table fa-lg mt-1   "
              style={{ fontSize: "38px", color: activeElement.getViewMode() === TABLE_VIEW_STYLE ? 'var(--dash-accent)' : '#ffffffa4', cursor: 'pointer' }}
              aria-hidden="true"
              onClick={() => {
                activeElement.setViewMode(TABLE_VIEW_STYLE);
                updateBoardUIItemForViewStyle(
                  activeElement.uniqueId,
                  activeElement.path,
                  activeElement
                );
              }}
            ></i>
            <i
              className="fa fa-credit-card fa-lg"
              style={{ fontSize: "36px", color: activeElement.getViewMode() === CARD_VIEW_STYLE ? 'var(--dash-accent)' : '#ffffffa4', cursor: 'pointer' }}
              aria-hidden="true"
              onClick={() => {
                activeElement.setViewMode(CARD_VIEW_STYLE);
                updateBoardUIItemForViewStyle(
                  activeElement.uniqueId,
                  activeElement.path,
                  activeElement
                );
              }}
            ></i>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      {resources.length > 0 ? (
        <div className="mb-3">
          <div className="dropdown">
            <button
              className="btn border   text-white dropdown-toggle w-100 d-flex justify-content-between align-items-center modern-dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
             Select Resource
            </button>
            <ul className="dropdown-menu w-100">
              {resources.map((res: any, idx: any) => (
                <li className="text-center" key={idx}>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={() => {
                      setDataForCustomView(res.resourceName);
                    }}
                  >
                    {res.resourceName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p style={{color: 'var(--dash-text-muted)'}}>No resources available.</p>
      )}

      {/* Card View Style Section */}
      {activeElement.getViewMode() === CARD_VIEW_STYLE && (
        <div className="d-flex flex-column gap-2 rounded p-2 mb-3" style={{borderColor: 'var(--dash-border)', backgroundColor: 'rgba(255,255,255,0.05)'}}>
          <div className="d-flex justify-content-between gap-2 align-items-center">
            <label htmlFor="" className="form-label mb-0" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>
              Title
            </label>
            <div className="dropdown flex-grow-1 text-white   ">
              <button
                className="btn btn-sm text-white dropdown-toggle  d-flex justify-content-between align-items-center modern-dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Select Attribute
              </button>
              <ul
                className="dropdown-menu w-100"
                aria-labelledby="dropdownMenuButton1"
              >
                {activeElement.getData()[0] &&
                  Object.keys(activeElement.getData()[0]).map((key) => (
                    <li
                      className="dropdown-item"
                      key={key}
                      onClick={() =>
                        handleSetAttrMappEntry(CARD_ATTR_TITLE, key)
                      }
                    >
                      {key}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <label htmlFor="" className="form-label mb-0" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>
              Description
            </label>
            <div className="dropdown flex-grow-1">
              <button
                className="btn btn-sm dropdown-toggle w-100 d-flex justify-content-between align-items-center modern-dropdown-toggle"
                type="button"
                id="dropdownMenuButton2"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Select Attribute
              </button>
              <ul
                className="dropdown-menu w-100"
                aria-labelledby="dropdownMenuButton2"
              >
                {activeElement.getData()[0] &&
                  Object.keys(activeElement.getData()[0]).map((key) => (
                    <li
                      className="dropdown-item"
                      key={key}
                      onClick={() =>
                        handleSetAttrMappEntry(CARD_ATTR_DESC, key)
                      }
                    >
                      {key}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <label htmlFor="" className="form-label mb-0" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>
              Meta
            </label>
            <div className="dropdown flex-grow-1">
              <button
                className="btn btn-sm dropdown-toggle w-100 d-flex justify-content-between align-items-center modern-dropdown-toggle"
                type="button"
                id="dropdownMenuButton3"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Select Attribute
              </button>
              <ul
                className="dropdown-menu w-100"
                aria-labelledby="dropdownMenuButton3"
              >
                {activeElement.getData()[0] &&
                  Object.keys(activeElement.getData()[0]).map((key) => (
                    <li
                      className="dropdown-item"
                      key={key}
                      onClick={() =>
                        handleSetAttrMappEntry(CARD_ATTR_META, key)
                      }
                    >
                      {key}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomViewEdits;
