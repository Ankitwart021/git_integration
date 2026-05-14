import path from "path";
import fs from "fs-extra";
import { getOperationTemplate, getTemplate } from "../server";
import {
  API_CONFIG_CONTENT,
  EJSFILENAMES,

  LOGIN_RETURN_STATEMENT,
  PATHS,
  REGEX,
  STRINGS,
} from "../constants/constants";
import { createCssFile, replaceClassnameWithClassName } from "./html";

const reactAppsDir = path.join(__dirname, "..", PATHS.REACT_APPS);
const baseAppDir = path.join(reactAppsDir, PATHS.BASE_APP);

export const createProjectDirectory = async (projectDir: any) => {
  if (!fs.existsSync(projectDir)) {
    await fs.copy(baseAppDir, projectDir, {
      filter: (src) => !src.includes("src/components/Login/Login"),
    });
  }
};

export const copyLoginPages = async (projectDir: any) => {
  const loginDirSource = path.join(baseAppDir, PATHS.SRC, PATHS.COMPONENTS, PATHS.LOGIN);
  const loginDirDestination = path.join(
    projectDir,
    PATHS.SRC,
    PATHS.COMPONENTS,
    PATHS.LOGIN
  );

  await fs.ensureDir(loginDirDestination);
  await fs.copy(loginDirSource, loginDirDestination);
};

export const updateRegistrationTsx = async (projectDir: any) => {
  const registrationTsxPath = path.join(
    projectDir,
    PATHS.SRC,
    PATHS.COMPONENTS,
    PATHS.REGISTRATION,
    "Registration.tsx"
  );
  let registrationTsxContent = await fs.readFile(registrationTsxPath, "utf-8");

  await fs.writeFile(registrationTsxPath, registrationTsxContent);
};

export const updateLoginTsx = async (projectDir: any, loginPageId: any) => {
  const loginTsxPath = path.join(
    projectDir,
    PATHS.SRC,
    PATHS.COMPONENTS,
    PATHS.LOGIN,
    "Login.tsx"
  );
  let loginTsxContent = await fs.readFile(loginTsxPath, "utf-8");

  const returnStatement = LOGIN_RETURN_STATEMENT(loginPageId);

  loginTsxContent = loginTsxContent.replace(
    REGEX.RETURN_STATEMENT,
    returnStatement
  );

  await fs.writeFile(loginTsxPath, loginTsxContent);
};

