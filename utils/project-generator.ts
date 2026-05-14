import {
  API_CONFIG_CONTENT,
  APIMETHODS,
  ENV_FILE_CONTENT,
  FILE_NAMES,
  PATHS,
  REGEX,
  STRINGS,
} from "../constants/constants";
import path from "path";
import fs from "fs-extra";
import {
  applicationService,
  pageService,
  resourceService,
  workflowService,
} from "../services";
import { createAndDownloadZip } from "./zipanddownload";
import { mapFieldsToObject } from "./utils";
import {
  copyLoginPages,
  createProjectDirectory,
  updateAppJs,
  updateLoginTsx,
  updateRegistrationTsx,
  createHookFile,
  createHookTableFile,
} from "./file";
import {
  createCssFile,
  extractCardHtml,
  removeCardHtml,
  replaceClassnameWithClassName,
  replaceInputsWithCalendar,
  transformHtmlForCreate,
  transformHtmlForEdit,
  replacePropsWithProduct,
  replaceProductKeys,
  replaceClassNames,
  removeComponentHtml,
  extractAndReplaceLayout,
  createCssFileForNavSidebar,
} from "./html";
import RASPUIPage from "../models/RASPUIPage";
import {
  getCardComponentTemplate,
  getOperationTemplate,
  getResourceModelTemplate,
  getResourceServiceTemplate,
  getResourceViewModelTemplate,
  getTemplate,
  getTemplateForCollection,
} from "../server";
import * as cheerio from "cheerio";
import ejs from "ejs";
import { JsonValue } from "@prisma/client/runtime/library";
import SelectedNavbar from "../models/SelectedNavbar";
export const createResourceServiceFile = async (
  projectDir: any,
  resName: any
) => {
  const servicesDirPath = path.join(projectDir, PATHS.SRC, PATHS.SERVICES);
  const serviceFileName = `${resName}Service.ts`;
  const serviceFilePath = path.join(servicesDirPath, serviceFileName);
  if (!fs.existsSync(servicesDirPath)) {
    fs.mkdirSync(servicesDirPath);
  }
  const serviceFileContent = await getResourceServiceTemplate("service", {
    resourceName: resName,
  });
  fs.writeFileSync(serviceFilePath, serviceFileContent, "utf8");
};
export const createResourceViewModelFile = async (
  projectDir: any,
  resName: any
) => {
  const modelDirPath = path.join(projectDir, PATHS.SRC, PATHS.VIEW_MODELS);
  const modelFileName = `use${resName}ViewModel.ts`;
  const modelFilePath = path.join(modelDirPath, modelFileName);
  if (!fs.existsSync(modelDirPath)) {
    fs.mkdirSync(modelDirPath);
  }
  const modelFileContent = await getResourceViewModelTemplate(
    "useRaspDataViewModel",
    { resourceName: resName }
  );
  fs.writeFileSync(modelFilePath, modelFileContent, "utf8");
};

export const createModelFileForResource = async (
  projectDir: string,
  resourceName: string,
  api: string,
  applicationId: string
) => {
  const modelDirPath = path.join(projectDir, PATHS.SRC, PATHS.MODELS);
  const modelFileName = `${resourceName}Model.ts`;
  const modelFilePath = path.join(modelDirPath, modelFileName);
  console.log("api name while downloading", api);
  if (!fs.existsSync(modelDirPath)) {
    fs.mkdirSync(modelDirPath, { recursive: true });
  }

  const resData = await resourceService.getResourcesByApplicationId(
    applicationId
  );

  const resName: any = resData.find(
    (res) => res.resourceName === resourceName
  );
  if (!resName) {
    throw new Error("Resource not found");
  }

  const resourceDef = resName.attributes.fieldValues;
  const sample = mapFieldsToObject(resourceDef);

  if (typeof sample !== "object" || sample === null) {
    throw new Error("Invalid data format: expected object inside array.");
  }
  console.log("apiStrData while downloading", sample);

  const keys = Object.keys(sample);
  const className = resourceName + "Model"; // Example: StudentModel


  const classContent = await getResourceModelTemplate("model", { className: className, keys: keys })

  // Write the generated class to a file
  fs.writeFileSync(modelFilePath, classContent, "utf8");
};
// const createCollectionTemplateFile = async (
//   projectDir: any,
//   componentName: any,
//   apiName: any,
//   viewMode: string,
//   attrMapJson: any,
//   collectionCount: any
// ) => {
//   const collectionDirPath = path.join(projectDir, PATHS.SRC, PATHS.COLLECTIONS);
//   const collectionFileName = `${viewMode}Collection${collectionCount}.tsx`;
//   const collectionFilePath = path.join(collectionDirPath, collectionFileName);

