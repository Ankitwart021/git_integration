import ElementFactory from "../models/ElementFactory";
import UIElement from "../models/UIElement";

export function getAppIdFromUrl(): string | null {
  if (typeof window === "undefined") return null; // SSR-safe
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length > 0 ? parts[0] === 'dashboard' ? parts[1] : parts[0] : null // e.g. /f56da6fd-38 → "f56da6fd-38' : null; // first segment = appId
}

export const mapFieldsToObject = (fieldValues: any) => {
  return fieldValues.reduce((acc: any, field: any) => {
    acc[field.name] = field.type.toLowerCase();
    return acc;
  }, {});
};


export function createFieldUIElement(field: any, resourceName: string) {
  let uiType = "";
  if (field.type === "Date") uiType = "inputCalendar";
  else if (field.is_enum || field.foreign_field || field.type === "Boolean")
    uiType = "dropdown";
  else if (field.is_file) uiType = "fileupload";
  else if (field.type === "String" || field.type === "Long") uiType = "input";
  else return null;

  const container = ElementFactory.createUIElement("container", {
    itemType: "container",
  });
  container?.setClasses("d-flex flex-column mb-3 w-100");

  const label = ElementFactory.createUIElement("addText", { itemType: "label" });
  if (label) {
    if (label && "setText" in label) label?.setText(`${field.name}${field.required ? " *" : ""}`);
    label?.setClasses("fw-bold mb-1");
  }
  const uiElement = ElementFactory.createUIElement(uiType, { itemType: uiType });
  if (!uiElement) return null;

  // Safe type-narrowing
  if ("setBoundResourceName" in uiElement) {
    uiElement.setBoundResourceName(resourceName);
  }
  if ("setBoundFieldName" in uiElement) {
    uiElement.setBoundFieldName(field.name);
  }

  if ("setPlaceholder" in uiElement) {
    uiElement.setPlaceholder?.(field.name);
  }

  if ("setItems" in uiElement && field.possible_value) {
    uiElement.setItems?.(field.possible_value.split(","));
  }

  if ("setFileUploadLabel" in uiElement && field.is_file) {
    uiElement.setFileUploadLabel?.(`Upload ${field.name}`);
  }
  if ("setText" in uiElement) {
    uiElement.setText(field.name);
  }

  return { container, label, uiElement };
}

export interface GeneratedFormElement {
  element: UIElement;
  children?: UIElement[];
}

export function generateCreateFormUI(
  resourceName: string,
  requiredFields: any[]
): GeneratedFormElement[] {
  const elements: GeneratedFormElement[] = [];

  // (A) Title
  const title = ElementFactory.createUIElement("addText", "");
  if (title) {
    if ("setText" in title) {
      title.setText(resourceName);
    }
    if ("setClasses" in title) {
      title.setClasses("fw-bold fs-3");
    }
    elements.push({ element: title });
  }

  // (B) Fields
  requiredFields.forEach(field => {
    const fieldElements = createFieldUIElement(field, resourceName);
    if (!fieldElements) return;

    const { container, label, uiElement } = fieldElements;
    if (!container) return;

    const children: UIElement[] = [];
    if (label) children.push(label);
    if (uiElement) children.push(uiElement);

    elements.push({
      element: container,
      children,
    });
  });

  // (C) Submit
  const submit = ElementFactory.createUIElement("button", "");
  if (submit) {
    if ("setText" in submit) submit.setText?.("Submit");
    if ("setApi" in submit) submit.setApi?.(`/api/${resourceName}`);
    elements.push({ element: submit });
  }

  return elements;
}