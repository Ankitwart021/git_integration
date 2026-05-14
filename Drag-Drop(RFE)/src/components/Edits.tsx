/**
 * Edits Component
 * ---------------
 *
 * What it does:
 *  - Provides a sidebar UI for editing properties, styles, items, and navigation of the currently selected UI element.
 *  - Allows editing of Bootstrap classes, custom CSS, and editable properties of the element.
 *  - Supports adding/removing items, setting navigation targets, and deleting the element.
 *  - Handles saving custom components and updating the board state.
 *  - Displays toast notifications for user feedback.
 *
 * Where it is used:
 *  - Used in the right sidebar of the `DragDrop` page (`src/components/DragDrop.tsx`), shown when an element is selected for editing.
 *
 * @param {UIElement} activeElement - The currently selected UI element to edit.
 * @param {function} setActiveElement - Callback to update the selected UI element.
 * @param {string} userId - The current user's ID (used for saving custom components).
 * @param {any[]} AppData - Array of all application data (used for page navigation).
 * @param {number} appIdx - Index of the current application in AppData.
 *
 * @return {JSX.Element} The rendered sidebar UI for editing the selected element.
 */
import React, { useContext, useEffect, useState } from "react";
import BoardContext, { UIItems } from "../context/boardContext";
import {
  getCookieValue,
  stringToClasses,
  stringToStyles,
  stylesToString,
} from "../utils/utils";
import UIElement, {
  ArrayEditable,
  EDITABLE_TYPE,
  Editables,
  SingleEditable,
} from "../models/UIElement";
import { toast, ToastContainer } from "react-toastify";
import "../resources.css";
import UserInfoContext from "../context/userContext";
import { useAppContext } from "../context/appContext";
import { useApplicationContext } from "../context/applicationContext";
import Input from "../models/Input";
import ResourceAttributes from "./ResourceAttributes";
import apiConfig from "../config/apiConfig";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { fetchResources } from "../api/resources";
import { createCustomComponent } from "../api/customComponents";
import {
  CARD_ATTR_DESC,
  CARD_ATTR_IMG,
  CARD_ATTR_META,
  CARD_ATTR_TITLE,
  CARD_VIEW_STYLE,
  TABLE_VIEW_STYLE,
} from "../constants";
import { useResourceStore } from "../store/useResourceStore";
import CustomViewEdits from "./edits/CustomViewEdits";
import CustomComponentEdits from "./edits/CustomComponentEdits";
import ItemEdits from "./edits/ItemEdits";
import NavigationEdits from "./edits/NavigationEdits";
import ResourceEdits from "./edits/ResourceEdits";
import EditableProperties from "./edits/EditableProperties";
import StyleEdits from "./edits/StyleEdits";
import { useNavSideBarStore } from "../store/useNavSideBar";

const parseDimension = (dimension: string | undefined) => {
  if (!dimension || dimension === 'auto' || dimension === 'initial' || dimension === 'inherit') {
    return { value: '', unit: 'px' }; // Default unit
  }
  const match = dimension.match(/^(\d*\.?\d+)(px|vh|vw|%)$/);
  if (match) {
    return { value: match[1], unit: match[2] };
  }
  return { value: '', unit: 'px' }; // Fallback
};


<ToastContainer
  aria-label="Success"
  position="top-center"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
