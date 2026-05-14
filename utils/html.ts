
import * as cheerio from "cheerio";
import { EJSFILENAMES, PATHS, REGEX, STRINGS } from "../constants/constants";
import fs from "fs-extra";
import path from "path";
import { getTemplate, getTemplateForEdit } from "../server";

export function replaceClassnameWithClassName(htmlString: string) {
  return htmlString.replace(REGEX.CLASSNAME_REPLACE, 'className="');
}
const camelToKebab = (str: string) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export const createCssFileForNavSidebar = async (
  cssData: any,
  componentName: any,
  projectDir: any,
  navSidebarFolderName:any
) => {
  const cssFilePath = path.join(
    projectDir,
    PATHS.SRC,
    PATHS.COMPONENTS,
    navSidebarFolderName,
    `Selected${navSidebarFolderName}.css`
  );
  let cssContent = "";

  for (const id in cssData) {
    if (typeof cssData[id] === "object" && cssData[id] !== null) {
      cssContent += `#${id} {
`;

      for (const property in cssData[id]) {
        const kebabProperty = camelToKebab(property);
        cssContent += `  ${kebabProperty}: ${cssData[id][property]};
`;
      }

      cssContent += `}

`;
    } else {
      console.warn(`Invalid CSS data for ID: ${id}. Expected an object.`);
    }
  }

  await fs.outputFile(cssFilePath, cssContent);
  return `./Selected${navSidebarFolderName}.css`;
};
export const createCssFile = async (
  cssData: any,
  componentName: any,
  projectDir: any
) => {
  const cssFilePath = path.join(
    projectDir,
    PATHS.SRC,
    PATHS.COMPONENTS,
    `${componentName}.css`
  );
  let cssContent = "";

  for (const id in cssData) {
    if (typeof cssData[id] === "object" && cssData[id] !== null) {
      cssContent += `#${id} {
`;

      for (const property in cssData[id]) {
        const kebabProperty = camelToKebab(property);
        cssContent += `  ${kebabProperty}: ${cssData[id][property]};
`;
      }

      cssContent += `}

`;
    } else {
      console.warn(`Invalid CSS data for ID: ${id}. Expected an object.`);
    }
  }

  await fs.outputFile(cssFilePath, cssContent);
  return `./${componentName}.css`;
};

export const extractCardHtml = (htmlContent: any, containerId: any) => {
  const $ = cheerio.load(htmlContent, {
    xmlMode: true,
    decodeEntities: false,
  });
  const container = $(`#${containerId}`);

  if (container.length) {
    return container.html() || "";
  }
  return "";
};

export const removeCardHtml = (htmlContent: any, containerId: any) => {
  const replaceContent = STRINGS.PLACEHOLDER_CONTENT;

  const $ = cheerio.load(htmlContent, {
    xmlMode: true,
    decodeEntities: false,
  });

  const targetDiv = $(`#${containerId}`);

  targetDiv.html(replaceContent);

  const updatedHtml = $.html();

  const cleanHtml = updatedHtml
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<\/?head[^>]*>/gi, "")
    .replace(/<\/?body[^>]*>/gi, "");

  return cleanHtml;
};