export const updateAppJs = async (
  projectDir: any,
  pages: { componentName: string; pageName: string }[],
  loginPageAdded: any,
  editComponents: { name: string; resourceName: string }[]
) => {
  const appJsPath = path.join(projectDir, PATHS.SRC, "App.js");
  let appJsContent = await fs.readFile(appJsPath, "utf-8");
  const routesClosingTag = "</Routes>";

  if (pages) {
    for (const page of pages) {
      const importStatement = `import ${page.componentName} from "./components/${page.componentName}";\n`;
      if (!appJsContent.includes(importStatement)) {
        appJsContent = importStatement + appJsContent;
      }

      const routeStatement = `<Route path='/${page.pageName.toLowerCase()}' element={<${page.componentName} />} />`;
      if (!appJsContent.includes(routeStatement)) {
        appJsContent = appJsContent.replace(
          routesClosingTag,
          `  ${routeStatement}\n${routesClosingTag}`
        );
      }
    }
  }

  const registrationComponentName = STRINGS.REGISTRATION_COMPONENT_NAME;
  const registrationImportStatement = `import ${registrationComponentName} from "./components/Registration/Registration";\n`;
  if (!appJsContent.includes(registrationImportStatement)) {
    appJsContent = registrationImportStatement + appJsContent;
  }

  const registrationRouteStatement = `<Route path='/registration' element={<${registrationComponentName} />}/>`;
  if (!appJsContent.includes(registrationRouteStatement)) {
    appJsContent = appJsContent.replace(
      routesClosingTag,
      `  ${registrationRouteStatement}\n${routesClosingTag}`
    );
  }

  if (loginPageAdded) {
    const loginComponentName = STRINGS.LOGIN_COMPONENT_NAME;
    const loginImportStatement = `import ${loginComponentName} from "./components/Login/Login";\n`;
    if (!appJsContent.includes(loginImportStatement)) {
      appJsContent = loginImportStatement + appJsContent;
    }

    const loginRouteStatement = `<Route path='/login' element={<${loginComponentName} />}/>`;
    if (!appJsContent.includes(loginRouteStatement)) {
      appJsContent = appJsContent.replace(
        routesClosingTag,
        `  ${loginRouteStatement}\n${routesClosingTag}`
      );
    }
  }

  console.log("edit components in route", editComponents)
  for (const editComp of editComponents) {
    const importEdit = `import ${editComp.resourceName}Edit from "./components/Edit/${editComp.resourceName}Edit";\n`;
    // const importEdit = `import ${editComp.name} from "./components/Edit/${editComp.name}";\n`;
    const routeEdit = `<Route path='/edit/${editComp.resourceName.toLowerCase()}/:id' element={<${editComp.resourceName}Edit />} />`;

    if (!appJsContent.includes(importEdit)) {
      appJsContent = importEdit + appJsContent;
    }

    if (!appJsContent.includes(routeEdit)) {
      appJsContent = appJsContent.replace(
        routesClosingTag,
        `  ${routeEdit}\n  ${routesClosingTag}`
      );
    }
  }

  await fs.writeFile(appJsPath, appJsContent);
};
export const generatePageComponent = async (
  pageData: any,
  projectDir: string,
  isFromDb: boolean
) => {
  const componentName = isFromDb ? pageData.pageName : pageData.name;
  const pageContent = isFromDb ? (pageData.pageContent as any) : pageData;

  // 1. Create CSS file
  const cssPath = await createCssFile(
    pageContent.styles,
    componentName,
    projectDir
  );

  // 2. Create Component file (.tsx)
  let componentContent;
  const templateData = {
    componentName: componentName,
    resource: pageContent.resource,
    apis: pageContent.apis,
    html: replaceClassnameWithClassName(pageContent.html),
  };

  if (pageContent.operation) {
    componentContent = await getOperationTemplate(
      pageContent.operation,
      templateData
    );
  } else if (pageContent.component) {
    componentContent = await getTemplate(pageContent.component, templateData);
  } else {
    componentContent = await getTemplate("React-component", {
      componentName,
      cssPath,
      templateData,
    })
  }
  const componentPath = path.join(
    projectDir,
    PATHS.SRC,
    PATHS.COMPONENTS,
    `${componentName}.tsx`
  );
  await fs.outputFile(componentPath, componentContent);

  return {
    componentName,
    pageName: componentName,
    operation: pageContent.operation,
    resourceName: pageContent.resource?.name,
  };
};


export const createHookFile = async (
  projectDir: any,
  componentName: any,
  apiName: any
) => {
  const hooksDirPath = path.join(projectDir, PATHS.SRC, PATHS.HOOKS);
  const hookFileName = `use${componentName}Hook.ts`;
  const hookFilePath = path.join(hooksDirPath, hookFileName);

  if (!fs.existsSync(hooksDirPath)) {
    fs.mkdirSync(hooksDirPath);
  }
  const hookFileContent = await getTemplate(EJSFILENAMES.FILEHOOK, {
    componentName: componentName,
    apiName: apiName,
  });
  fs.writeFileSync(hookFilePath, hookFileContent, "utf8");
};

export const createHookTableFile = async (
  projectDir: any,
  componentName: any,
  apiName: any,
  tableCount: any
) => {
  const hooksDirPath = path.join(projectDir, PATHS.SRC, PATHS.HOOKS);
  const hookFileName = `use${componentName}${tableCount}Hook.ts`;
  const hookFilePath = path.join(hooksDirPath, hookFileName);

  if (!fs.existsSync(hooksDirPath)) {
    fs.mkdirSync(hooksDirPath);
  }
  const hookFileContent = await getTemplate(EJSFILENAMES.TABLEHOOK, {
    componentName: componentName,
    apiName: apiName,
    tableCount: tableCount,
  });
  fs.writeFileSync(hookFilePath, hookFileContent, "utf8");
};