/>;
const Edits = ({
  activeElement,
  setActiveElement,
  AppData,
  appIdx,
}: any) => {
  console.log("appppData",AppData,appIdx);
  const { selectedAppName } = useApplicationContext();
  const [activeTab, setActiveTab] = useState('edit');
  const notifySaveComponent = () =>
    toast.success("Component Saved successfully");
  const {
    board,
    updateBoardUIItems,
    updateBoardElementClasses,
    updateBoardUIItemForViewStyle,
    updateBoardElementStyles,
    updateBoardElementItemsText,
    deleteRaspUIElement,
    updateBoardElementItems,
    updateBoardResourceOperation,
    updateBoardArrayElementItems,
    customComponent: { ui_items_cc, isReadyToSend },
    addUIItemCC,
    emptyUIItemsCC,
    setReadyToSendCC,
  } = useContext(BoardContext);

  const { ui_items } = board;
  const { userInfo } = useContext(UserInfoContext);
  const { appId } = useParams<any>();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<Editables | null>(
    null
  );
  const [classString, setClassString] = useState(activeElement ? activeElement.getClasses() : '');
  const [cssString, setCssString] = useState(activeElement ? activeElement.getStyles() : '');

  const [heightValue, setHeightValue] = useState('');
  const [heightUnit, setHeightUnit] = useState('px');
  const [widthValue, setWidthValue] = useState('');
  const [widthUnit, setWidthUnit] = useState('px');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontColor, setFontColor] = useState('#000000');
  const [textType, setTextType] = useState('');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');

  const [text, setText] = useState<string | undefined>("");
  const [textArr, setTextArr] = useState<string[]>([]);
  const [item, setItem] = useState<string>("");
  const [idx, setIdx] = useState<number>(-1);
  const [resourceName, setResourceName] = useState<string>(
    activeElement?.getBoundResourceName?.()
  );
  const [apiUrl, setApiUrl] = useState<string>("");
  const [CustomComponentName, setCustomComponentName] = useState<string>("");
  const [allPages, setAllPages] = useState(
    userInfo.getApplication(selectedAppName)?.getPages() || new Map()
  );
  const currentPage = userInfo.getCurrentPageName();
  const [resources, setResources] = useState<any[]>([]);

  const setNavbarObj = useNavSideBarStore((state) => state.setNavbarObj)
  const setSidebarObj = useNavSideBarStore((state) => state.setSidebarObj)


  useEffect(() => {
    if (activeElement && activeElement.getBoundResourceName?.() !== undefined) {
      setResourceName(activeElement.getBoundResourceName?.());
      setApiUrl(
        `${apiConfig.API_BASE_URL}/${activeElement
          .getBoundResourceName?.()
          ?.toLowerCase()}`
      );
    } else {
      setResourceName('');
      setApiUrl('');
    }
  }, [activeElement]);
  const getResourcesData = useResourceStore((state) => state.getResourcesData);
  useEffect(() => {
    if (activeElement) {
      (async () => {
        try {
          const resources = await fetchResources(appId);
          setResources(resources);
        } catch (err) {
          console.error(err);
        }
      })();
    } else {
      setResources([]);
    }
  }, [activeElement]);
  useEffect(() => {
    if (activeElement) {
      setClassString(activeElement.getClasses());
      const currentStyles = activeElement.getStyles();
      setCssString(stylesToString(currentStyles));

      const { value: hVal, unit: hUnit } = parseDimension(currentStyles.height);
      setHeightValue(hVal);
      setHeightUnit(hUnit);

      const { value: wVal, unit: wUnit } = parseDimension(currentStyles.width);
      setWidthValue(wVal);
      setWidthUnit(wUnit);

      setBackgroundColor(currentStyles.backgroundColor || '#ffffff');
      setFontColor(currentStyles.color || '#000000');
      setFontWeight(currentStyles.fontWeight || 'normal');
      setFontStyle(currentStyles.fontStyle || 'normal');

      setSelectedProperty(null);
      setText("");
      setTextArr([]);
    } else {
      setActiveTab('edit');
      setClassString('');
      setCssString('');
      setHeightValue('');
      setHeightUnit('px');
      setWidthValue('');
      setWidthUnit('px');
      setBackgroundColor('#ffffff');
      setFontColor('#000000');
      setFontWeight('normal');
      setFontStyle('normal');
      setSelectedProperty(null);
      setText('');
      setTextArr([]);
      setItem('');
      setIdx(-1);
      setCustomComponentName('');
    }
  }, [activeElement]);
  useEffect(() => {
    if (activeElement && activeElement.getEditables().length !== 0) {
      if (selectedProperty && selectedProperty.type === EDITABLE_TYPE.SINGLE) {
        const selectedEditable = selectedProperty as SingleEditable;
        const value = selectedEditable?.getMethod();
        setText(value);
      }
      if (selectedProperty && selectedProperty.type === EDITABLE_TYPE.ARRAY) {
        const selectedEditable = selectedProperty as ArrayEditable;
        const value = selectedEditable?.getArrayMethod();
        setTextArr(value);
      }
    }
  }, [selectedProperty, activeElement]);
  const handleSetNavigation = (page: string) => {
    if (activeElement && activeElement.navigateTo && page) {
      activeElement.setNavigateTo(page);
      setActiveElement({ ...activeElement });
    }
  };
  const handleRemoveNavigation = () => {
    if (activeElement) {
      activeElement.setNavigateTo("/");
      setActiveElement({ ...activeElement });
    }
  };
  const updateOperation = (item: any) => {
    updateBoardResourceOperation(
      activeElement.uniqueId,
      activeElement.path,
      item
    );
  };
  const setElementText = (text: any) => {
    if (selectedProperty?.type === EDITABLE_TYPE.SINGLE) {
      const selectedEditable = selectedProperty as SingleEditable;
      updateBoardElementItemsText(
        activeElement.uniqueId,
        activeElement.path,
        text,
        selectedEditable?.setMethod
      );
      setText("");
    }
    if (selectedProperty?.type === EDITABLE_TYPE.ARRAY) {
      const selectedEditable = selectedProperty as ArrayEditable;
      const arr = textArr;
      arr[idx] = text;
      updateBoardArrayElementItems(
        activeElement.uniqueId,
        activeElement.path,
        arr,
        selectedEditable?.setArrayMethod
      );
      setText("");
    }
  };
  const handleClassChange = (e: any) => {
    const newClassString = e.target.value;
    setClassString(newClassString);
    const newClasses = stringToClasses(newClassString);
    updateBoardElementClasses(
      activeElement.uniqueId,
      activeElement.path,
      newClasses
    );
  };
  const handleCssChange = (e: any) => {
    const newCssString = e.target.value;
    setCssString(newCssString);
    const newStyles = stringToStyles(newCssString);

    updateBoardElementStyles(
      activeElement.uniqueId,
      activeElement.path,
      newStyles
    );

    const { value: hVal, unit: hUnit } = parseDimension(newStyles.height);
    setHeightValue(hVal);
    setHeightUnit(hUnit);

    const { value: wVal, unit: wUnit } = parseDimension(newStyles.width);
    setWidthValue(wVal);
    setWidthUnit(wUnit);

    setBackgroundColor(newStyles.backgroundColor || '#ffffff');
    setFontColor(newStyles.color || '#000000');
    setFontWeight(newStyles.fontWeight || 'normal');
    setFontStyle(newStyles.fontStyle || 'normal');
  };

  const updateDimensionStyles = (dimension: 'height' | 'width', value: string, unit: string) => {
    const currentStyles = stringToStyles(cssString);
    const newDimensionStyle = value ? `${value}${unit}` : undefined;

    const updatedStyles = { ...currentStyles };
    if (newDimensionStyle) {
      updatedStyles[dimension] = newDimensionStyle;
    } else {
      delete updatedStyles[dimension];
    }

    updateBoardElementStyles(
      activeElement.uniqueId,
      activeElement.path,
      updatedStyles
    );
    const newCssString = stylesToString(updatedStyles);
    setCssString(newCssString);
  };



  const handleTextTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setTextType(selectedType);

    const currentStyles = activeElement.getStyles();

    // TEXT STYLE DICTIONARY
    const styleMap: Record<string, { fontSize: string; fontWeight: string }> = {
      regular: { fontSize: "16px", fontWeight: "400" },
      small: { fontSize: "12px", fontWeight: "300" },
      large: { fontSize: "24px", fontWeight: "700" },
      footnote: { fontSize: "10px", fontWeight: "300" },
      headlineXSmall: { fontSize: "18px", fontWeight: "500" },
      headlineSmall: { fontSize: "22px", fontWeight: "500" },
      headlineMedium: { fontSize: "28px", fontWeight: "600" },
      headlineLarge: { fontSize: "36px", fontWeight: "700" },
      headlineXLarge: { fontSize: "48px", fontWeight: "800" },
    };

    // Get font-size + font-weight for selected type
    const { fontSize, fontWeight } = styleMap[selectedType] || {};

    // Merge into existing styles
    const updatedStyles = {
      ...currentStyles,
      fontSize,
      fontWeight,
    };

    // Update UIElement in board system
    updateBoardElementStyles(
      activeElement.uniqueId,
      activeElement.path,
      updatedStyles
    );

    // Update cssString
    const newCssString = stylesToString(updatedStyles);
    setCssString(newCssString);
  };

  const handleHeightValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHeightValue(value);
    updateDimensionStyles('height', value, heightUnit);
  };

  const handleHeightUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value;
    setHeightUnit(unit);
    updateDimensionStyles('height', heightValue, unit);
  };

  const handleWidthValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWidthValue(value);
    updateDimensionStyles('width', value, widthUnit);
  };

  const handleWidthUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = e.target.value;
    setWidthUnit(unit);
    updateDimensionStyles('width', widthValue, unit);
  };

  const updateColorStyle = (property: string, color: string) => {
    const currentStyles = stringToStyles(cssString);
    const updatedStyles = {
      ...currentStyles,
      [property]: color,
    };
    updateBoardElementStyles(
      activeElement.uniqueId,
      activeElement.path,
      updatedStyles
    );
    // Also update the cssString to reflect the change
    const newCssString = stylesToString(updatedStyles);
    setCssString(newCssString);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setBackgroundColor(color);
    updateColorStyle('backgroundColor', color);
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setBackgroundColor(color);
    updateColorStyle('backgroundColor', color);
  };

  const handleFontColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setFontColor(color);
    updateColorStyle('color', color);
  };

  const updateStyle = (property: string, value: string) => {
    const currentStyles = stringToStyles(cssString);
    const updatedStyles = {
      ...currentStyles,
      [property]: value,
    };
    updateBoardElementStyles(
      activeElement.uniqueId,
      activeElement.path,
      updatedStyles
    );
    const newCssString = stylesToString(updatedStyles);
    setCssString(newCssString);
  };

  const handleFontWeightChange = () => {
    const newWeight = fontWeight === 'bold' ? 'normal' : 'bold';
    setFontWeight(newWeight);
    updateStyle('fontWeight', newWeight);
  };

  const handleFontStyleChange = () => {
    const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
    setFontStyle(newStyle);
    updateStyle('fontStyle', newStyle);
  };

  const deleteElement = () => {
    console.log("my delete component", activeElement);
    if (activeElement.getType() === 'selectedNavbar') {
      alert("Untick the navbar from page dropdown to delete")
    }
    else if (activeElement.getType() === 'selectedSidebar') {
      alert("Untick the sidebar from page dropdown to delete")

    }
    else {

      deleteRaspUIElement(activeElement.uniqueId, activeElement.path);
      setActiveElement("");
    }
  };
  const handleAddItem = () => {
    if (activeElement && item.length !== 0) {
      const newItems: string[] = [...activeElement.items, item];
      setActiveElement({ ...activeElement, items: newItems });
      updateBoardElementItems(
        activeElement.uniqueId,
        activeElement.path,
        newItems
      );
      if (activeElement.getType() === 'selectedNavbar') {
        setNavbarObj(appId,activeElement)
      }
      if (activeElement.getType() === 'selectedSidebar') {
        setSidebarObj(appId,activeElement)
      }

      setItem("");
    }
  };
  const deleteArrItem = () => {
    if (idx > -1) {
      textArr.splice(idx, 1);
      const selectedEditable = selectedProperty as ArrayEditable;
      const arr = textArr;
      updateBoardArrayElementItems(
        activeElement.uniqueId,
        activeElement.path,
        arr,
        selectedEditable?.setArrayMethod
      );
    }
    setText("");
    setSelectedProperty(null);
    setIdx(-1);
  };
  const traverseCustomComponentForSave = (
    ui_items: UIItems,
    selectedComponent: any,
    pathForBoard: any,
    pathForCC: any,
    addUIItemCC: any
  ) => {
    let pathForTraverse = selectedComponent.getPath();
    let id = selectedComponent.getId();
    const elements = ui_items[`${pathForTraverse}/container${id}`] || [];
    elements.map((item: UIElement) => {
      if (!React.isValidElement(item.getHtml())) {
        return "";
      }
      const serializedObject = item.serialise();
      addUIItemCC(item, pathForCC, serializedObject);
      if (item.isContainer() || item.isListingContainer()) {
        const parsedSerialisedObj = JSON.parse(serializedObject);
        const nestedPathForBoard = `${pathForBoard}/container${item.getId()}`;
        const nestedPathForCC = `${pathForCC}/container${parsedSerialisedObj.uniqueId}`;
        traverseCustomComponentForSave(
          ui_items,
          item,
          nestedPathForBoard,
          nestedPathForCC,
          addUIItemCC
        );
      }
    });
    setReadyToSendCC(true);
  };
  const handleSaveComponent = async () => {
    const containerPath = activeElement.getPath();
    const containerId = activeElement.getId();
    const arrayOfElementsToThisPath = board.ui_items[containerPath];
    const containerElement = arrayOfElementsToThisPath.filter(
      (element: UIElement) => element.getId() === containerId
    );
    let elementToSave = containerElement[0];
    if (activeElement.isContainer() || activeElement.isListingContainer()) {
      const serializedObj = elementToSave.serialise();
      const parsedSerialisedObj = JSON.parse(serializedObj);
      addUIItemCC(activeElement, "root", serializedObj);
      traverseCustomComponentForSave(
        board.ui_items,
        elementToSave,
        activeElement.getPath(),
        `root/container${parsedSerialisedObj.uniqueId}`,
        addUIItemCC
      );
    } else {
      const serializedObj = elementToSave.serialise();
      addUIItemCC(elementToSave, "root", serializedObj);
      setReadyToSendCC(true);
    }
  };
  useEffect(() => {
    if (isReadyToSend) {
      const ccJson = {
        name: CustomComponentName,
        myCC: ui_items_cc,
      };
      const backendDataToSend = {
        componentName: ccJson.name,
        componentContent: ccJson.myCC,
      };
      const sendDataToBackend = async () => {
        try {
          const result = await createCustomComponent(backendDataToSend);
          notifySaveComponent();
          queryClient.invalidateQueries({
            queryKey: ["customComponents", userInfo.getUserId()],
          });
          setReadyToSendCC(false);
          emptyUIItemsCC();
        } catch (error) {
          alert("Failed to save custom component. Please try again.");
        }
      };
      sendDataToBackend();
    }
  }, [isReadyToSend, ui_items_cc, setReadyToSendCC]);
  useEffect(() => {
    if (
      activeElement &&
      activeElement.isCustomView() &&
      activeElement.getAttrMapp().size === 0
    ) {
      const allData = activeElement.getData()[0];
      if (!allData) return;
      const allKeys = Object.keys(activeElement.getData()[0]);
      handleSetAttrMappEntry(
        CARD_ATTR_TITLE,
        allKeys[0] !== undefined ? allKeys[0] : ""
      );
      handleSetAttrMappEntry(
        CARD_ATTR_DESC,
        allKeys[1] !== undefined ? allKeys[1] : ""
      );
      handleSetAttrMappEntry(
        CARD_ATTR_META,
        allKeys[2] !== undefined ? allKeys[2] : ""
      );
    }
  }, [activeElement]);
  const matchedResource = resources.find(
    (res: any) => res.resourceName === activeElement?.getResourceName?.()
  );
  const handleSetAttrMappEntry = (field: string, value: string) => {
    activeElement.setAttrMappEntry(field, value);
    updateBoardUIItemForViewStyle(
      activeElement.uniqueId,
      activeElement.path,
      activeElement
    );
  };

  // useEffect to set data when active elments is a obj of ReadResource
  useEffect(() => {
    if (activeElement.type === "read-resource" && activeElement.isResource()) {
      setDataForCustomView(activeElement.getResourceName());
    }
  }, [activeElement]);

  const setDataForCustomView = (resName: any) => {
    // activeElement.setResourceType(resName);
    activeElement.setData(getResourcesData(appId ?? "")[resName] || []);
    if (
      activeElement &&
      activeElement.getAttrMapp().size === 0 &&
      activeElement.getData()[0]
    ) {
      const allKeys = Object.keys(activeElement.getData()[0]);
      handleSetAttrMappEntry(
        CARD_ATTR_TITLE,
        allKeys[0] !== undefined ? allKeys[0] : ""
      );
      handleSetAttrMappEntry(
        CARD_ATTR_DESC,
        allKeys[1] !== undefined ? allKeys[1] : ""
      );
      handleSetAttrMappEntry(
        CARD_ATTR_META,
        allKeys[2] !== undefined ? allKeys[2] : ""
      );
    }
    updateBoardUIItems(
      userInfo.getCurrentPage()?.getPageUIItems(),
      userInfo.getCurrentPage()?.getName(),
      userInfo.getCurrentApplication()?.getName()
    );
  };


  type StyleType = "default" | "rounded" | "circle";

  const handleStyleTypeChange = (type: StyleType) => {
    const currentStyles = activeElement.getStyles();

    let borderRadius = "0px";
    if (type === "rounded") borderRadius = "12px";
    if (type === "circle") borderRadius = "50%";

    const updatedStyles = {
      ...currentStyles,
      borderRadius,
    };

    updateBoardElementStyles(activeElement.uniqueId, activeElement.path, updatedStyles);
    activeElement.setStyleType(type);
    setCssString(stylesToString(updatedStyles));
  };

  type AspectRatioKey = "auto" | "9:16" | "square" | "4:3" | "16:9" | "3:1";

  const aspectMap: Record<AspectRatioKey, string | null> = {
    auto: null,
    square: "1 / 1",
    "9:16": "9 / 16",
    "4:3": "4 / 3",
    "16:9": "16 / 9",
    "3:1": "3 / 1"
  };

  const handleAspectChange = (ratio: AspectRatioKey) => {
    if (!activeElement) return;

    activeElement.setAspectRatio(ratio);

    const aspectValue = aspectMap[ratio];
    const currentStyles = activeElement.getStyles();

    const updatedStyles = {
      ...currentStyles,
    };

    if (ratio === "auto") {
      delete updatedStyles.aspectRatio;
      updatedStyles.height = "auto";   // reset height
    } else {
      updatedStyles.aspectRatio = aspectMap[ratio]; // numeric → browser converts automatically
      updatedStyles.height = "auto"; // let browser compute height
    }
    updateBoardElementStyles(activeElement.uniqueId, activeElement.path, updatedStyles);
    setCssString(stylesToString(updatedStyles));
  };


  type SizeKey = "S" | "M" | "Full";

  const handleSizeChange = (size: SizeKey) => {
    activeElement.setSize(size);

    const sizeMap: Record<SizeKey, string> = {
      S: "120px",
      M: "200px",
      Full: "100%",
    };

    const updatedStyles = {
      ...activeElement.getStyles(),
      width: sizeMap[size],
      // height: sizeMap[size],
    };

    updateBoardElementStyles(activeElement.uniqueId, activeElement.path, updatedStyles);
    setCssString(stylesToString(updatedStyles));
  };

  type FitType = "cover" | "contain" | "fill";

  const handleImageFit = (fit: FitType) => {
    activeElement.setObjectFit(fit);

    const updatedStyles = {
      ...activeElement.getStyles(),
      objectFit: fit === "fill" ? "cover" : "contain",
    };

    updateBoardElementStyles(activeElement.uniqueId, activeElement.path, updatedStyles);
    setCssString(stylesToString(updatedStyles));
  };

  type AlignKey = "left" | "center" | "right";



  const handleAlignment = (align: AlignKey) => {
    activeElement.setAlignment(align);

    const alignMapInlineElement: Record<AlignKey, Record<string, string>> = {
      left: { display: "block", marginLeft: "0", marginRight: "auto" },
      center: { display: "block", marginLeft: "auto", marginRight: "auto" },
      right: { display: "block", marginLeft: "auto", marginRight: "0" },
    };

    const alignMapElement: Record<AlignKey, Record<string, string>> = {
      left: { marginLeft: "0", marginRight: "auto" },
      center: { marginLeft: "auto", marginRight: "auto" },
      right: { marginLeft: "auto", marginRight: "0" },
    };

    // Let React update DOM before we query it
    setTimeout(() => {
      const ele = document.getElementById(activeElement.getId());

      console.log("display of type", ele);
      // if (!ele) {
      //   console.warn("Element not found in DOM during alignment:", activeElement.getId());
      //   return;
      // }

      // Detect inline vs block using actual computed CSS
      const display = ele === null ? "block" : getComputedStyle(ele).display;
      const isInline =
        display === "inline" ||
        display === "inline-block" ||
        display === "inline-flex"; // covers many inline cases

      const updatedStyles = {
        ...activeElement.getStyles(),
        ...(isInline ? alignMapInlineElement[align] : alignMapElement[align])
      };

      updateBoardElementStyles(
        activeElement.uniqueId,
        activeElement.path,
        updatedStyles
      );

      setCssString(stylesToString(updatedStyles));
    });
  };



  return (
    <aside
      className="panel"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        alignSelf: "flex-start",
        borderRadius: 0,
        border: "none",
        background: "var(--dash-surface)",
      }}
    >
      {activeElement ? (
        <>
          {/* Header */}
          <div className="panel-header">
            <div className="panel-header-content">
              <i className="fa fa-pencil-square-o panel-header-icon" />
              <h3>Edit Element</h3>
            </div>
            <div className="actions">
              <button
                className="icon-btn subtle"
                onClick={() => setActiveElement("")}
                title="Close"
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="d-flex border-bottom border-secondary" style={{ borderColor: 'var(--dash-border) !important' }}>
            <button
              className={`flex-fill py-3 px-2 text-center fw-bold`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'edit' ? '2px solid var(--dash-accent)' : '1px solid transparent',
                color: activeTab === 'edit' ? 'var(--dash-accent)' : 'var(--dash-text)',
                transition: 'all 0.2s',
                opacity: activeTab === 'edit' ? 1 : 0.6
              }}
              onClick={() => setActiveTab('edit')}
            >
              <i className="fa fa-sliders me-2"></i> Properties
            </button>
            <button
              className={`flex-fill py-3 px-2 text-center fw-bold`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'styles' ? '2px solid var(--dash-accent)' : '1px solid transparent',
                color: activeTab === 'styles' ? 'var(--dash-accent)' : 'var(--dash-text)',
                transition: 'all 0.2s',
                opacity: activeTab === 'styles' ? 1 : 0.6
              }}
              onClick={() => setActiveTab('styles')}
            >
              <i className="fa fa-paint-brush me-2"></i> Styles
            </button>
          </div>

          <div className="tab-content p-3 overflow-auto hide-scrollbar" id="editTabsContent" style={{ flex: 1 }}>
            <div className={`tab-pane fade ${activeTab === 'edit' ? 'show active' : ''}`}>
              {activeElement.isCustomView() && (
                <CustomViewEdits
                  activeElement={activeElement}
                  resources={resources}
                  setDataForCustomView={setDataForCustomView}
                  handleSetAttrMappEntry={handleSetAttrMappEntry}
                  updateBoardUIItemForViewStyle={updateBoardUIItemForViewStyle}
                />
              )}

              {activeElement.items && (
                <ItemEdits
                  item={item}
                  setItem={setItem}
                  handleAddItem={handleAddItem}
                />
              )}
              {activeElement.navigateTo && (
                <NavigationEdits
                  activeElement={activeElement}
                  apiUrl={apiUrl}
                  setApiUrl={setApiUrl}
                  board={board}
                  allPages={allPages}
                  currentPage={currentPage}
                  handleSetNavigation={handleSetNavigation}
                  handleRemoveNavigation={handleRemoveNavigation}
                />
              )}
              {activeElement.isResource() && (
                <ResourceEdits
                  activeElement={activeElement}
                  matchedResource={matchedResource}
                  ui_items={ui_items}
                  ResourceAttributes={ResourceAttributes}
                />
              )}
              <EditableProperties

                activeElement={activeElement}
                selectedProperty={selectedProperty}
                setSelectedProperty={setSelectedProperty}
                textArr={textArr}
                setText={setText}
                setIdx={setIdx}
                updateOperation={updateOperation}
                text={text}
                setElementText={setElementText}
                deleteArrItem={deleteArrItem}
                idx={idx}
                EDITABLE_TYPE={EDITABLE_TYPE}
                updateBoardUIItemForViewStyle={updateBoardUIItemForViewStyle}
                setDataForCustomView={setDataForCustomView}
                handleSetAttrMappEntry={handleSetAttrMappEntry}
                resources={resources}

              />
              <div className="d-flex flex-column gap-1 mt-4 pt-3 border-top border-secondary" style={{ borderColor: 'var(--dash-border) !important' }}>
                <button
                  className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={deleteElement}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '0.6rem'
                  }}
                >
                  <i className="fa fa-trash"></i> Delete Element
                </button>
              </div>
              <CustomComponentEdits
                CustomComponentName={CustomComponentName}
                setCustomComponentName={setCustomComponentName}
                handleSaveComponent={handleSaveComponent}
              />
            </div>
            <div className={`tab-pane fade ${activeTab === 'styles' ? 'show active' : ''}`}>
              <StyleEdits
                heightValue={heightValue}
                handleHeightValueChange={handleHeightValueChange}
                heightUnit={heightUnit}
                handleHeightUnitChange={handleHeightUnitChange}
                widthValue={widthValue}
                handleWidthValueChange={handleWidthValueChange}
                widthUnit={widthUnit}
                handleWidthUnitChange={handleWidthUnitChange}
                backgroundColor={backgroundColor}
                handleBackgroundColorChange={handleBackgroundColorChange}
                fontColor={fontColor}
                handleFontColorChange={handleFontColorChange}
                fontWeight={fontWeight}
                handleFontWeightChange={handleFontWeightChange}
                fontStyle={fontStyle}
                handleFontStyleChange={handleFontStyleChange}
                cssString={cssString}
                handleCssChange={handleCssChange}
                classString={classString}
                handleClassChange={handleClassChange}
                handleTextTypeChange={handleTextTypeChange}
                textType={textType}
                activeElement={activeElement}
                handleStyleTypeChange={handleStyleTypeChange}
                handleAspectChange={handleAspectChange}
                handleSizeChange={handleSizeChange}
                handleImageFit={handleImageFit}
                handleAlignment={handleAlignment}
              />
            </div>

          </div>
        </>
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
          <i className="fa fa-mouse-pointer mb-3" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
          <p className="text-center">Select an element to edit its properties.</p>
        </div>
      )}
    </aside>
  );
};
export default Edits;