//   if (!fs.existsSync(collectionDirPath)) {
//     fs.mkdirSync(collectionDirPath);
//   }

//   const collectionContent = await getTemplate("Collection", {
//     componentName: componentName,
//     apiName: apiName,
//     viewMode: viewMode,
//     attrMap: attrMapJson,
//     collectionCount: collectionCount,
//   });

//   fs.writeFileSync(collectionFilePath, collectionContent, "utf8");
// };



const createCollectionForReadResource = async (
  projectDir: string,
  componentName: string,
  resourceName: string,
  attrMapJson: any,
  collectionCount: number,
  viewMode?: string,
) => {
  const collectionDirPath = path.join(
    projectDir,
    PATHS.SRC,
    PATHS.COLLECTIONS
  );

  if (!fs.existsSync(collectionDirPath)) {
    fs.mkdirSync(collectionDirPath);
  }

  // ---- Naming (no overwrite) ----
  const collectionComponentName = `${viewMode}Collection${resourceName}${collectionCount}`;
  const collectionFileName = `${collectionComponentName}.tsx`;
  const collectionFilePath = path.join(
    collectionDirPath,
    collectionFileName
  );
  console.log("viewmode inside collection creation", viewMode);
  // ---- Render correct EJS ----
  const collectionContent = await getTemplateForCollection(
    viewMode,
    {
      componentName,
      resourceName,
      apiName: resourceName,
      attrMap: attrMapJson,
      collectionComponentName
    }
  );

  fs.writeFileSync(collectionFilePath, collectionContent, "utf8");

  // ---- Return metadata for Read.ejs ----
  return {
    fileName: collectionComponentName
  };
};

const createTableFile = async (
  projectDir: any,
  componentName: any,
  tableCount: any
) => {
  const tableDirPath = path.join(projectDir, PATHS.SRC, PATHS.TABLES);
  const tableFileName = `${componentName}${tableCount}Table.tsx`;
  const tableFilePath = path.join(tableDirPath, tableFileName);

  if (!fs.existsSync(tableDirPath)) {
    fs.mkdirSync(tableDirPath);
  }

  const tableContent = await getTemplate("Aggrid", {
    componentName: componentName,
    tableCount: tableCount,
  });

  fs.writeFileSync(tableFilePath, tableContent, "utf8");
};
const createComponent = async (
  projectDir: any,
  html: any,
  componentName: any

) => {
  let dir = ''
  if (componentName === 'SelectedNavbar') {

    dir = path.join(
      projectDir,
      PATHS.SRC,
      PATHS.COMPONENTS,
      "Navbar"
    );
  }
  if (componentName === 'SelectedSidebar') {
    dir = path.join(
      projectDir,
      PATHS.SRC,
      PATHS.COMPONENTS,
      "Sidebar"
    );

  }

  // Create Navbar folder
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fileName = `${componentName}.tsx`

  // Navbar file INSIDE folder
  const filePath = path.join(dir, fileName);
  let cleanedHtml = replaceClassNames(html);

  const componentContent = await getTemplate(`NavSideReactComponent`, {
    html: cleanedHtml,
    componentName: componentName
  })
  console.log("component to be added to bar", componentName, componentContent);


  fs.writeFileSync(filePath, componentContent);
};

const resourceComponent = async (
  projectDir: any,
  resourceName: any,
  componentPath: any,
  op: string,
  updatedHtmlForCreate: any,
  apiName: any,
  viewMode?: string,
  attrMapJSON?: any,
  readCollectionMeta?: {
    fileName: string;
  }
) => {
  const resourceDirPath = path.join(projectDir, PATHS.SRC, PATHS.COMPONENTS, PATHS.RESOURCE);
  if (!fs.existsSync(resourceDirPath)) {
    fs.mkdirSync(resourceDirPath);

  }
  if (op === "Create") {
    const renderedTemplate = await getOperationTemplate(op, {
      operation: op,
      resourceName: resourceName,
      updatedHtmlContentForCreate: updatedHtmlForCreate,
      apiName: apiName,
    });
    const resourceComponent = `${renderedTemplate}`;
    fs.writeFileSync(componentPath, resourceComponent);
  } else if (op === "Read") {
    const renderedTemplate = await getOperationTemplate("Read", {
      operation: op,
      resourceName: resourceName,
      apiName: apiName,
      viewMode: viewMode,
      attrMap: attrMapJSON,
      collectionComponentName: readCollectionMeta?.fileName,
    });
    const resourceComponent = `${renderedTemplate}`;
    fs.writeFileSync(componentPath, resourceComponent);
  }



};