let __RAW_COUNTER = 0;
function nextRawKey() {
  __RAW_COUNTER += 1;
  return `__RAW_${__RAW_COUNTER}__`;
}
export const transformHtmlForCreate = async (
  htmlString: string,
  parentContainerId: string,
  resourceData: any
) => {
  htmlString = htmlString.replace(
    /<option\s+value\s*(?=\s|>)/g,
    '<option value=""'
  );

  const $ = cheerio.load(htmlString, {
    xmlMode: false,
    decodeEntities: false,
  });
  console.log("✅ Final transformed HTML ready for create string", htmlString);
  const rawMap: Record<string, string> = {};
  const requiredFieldValues = resourceData.fieldValues || [];
  const parentDiv = $(`#${parentContainerId}`);

  if (!parentDiv || parentDiv.length === 0) {
    console.warn(`Parent container with ID ${parentContainerId} not found`);
    return htmlString;
  }

  const resourceNameDiv = parentDiv.children("div").first();
  const resourceName = resourceNameDiv.text().trim();
  console.log("Detected resource:", resourceName);

  const allChildDivs = parentDiv.children("div");
  const fieldContainers = allChildDivs.slice(1);

  console.log(
    "✅ Final transformed HTML ready for create container",
    allChildDivs
  );
  for (const fieldContainer of fieldContainers.toArray()) {
    const container = $(fieldContainer);
    const hasSubmitButton = container
      .find("button")
      .toArray()
      .some((btn) => $(btn).text().trim().toLowerCase() === "submit");
    if (hasSubmitButton) continue;
    const transformed = await transformFieldBlockForCreate(
      container,
      requiredFieldValues,
      rawMap
    );
    console.log("transformed data for create", transformed, container);
    container.html(transformed);
  }

  parentDiv.find("button").each((_, btn: any) => {
    const buttonText = $(btn).text().trim().toLowerCase();
    if (buttonText === "submit") {
      // remove existing onclick attributes if any
      $(btn).removeAttr("onclick");

      // Add a unique placeholder in the text output
      $(btn).attr("data-onclick-placeholder", "HANDLE_CREATE");
    }
  });

  let finalHtml = $.html(parentDiv, { decodeEntities: false });

  // Replace whole attribute with JSX onClick
  finalHtml = finalHtml.replace(
    /\sdata-onclick-placeholder="HANDLE_CREATE"/g,
    " onClick={handleCreate}"
  );

  for (const key of Object.keys(rawMap)) {
    finalHtml = finalHtml.split(key).join(rawMap[key]);
  }
  console.log("✅ Final transformed HTML ready for create before", finalHtml);
  finalHtml = finalHtml
    .replace(/\bclassname=/gi, "className=")
    .replace(/\bclass=/gi, "className=")
    .replace(/required=\"{?(true|false)\"?}/g, "required={$1}")
    .replace(/onchange=/gi, "onChange=")
    .replace(/onclick=/gi, "onClick=")
    .replace(/oninput=/gi, "onInput=")
    .replace(/data-raw-onclick=\"onClick=\\{([^"}\\)]+)\"}/gi, "onClick={$1}")
    .replace(/on(Change|Click|Input)=\"{?(\(e\)\")?\s*=>/g, "on$1={(e) =>")
    .replace(/<option\s+value(?!=\"")>/g, '<option value=""')
    .replace(/\s{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .replace(/>\s+</g, "><")
    .trim();

  console.log("✅ Final transformed HTML for Create ready", finalHtml);
  return finalHtml;
};
export const transformFieldBlockForCreate = async (
  container: cheerio.Cheerio,
  requiredFieldValues: any[],
  rawMap: Record<string, string>
) => {
  const $ = cheerio.load(container.html() || "", { decodeEntities: false });
  const inputEl = $("input:not([type=file])").first();
  const dropdownEl = $("div.dropdown, [classname*='dropdown']").first();
  const fileEl = $("input[type=\"file\"]").first();
  console.log(
    "Final transformed HTML ready for create in input",
    fileEl.attr("id")
  );

  const pushRaw = (rawJSX: string) => {
    const key = nextRawKey();
    rawMap[key] = rawJSX;
    return key;
  };
  

  if (inputEl.length && !fileEl.length) {
    const placeholder = inputEl.attr("placeholder")?.trim() || "";
    const fieldMeta = requiredFieldValues.find(
      (f) => f.name?.toLowerCase() === placeholder?.toLowerCase()
    );
    if (!fieldMeta) return $.html();
console.log("meta data for field values input", fieldMeta);
    const type = (fieldMeta.type || "").toLowerCase();
    const inputType = type === "date" ? "date" : "text";

    const raw = await getTemplate(EJSFILENAMES.INPUT, {
      inputType,
      fieldMeta,
      placeholder,
      id: inputEl.attr("id"),
    });


    console.log("my raw html data", raw, typeof raw);
    console.log("input for create", {
      inputType,
      fieldMeta,
      placeholder,
      id: inputEl.attr("id"),
    });
    const key = pushRaw(raw);
    inputEl.replaceWith(key);
    console.log("input data check", key, $.html(), inputEl);
    return $.html();
    
  }

  if (dropdownEl.length) {
    const button = dropdownEl.find("button").first();
    const fieldText = (button.text() || "").trim();
    const fieldMeta = requiredFieldValues.find(
      (f) => f.name?.toLowerCase() === fieldText?.toLowerCase()
    );
    if (!fieldMeta) return $.html();

    if ((fieldMeta.type || "").toLowerCase() === "boolean") {
      const raw = await getTemplate(EJSFILENAMES.BOOLEANDROPDOWN, {
        fieldMeta,
        inputId: inputEl.attr("id"),
      });
      const key = pushRaw(raw);
      dropdownEl.replaceWith(key);
      return $.html();
    }

    if (fieldMeta.is_enum || fieldMeta.possible_value) {
      const enumKey = fieldMeta.possible_value || fieldMeta.name;
      const raw = await getTemplate(EJSFILENAMES.ENUMDROPDOWN, {
        fieldMeta,
        inputId: inputEl.attr("id"),
        enumKey
      });
      const key = pushRaw(raw);
      dropdownEl.replaceWith(key);
      return $.html();
    }

    if (fieldMeta.foreign || fieldMeta.foreign_field) {
      const fieldName = fieldMeta.name;
      const refResource = fieldMeta.foreign || fieldMeta.foreign_field;
      const foreignField = fieldMeta.foreign_field || "name";

      const raw = await getTemplate(EJSFILENAMES.FOREIGNKEYDROPDOWN, {
        refResource,
        foreignField,
        fieldName
      });
      const key = pushRaw(raw);
      dropdownEl.replaceWith(key);
      return $.html();
    }

    return $.html();
  }

  if (fileEl.length) {

const parentDiv = fileEl.closest("div.mb-3");


const labelText = parentDiv.find("label").text() || "";

const matchedName = labelText
  .trim()
  .split(/\s+/)   // split by spaces
  .pop()          // take last word
  ?.toLowerCase();  
  const fieldMeta = requiredFieldValues.find(
    (f) =>
      f.is_file === true &&
  f.name.toLowerCase() === matchedName
);

if (!fieldMeta) return $.html();

const raw = await getTemplate(EJSFILENAMES.FILEINPUT, {
  fieldMeta,
  inputId: fileEl.attr("id"),
});

    const key = pushRaw(raw);
    fileEl.replaceWith(key);
    return $.html();
  }

  return $.html();
}

export const transformHtmlForEdit = async (
  htmlString: string,
  parentContainerId: string,
  resourceData: any
) => {
  htmlString = htmlString.replace(
    /<option\s+value\s*(?=\s|>)/g,
    '<option value=""'
  );

  const $ = cheerio.load(htmlString, {
    xmlMode: false,
    decodeEntities: false,
  });

  const rawMap: Record<string, string> = {};
  const requiredFieldValues = resourceData.fieldValues || [];
  const parentDiv = $(`#${parentContainerId}`);

  if (!parentDiv || parentDiv.length === 0) {
    console.warn(`Parent container with ID ${parentContainerId} not found`);
    return htmlString;
  }

  const resourceNameDiv = parentDiv.children("div").first();
  const resourceName = resourceNameDiv.text().trim();
  console.log("Detected resource for edit:", resourceName);

  const allChildDivs = parentDiv.children("div");
  const fieldContainers = allChildDivs.slice(1);

  for (const fieldContainer of fieldContainers.toArray()) {
    const container = $(fieldContainer);
    const hasSubmitButton = container
      .find("button")
      .toArray()
      .some((btn) => $(btn).text().trim().toLowerCase() === "update");
    if (hasSubmitButton) continue;

    const transformed = await transformFieldBlockForEdit(
      container,
      requiredFieldValues,
      rawMap
    );
    container.html(transformed);
  }

  parentDiv.find("button").each((_, btn: any) => {
    const buttonText = $(btn).text().trim().toLowerCase();
    if (buttonText === "submit") {
      // remove existing onclick attributes if any
      $(btn).removeAttr("onclick");

      // Add a unique placeholder in the text output
      $(btn).attr("data-onclick-placeholder", "HANDLE_UPDATE");
    }
  });

  let finalHtml = $.html(parentDiv, { decodeEntities: false });

  // Replace whole attribute with JSX onClick
  finalHtml = finalHtml.replace(
    /\sdata-onclick-placeholder="HANDLE_UPDATE"/g,
    " onClick={(e)=>handleUpdate(e)}"
  );


  for (const key of Object.keys(rawMap)) {
    finalHtml = finalHtml.split(key).join(rawMap[key]);
  }

  finalHtml = finalHtml
    .replace(/\bclassname=/gi, "className=")
    .replace(/\bclass=/gi, "className=")
    .replace(/required=\"{?(true|false)\"?}/g, "required={$1}")
    .replace(/onchange=/gi, "onChange=")
    .replace(/onclick=/gi, "onClick=")
    .replace(/oninput=/gi, "onInput=")
    .replace(/data-raw-onclick=\"onClick=\\{([^"}\\)]+)\"}/gi, "onClick={$1}")
    .replace(/on(Change|Click|Input)=\"{?(\(e\)\")?\s*=>/g, "on$1={(e) =>")
    .replace(/<option\s+value(?!=\"")>/g, '<option value=""')
    .replace(/\s{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .replace(/>\s+</g, "><")
    .trim();

  console.log("✅ Final transformed HTML for Edit ready", finalHtml);
  return finalHtml;
};
export async function transformFieldBlockForEdit(
  container: cheerio.Cheerio,
  requiredFieldValues: any[],
  rawMap: Record<string, string>
) {
  const $ = cheerio.load(container.html() || "", { decodeEntities: false });

  const inputEl = $("input:not([type=file])").first();
  const dropdownEl = $("div.dropdown, [classname*='dropdown']").first();
  const fileEl = $("input[type=\"file\"]").first();

  const pushRaw = (rawJSX: string) => {
    const key = nextRawKey();
    rawMap[key] = rawJSX;
    return key;
  };

  if (inputEl.length && !fileEl.length) {
    const placeholder = inputEl.attr("placeholder")?.trim() || "";
    const fieldMeta = requiredFieldValues.find(
      (f) => f.name?.toLowerCase() === placeholder?.toLowerCase()
    );
    if (!fieldMeta) return $.html();

    const type = (fieldMeta.type || "").toLowerCase();
    const inputType = type === "date" ? "date" : "text";

    const raw = await getTemplateForEdit(EJSFILENAMES.INPUT, {
      fieldMeta,
      inputType,
      // context requires both
    });
    const key = pushRaw(raw);
    inputEl.replaceWith(key);
    return $.html();
  }

  if (dropdownEl.length) {
    const button = dropdownEl.find("button").first();
    const fieldText = (button.text() || "").trim();
    const fieldMeta = requiredFieldValues.find(
      (f) => f.name?.toLowerCase() === fieldText?.toLowerCase()
    );
    if (!fieldMeta) return $.html();

    if ((fieldMeta.type || "").toLowerCase() === "boolean") {
      const raw = await getTemplateForEdit(EJSFILENAMES.BOOLEANDROPDOWN, {
        fieldMeta
      })
      const key = pushRaw(raw);
      dropdownEl.replaceWith(key);
      return $.html();
    }

    if (fieldMeta.is_enum || fieldMeta.possible_value) {
      const enumKey = fieldMeta.possible_value || fieldMeta.name;
      const raw = await getTemplateForEdit(EJSFILENAMES.ENUMDROPDOWN, {
        fieldMeta,
        enumKey,
      });
      const key = pushRaw(raw);
      dropdownEl.replaceWith(key);
      return $.html();
    }

    if (fieldMeta.foreign || fieldMeta.foreign_field) {
      const fieldName = fieldMeta.name;
      const refResource = fieldMeta.foreign || fieldMeta.foreign_field;
      const foreignField = fieldMeta.foreign_field || "name";

      const raw = await getTemplateForEdit(EJSFILENAMES.FOREIGNKEYDROPDOWN, {
        fieldName,
        refResource,
        foreignField,
      });
      const key = pushRaw(raw);
      dropdownEl.replaceWith(key);
      return $.html();
    }

    return $.html();
  }

  if (fileEl.length) {
    const fieldMeta = requiredFieldValues.find(
      (f) => f.is_file || f.type?.toLowerCase() === "file"
    );
    if (!fieldMeta) return $.html();

    const raw = await getTemplateForEdit(EJSFILENAMES.FILEINPUT, { fieldMeta });
    const key = pushRaw(raw);
    fileEl.replaceWith(key);
    return $.html();
  }

  return $.html();
}

export function convertStyleToJSX(styleStr: string): string {
  const styleObj: Record<string, string> = {};
  styleStr.split(";").forEach((style) => {
    const [key, value] = style.split(":").map((s) => s.trim());
    if (key && value) {
      const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      styleObj[camelKey] = value;
    }
  });

  const jsx = Object.entries(styleObj)
    .map(([k, v]) => `${k}: "${v}"`)
    .join(", ");

  return `style={{ ${jsx} }}`;
}
export const removeComponentHtml = (html: string) => {

  const $ = cheerio.load(html, {
    xmlMode: false,
    decodeEntities: false,
  });

  // Remove sidebar/navbar div itself + all children
  $(".custom-sidebar, .custom-navbar").remove();

  return $("body").html() || "";
};

export const extractAndReplaceLayout = (
  html: string,
  className: string,
  placeholder: string
) => {
  const cheerio = require("cheerio");

  const $ = cheerio.load(html, {
    xmlMode: false,
    decodeEntities: false,
  });

  const el = $("." + className);

  if (!el.length) return { html, extracted: null };

  const extracted = $.html(el);

  el.replaceWith(placeholder);

  return {
    html: $("body").html() || "",
    extracted,
  };
};


export const replaceInputsWithCalendar = (htmlContent: any, id: any) => {
  let modifiedHtmlContent = htmlContent;
  const inputRegex = new RegExp(`<input[^>]*id="${id}"[^>]*>`, "g");
  const inputMatch = inputRegex.exec(htmlContent);

  if (inputMatch) {
    const inputElement = inputMatch[0];
    const classNameMatch = inputElement.match(/class=\"([^ \" ]*)\"/);
    const placeholderMatch = inputElement.match(/placeholder=\"([^ \" ]*)\"/);

    const className = classNameMatch ? classNameMatch[1] : "";
    const placeholder = placeholderMatch ? placeholderMatch[1] : "";
    const calendarComponent = `<Calendar className="${className}" placeholder="${placeholder}" />`;

    modifiedHtmlContent = modifiedHtmlContent.replace(
      inputElement,
      calendarComponent
    );
  }
  return modifiedHtmlContent;
};

export const replacePropsWithProduct = async (filePath: any) => {
  try {
    let fileContent = await fs.readFile(filePath, "utf-8");

    fileContent = fileContent.replace(/\bprops\b/g, "product");
    fileContent = fileContent.replace(/product\.(\w+)/g, "{product.$1}");

    await fs.writeFile(filePath, fileContent);
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
  }
};

export function replaceClassNames(htmlContent: any) {
  return htmlContent
    .replace(/\bclass=/g, "className=")
    .replace(/\bclassname=/g, "className=")
    .replace(/<calendar\b([^>]*)>/gi, "<Calendar$1>")
    .replace(/<\/calendar>/gi, "</Calendar>")
    // .replace(/<input([^>]*)>/g, "<input$1 >");
    .replace(/<input([^>]*)>/gi, "<input$1 />");
}

export const replaceProductKeys = (filePath: any) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const updatedFileContent = fileContent.replace(
      /product\.(\w+)/g,
      (match, key) => {
        return `product.${key}()`;
      }
    );

    fs.writeFileSync(filePath, updatedFileContent);
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
  }
};

