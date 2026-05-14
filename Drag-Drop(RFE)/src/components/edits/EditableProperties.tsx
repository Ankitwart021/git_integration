
import React, { useContext, useState } from "react";
import { EDITABLE_TYPE } from "../../models/UIElement";
import {
  CARD_ATTR_DESC,
  CARD_ATTR_META,
  CARD_ATTR_TITLE,
  CARD_VIEW_STYLE,
  TABLE_VIEW_STYLE,
} from "../../constants";
import { useParams } from "react-router-dom";
import { useNavSideBarStore } from "../../store/useNavSideBar";
import UserInfoContext from "../../context/userContext";
const EditableProperties = ({
  activeElement,
  selectedProperty,
  setSelectedProperty,
  textArr,
  setText,
  setIdx,
  updateOperation,
  text,
  setElementText,
  deleteArrItem,
  idx,
  updateBoardUIItemForViewStyle,
  setDataForCustomView,
  handleSetAttrMappEntry,
  resources,
}: any) => {

  const {appId} = useParams();
    const { userInfo, updateUserInfo, deserlisation } = useContext(UserInfoContext);
  
  const setNavbarObj  = useNavSideBarStore((state)=>state.setNavbarObj);
  const setSidebarObj  = useNavSideBarStore((state)=>state.setSidebarObj);
    // const [allPages, setAllPages] = useState(userInfo.getApplication(appName)?.getPages() || new Map());
  
  return (
    <div className="d-flex flex-column gap-1 mt-3">
      <h6
        className="fw-bold d-flex align-items-center gap-2"
        style={{ color: 'var(--dash-text)', fontSize: '0.9rem' }}
      >
        <i className="fa fa-pencil-square-o" style={{ color: 'var(--dash-accent)' }}></i> EDITABLE PROPERTIES
      </h6>

      <div className="collapse show mt-2" id="editableCollapse">
        <div className="d-flex gap-2 flex-wrap">
          <div className="dropdown modern-dropdown flex-grow-1">
            <button
              className="btn modern-dropdown-toggle dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {selectedProperty
                ? selectedProperty.property
                : "Select Property"}
            </button>
            <ul className="dropdown-menu modern-dropdown-menu w-100">
              {activeElement.getEditables().length ? activeElement.getEditables().map((item: any, idx: number) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedProperty(item);
                    setIdx(-1); // reset item index
                  }}
                >
                  <a className="dropdown-item modern-dropdown-item" href="#">
                    {item.property}
                  </a>
                </li>
              )) : <li className="dropdown-item ">No editable properties</li>}
            </ul>
          </div>

          {textArr.length !== 0 && (
            <div className="dropdown modern-dropdown flex-grow-1">
              <button
                className="btn modern-dropdown-toggle dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Edit {activeElement.isResource() ? "operation" : "items"}
              </button>
              <ul className="dropdown-menu modern-dropdown-menu w-100">
                {textArr.map((item: any, idx: number) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setText(item);
                      setIdx(idx);
                      if (activeElement.isResource()) {
                        updateOperation(item);
                      }
                      
                    }}
                  >
                    <a className="dropdown-item modern-dropdown-item" href="#">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {activeElement.componentName === "resource" &&
          (activeElement.getSelectedOp() === "Read" || activeElement.getSelectedOp() === "Update") && (
            <div className="d-flex flex-column gap-1 mb-3 mt-3">
              <h6
                className="dropdown-toggle fw-bold d-flex align-items-center gap-2"
                data-bs-toggle="collapse"
                data-bs-target="#customViewHtmlCollapse"
                role="button"
                style={{ color: 'var(--dash-text)', fontSize: '0.9rem' }}
              >
                <i className="fa fa-eye" style={{ color: 'var(--dash-accent)' }}></i> View Style
              </h6>
              <div className="collapse show mt-2" id="customViewHtmlCollapse">
                <div className="d-flex gap-3 align-items-center px-3 ">
                  <i
                    className="fa fa-table fa-lg mt-1   "
                    // style={{ fontSize: "38px", color: activeElement.getViewMode() === TABLE_VIEW_STYLE ? 'var(--dash-accent)' : '#ffffffa4', cursor: 'pointer' }}
                    style={{ color: '#ffffffa4', cursor: 'pointer' }}
                    aria-hidden="true"
                    onClick={() => {
                      activeElement.setViewMode(TABLE_VIEW_STYLE);
                      // setDataForCustomView(activeElement.getResourceName());
                      updateBoardUIItemForViewStyle(
                        activeElement.uniqueId,
                        activeElement.path,
                        activeElement
                      );
                    }}
                  ></i>
                  <i
                    className="fa fa-credit-card fa-lg"
                    // style={{ fontSize: "36px", color: activeElement.getViewMode() === CARD_VIEW_STYLE ? 'var(--dash-accent)' : '#ffffffa4', cursor: 'pointer' }}
                    style={{ color: '#ffffffa4', cursor: 'pointer' }}
                    aria-hidden="true"
                    onClick={() => {
                      activeElement.setViewMode(CARD_VIEW_STYLE);
                      // setDataForCustomView(activeElement.getResourceName());
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
          )}
        {activeElement.type === "read-resource" && activeElement.getViewMode() === CARD_VIEW_STYLE && (
          <div className="d-flex flex-column gap-2 rounded p-2 mb-3" style={{ borderColor: 'var(--dash-border)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="d-flex justify-content-between gap-2 align-items-center">
              <label htmlFor="" className="form-label mb-0" style={{ color: 'var(--dash-text)', fontSize: '0.85rem' }}>
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
              <label htmlFor="" className="form-label mb-0" style={{ color: 'var(--dash-text)', fontSize: '0.85rem' }}>
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
              <label htmlFor="" className="form-label mb-0" style={{ color: 'var(--dash-text)', fontSize: '0.85rem' }}>
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

        {activeElement.componentName !== "resource" &&
          ((selectedProperty &&
            selectedProperty.type === EDITABLE_TYPE.SINGLE) ||
            idx !== -1) && (
            <div className="d-flex flex-column align-items-start mt-3">
              <h6 style={{ color: 'var(--dash-text-dim)', fontSize: '0.85rem' }}>
                Edit {selectedProperty?.property}
              </h6>
              <div className="w-100 d-flex justify-content-between rounded gap-2 mt-1">
                <input
                  type="text"
                  className="form-control modern-input"
                  style={{ outline: "none" }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className="primary-btn"
                  onClick={() => {
                    setElementText(text)
                  if(activeElement.getType()==='selectedNavbar'){
                        setNavbarObj(appId,activeElement);
                                                                                                                                                                                                                                                                                                                                                             
                      }
                  if(activeElement.getType()==='selectedSidebar'){
                        setSidebarObj(appId,activeElement);
                                                                                                                                                                                                                                                                                                                                                             
                      }
                  }}
                  style={{ padding: '0.4rem 0.8rem' }}
                >
                  Set
                </button>
                {idx !== -1 && (
                  <button
                    className="icon-btn danger-btn"
                    onClick={deleteArrItem}
                    title="Delete Item"
                    style={{ width: '38px', height: '38px' }}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          )}
      </div>
      <hr className="mt-3 mb-1" style={{ borderColor: 'var(--dash-border)' }} />
    </div>
  );
};

export default EditableProperties;