const editComponent = async (
  projectDir: string,
  resourceName: string,
  updatedHtmlForEdit: string
) => {
  const fileName = `${resourceName}Edit.tsx`;
  const componentPath = path.join(
    projectDir,
    PATHS.SRC,
    PATHS.COMPONENTS,
    PATHS.EDIT,
    fileName
  );

  const renderedTemplate = await getOperationTemplate("Edit", {
    resourceName: resourceName,
    updatedHtmlContentForEdit: updatedHtmlForEdit,
  });

  await fs.outputFile(componentPath, renderedTemplate);
};

export const generateFrontendProject = async (
  applicationId: string,
  loginPageId: string
): Promise<string> => {
  const createResourceHtmlMap = new Map();

  try {
    const App = await applicationService.getApplicationById(applicationId);

    if (!App) {
      throw new Error("Application not found");
    }

    const ApplicationPages = await pageService.getPagesByApplicationId(App.id);
    const workflows = await workflowService.getWorkflowsByApplicationId(App.id);
    const generateWorkflowIds: string[] = workflows.map((wf) => wf.generatedWorkflowIds).flatMap((ids) => Array.isArray(ids) ? ids : [ids]).map(String);


    const project = App.id;

    const projectDir = path.join(
      __dirname,
      "..",
      PATHS.REACT_APPS,
      project
    );

    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true });
    }

    await createProjectDirectory(projectDir);

    const envFileContent = ENV_FILE_CONTENT(
      3001,
      process.env.FRONTEND_URL,
      process.env.GENERATOR_URL,
      JSON.stringify(generateWorkflowIds),
      process.env.GENERATED_WORKFLOW_URL
    );
    await fs.outputFile(
      path.join(projectDir, FILE_NAMES.ENV),
      envFileContent
    );

    const apiConfigPath = path.join(
      projectDir,
      PATHS.SRC,
      PATHS.CONFIG,
      PATHS.API_CONFIG
    );
    await fs.outputFile(apiConfigPath, API_CONFIG_CONTENT);


    const allResources = await resourceService.getResourcesByApplicationId(
      App.id
    );
    if (allResources.length === 0) {
      const resourceFilesToDelete = [
        path.join(projectDir, PATHS.SRC, PATHS.APIS, PATHS.META_TS),
        path.join(projectDir, PATHS.SRC, PATHS.APIS, PATHS.RESOURCES_TS),
        path.join(projectDir, PATHS.SRC, PATHS.APIS, PATHS.ENUM_TS),
        path.join(projectDir, PATHS.SRC, PATHS.HOOKS, PATHS.USE_META_DATA_TS),
      ];
      for (const filePath of resourceFilesToDelete) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    const packageJsonPath = path.join(projectDir, FILE_NAMES.PACKAGE_JSON);
    const packageJsonContent = await fs.readJson(packageJsonPath);

    const sanitizedAppName = App.id.toLowerCase().replace(/\s+/g, "-");
    packageJsonContent.name = sanitizedAppName;
    packageJsonContent.dependencies.bootstrap = "^5.3.3";

    await fs.writeJson(packageJsonPath, packageJsonContent, { spaces: 2 });

    const appJsPath = path.join(projectDir, PATHS.SRC, PATHS.APP_JS);
    let appJsContent = await fs.readFile(appJsPath, "utf-8");
    if (!appJsContent.includes(STRINGS.BOOTSTRAP_CSS)) {
      appJsContent = `import '${STRINGS.BOOTSTRAP_CSS}';
${appJsContent}`;
      await fs.writeFile(appJsPath, appJsContent);
    }

    await copyLoginPages(projectDir);
    await updateRegistrationTsx(projectDir);
    await updateLoginTsx(projectDir, loginPageId);

    const pages = ApplicationPages;
    const editComponents: { name: string; resourceName: string }[] = [];
    const allPagesData: any[] = [];

    for (const pageData of pages) {
      const pageObj = new RASPUIPage();
      pageObj.setName(pageData.pageName);

      const pageName = pageData.pageName;
      const pageContent = pageData.pageContent as any;
      const dataWithMapsAndUIItems = pageObj.deserializeForDownload(pageContent);

      var htmlContent = pageObj.getHtml("root");

      const cssData = Object.fromEntries(dataWithMapsAndUIItems.styleMap);
      console.log("css data in download", cssData);
      const componentName =
        pageData.pageName.charAt(0).toUpperCase() + pageData.pageName.slice(1);

      const cssImportPath = await createCssFile(
        cssData,
        componentName,
        projectDir
      );

      let fileContent = `
          import React, { useState, useEffect } from 'react';
           import { useNavigate } from 'react-router-dom';
            import { logout } from '../apis/backend';
          import "${cssImportPath}";
          `;

      let cardCount = 0;
      let tableCount = 0;
      const functionArray: any[] = [];
      let collectionCount = 0;

      const apis = dataWithMapsAndUIItems.apisMap;
      const componentMap = dataWithMapsAndUIItems.compsMap;
      const resourceMap = dataWithMapsAndUIItems.resourceMap;
      const operationMap = dataWithMapsAndUIItems.operationMap;
      const attributeMap = dataWithMapsAndUIItems.attrMapp;
      const viewModeMap = dataWithMapsAndUIItems.viewModeMap;
      let pageOperation = "";
      let pageResourceName = "";

      let hasNavbar = false;
      let hasSidebar = false;
      console.log("my page obj in project generator", pageObj.getPageUIItems());
      console.log("attribute map", attributeMap);
      for (const item of componentMap) {
        console.log("component map in project generator", item[0], item[1]);
        const value = item[1];
        if (value === "selectedNavbar") {
          const res = extractAndReplaceLayout(
            htmlContent,
            "custom-navbar",
            "__SELECTEDNAVBAR__"
          );

          if (res.extracted) {
            await createComponent(projectDir, res.extracted, "SelectedNavbar");
            const cssImportPathForNavSidebar = await createCssFileForNavSidebar(
              cssData,
              componentName,
              projectDir,
              "Navbar"
            );
            fileContent += `import SelectedNavbar from "./Navbar/SelectedNavbar";`;
            htmlContent = res.html;
            hasNavbar = true;
          }
        }
        else if (value === "selectedSidebar") {
          const res = extractAndReplaceLayout(
            htmlContent,
            "custom-sidebar",
            "__SELECTEDSIDEBAR__"
          );

          if (res.extracted) {
            await createComponent(projectDir, res.extracted, "SelectedSidebar");
            const cssImportPathForNavSidebar = await createCssFileForNavSidebar(
              cssData,
              componentName,
              projectDir,
              "Sidebar"
            );
            fileContent += `import SelectedSidebar from "./Sidebar/SelectedSidebar"; `;
            htmlContent = res.html;
            hasSidebar = true;
          }
        }
        else if (value === STRINGS.CALENDAR) {
          fileContent += `import Calendar from "./Calendar/Calendar";`;
          htmlContent = replaceInputsWithCalendar(htmlContent, item[0]);
        } else if (value === STRINGS.LISTING_CONTAINER) {
          cardCount += 1;
          const cardName = pageName + "Card" + cardCount;
          const cheerio = require("cheerio");
          const $ = cheerio.load(htmlContent, {
            xmlMode: true,
            decodeEntities: false,
          });
          const outerDiv = $("#" + item[0]);
          const innerDiv = outerDiv.children("div").first();
          const cardHtml = $.html(innerDiv);

          htmlContent = removeCardHtml(htmlContent, item[0]);

          const jsxContent = `{data.map((product, index) => (
                <${cardName} key={index} product={product} />
              ))}`;

          htmlContent = htmlContent.replace(
            STRINGS.PLACEHOLDER_CONTENT,
            jsxContent
          );
          const cardComponentPath = path.join(
            projectDir,
            PATHS.SRC,
            PATHS.COMPONENTS,
            `${cardName}.tsx`
          );
          const cardComponentContent = await getCardComponentTemplate({
            cardName: cardName,
            cssImportPath: cssImportPath,
            cardHtml: cardHtml,
          });

          await fs.outputFile(cardComponentPath, cardComponentContent);
          await replacePropsWithProduct(cardComponentPath);
          await replaceProductKeys(cardComponentPath);
          fileContent += `
                import ${cardName} from "./${cardName}";
                import use${componentName}Hook from '../hooks/use${componentName}Hook';
              `;
          const apiName = apis.get(item[0]);
          await createHookFile(projectDir, componentName, apiName);
          functionArray.push(`const {data} = use${componentName}Hook();`);
        } else if (value === STRINGS.TABLE) {
          tableCount += 1;
          const apiName = apis.get(item[0]);
          htmlContent = removeCardHtml(htmlContent, item[0]);
          await createHookTableFile(
            projectDir,
            componentName,
            apiName,
            tableCount
          );
          await createTableFile(projectDir, componentName, tableCount);
          htmlContent = htmlContent.replace(
            STRINGS.PLACEHOLDER_CONTENT,
            `<${componentName}${tableCount}Table/>`
          );
          fileContent += `
              import ${componentName}${tableCount}Table from '../tables/${componentName}${tableCount}Table';
              `;
        } else if (value === STRINGS.RESOURCE) {
          const resourceName = resourceMap.get(item[0]);

          let attrMapJson = "[]";

          const attrMap = attributeMap.get(item[0]);
          if (attrMap instanceof Map) {
            attrMapJson = JSON.stringify(Array.from(attrMap.entries()));
          }

          const resourceOperationName = operationMap.get(item[0]);
          pageOperation = resourceOperationName;
          pageResourceName = resourceName;
          let apiName = apis.get(item[0]);
          if (!apiName) {
            for (const [originalId, url] of Object.entries(
              pageContent.apis || {}
            )) {
              const resName = pageContent.resource?.[originalId];
              if (resName === resourceName) {
                apiName = url;
                break;
              }
            }
          }
          const $ = cheerio.load(htmlContent, {
            xmlMode: false,
            decodeEntities: false,
          });
          const resourceDiv = $("#" + item[0]);
          let resourceHtmlRaw = $.html(resourceDiv);
          const allResources = await resourceService.getResourcesByApplicationId(
            App.id
          );
          const targetResource = allResources.find(
            (r: any) => r.resourceName.toLowerCase() === resourceName.toLowerCase()
          );
          if (!targetResource) {
            throw new Error(`Resource ${resourceName} not found`);
          }
          let resourceData: any = {};
          try {
            if (typeof targetResource.attributes === "string") {
              resourceData = JSON.parse(targetResource.attributes);
            } else {
              resourceData = targetResource.attributes;
            }
          } catch (err) {
            console.error("Failed to parse attributes JSON:", err);
            resourceData = { fieldValues: [] };
          }

          let updatedHtmlForCreate = "";

          let updatedHtmlForEdit = "";
          await createModelFileForResource(
            projectDir,
            resourceName,
            apiName,
            applicationId
          );
          if (resourceOperationName === STRINGS.CREATE) {
            resourceHtmlRaw = resourceHtmlRaw.replace(REGEX.COMMENTS, "");
            updatedHtmlForCreate = await transformHtmlForCreate(
              resourceHtmlRaw,
              item[0],
              resourceData
            );
            console.log("htmllllllllllllllllll", updatedHtmlForCreate, resourceHtmlRaw);
            createResourceHtmlMap.set(resourceName, {
              html: resourceHtmlRaw,
              containerId: item[0],
            });
          }

          let readCollectionMeta: { fileName: string; } | undefined;
          let viewMode: string | undefined;
          let ComponentFileName = `${resourceOperationName}${resourceName}`;


          if (resourceOperationName === STRINGS.READ) {
            viewMode = viewModeMap.get(item[0]);
            console.log("viewMode for READ resource", viewMode);
            ComponentFileName = `${resourceOperationName}${resourceName}${viewMode}`;
            const editComponentName = `${resourceName}Edit`;

            const createVersion = createResourceHtmlMap.get(resourceName);
            if (createVersion) {
              let resourceHtml = replaceClassnameWithClassName(
                createVersion.html
              );
              resourceHtml = resourceHtml.replace(REGEX.COMMENTS, "");
              updatedHtmlForEdit = await transformHtmlForEdit(
                resourceHtml,
                createVersion.containerId,
                resourceData
              );
              editComponent(projectDir, resourceName, updatedHtmlForEdit);
              editComponents.push({ name: componentName, resourceName: resourceName });
              collectionCount += 1;
              // create a collection file
              readCollectionMeta = await createCollectionForReadResource(
                projectDir,
                componentName,
                resourceName,      // apiName == resourceName 
                attrMapJson,
                collectionCount,
                viewMode,          // TableView | CardView
              );

            } else {
              console.warn(
                `No Create version available for resource: ${resourceName}`
              );
            }
          }
          htmlContent = removeCardHtml(htmlContent, item[0]);

          // const componentPath = path.join(
          //   projectDir,
          //   PATHS.SRC,
          //   PATHS.COMPONENTS,
          //   PATHS.RESOURCE,
          //   `${resourceOperationName}${resourceName}.tsx`
          // );

          // let ComponentFileName = `${resourceOperationName}${resourceName}`;

          // if (resourceOperationName === STRINGS.READ && viewMode) {
          //   ComponentFileName = `${resourceOperationName}${resourceName}${viewMode}`;
          // }

          const componentPath = path.join(
            projectDir,
            PATHS.SRC,
            PATHS.COMPONENTS,
            PATHS.RESOURCE,
            `${ComponentFileName}.tsx`
          );


          resourceComponent(
            projectDir,
            resourceName,
            componentPath,
            resourceOperationName,
            updatedHtmlForCreate,
            apiName,
            viewMode,
            attrMapJson,
            readCollectionMeta

          );


          await createResourceServiceFile(projectDir, resourceName);
          await createResourceViewModelFile(projectDir, resourceName);
          // htmlContent = htmlContent.replace(
          //   STRINGS.PLACEHOLDER_CONTENT || "Add Data in Data Tab",
          //   `<${resourceOperationName}${resourceName}/>`
          // );

          // fileContent += `
          //   import ${resourceOperationName}${resourceName} from './Resource/${resourceOperationName}${resourceName}';
          //   `;
          console.log("htmlContent before", htmlContent);
          if (resourceOperationName === STRINGS.READ && viewMode) {
            htmlContent = htmlContent.replace(
              STRINGS.RESOURCE_CONTENT,
              `<${ComponentFileName} />`
            );
          } if (resourceOperationName === STRINGS.CREATE) {
            htmlContent = htmlContent.replace(
              STRINGS.PLACEHOLDER_CONTENT,
              `<${ComponentFileName} />`
            );
          }

          console.log("htmlContent after", htmlContent);

          fileContent +=
            `import ${ComponentFileName} from './Resource/${ComponentFileName}';
            `;
        }

      }

      htmlContent = replaceClassNames(htmlContent);

      const btnNav = "const navigate = useNavigate();";

      if (hasNavbar) {
        htmlContent = htmlContent.replace("__SELECTEDNAVBAR__", "<SelectedNavbar />");
      }

      if (hasSidebar) {
        htmlContent = htmlContent.replace("__SELECTEDSIDEBAR__", "<SelectedSidebar />");
      }
      //       htmlContent = `
      // ${layoutHeader}
      // ${htmlContent}
      // `;
      functionArray.push(btnNav);

      fileContent += `export default function ${componentName}() { 
            ${functionArray.join(
        "\n\n"
      )} 
  

            return (

              <>
     
              ${htmlContent}

              </>

            );

          }`;

      const componentPath = path.join(
        projectDir,

        PATHS.SRC,

        PATHS.COMPONENTS,

        `${componentName}.tsx`
      );
      await fs.outputFile(componentPath, fileContent);


      allPagesData.push({
        componentName,
        pageName,
        operation: pageOperation,
        resourceName: pageResourceName,
      });
    }

    const loginPageAdded = !!loginPageId;
    await updateAppJs(projectDir, allPagesData, loginPageAdded, editComponents);

    return projectDir; // Return the project directory
  } catch (err) {
    console.error(err);

    throw err; // Re-throw the error for the caller to handle
  }
};

export const generateProject = async (
  applicationId: string,
  loginPageId: string,
  res: any
) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    `${process.env.FRONTEND_URL}`
  );
  res.setHeader("Access-Control-Allow-Methods", `${APIMETHODS.GET}, ${APIMETHODS.POST}, ${APIMETHODS.PUT},${APIMETHODS.DELETE}`);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  try {
    const projectDir = await generateFrontendProject(applicationId, loginPageId);

    const dockerfilesDir = path.join(__dirname, "..", PATHS.DOCKERFILES);
    const filesToAdd = [
      {
        source: path.join(dockerfilesDir, FILE_NAMES.DOCKER_COMPOSE_YML),
        dest: "docker-compose.yml",
      },
      {
        source: path.join(dockerfilesDir, FILE_NAMES.FRONTEND_DOCKERFILE),
        dest: "frontend/Dockerfile",
      },
    ];

    createAndDownloadZip(projectDir, applicationId, res, filesToAdd);
  } catch (err) {
    console.error(err);

    return res.status(500).send("Error processing request");
  }
};

