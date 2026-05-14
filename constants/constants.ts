import { JsonValue } from "@prisma/client/runtime/library";

export const PATHS = {
  REACT_APPS: "React Apps",
  BASE_APP: "Base App",
  SRC: "src",
  COMPONENTS: "components",
  LOGIN: "Login",
  REGISTRATION: "Registration",
  APP_JS: "App.js",
  EDIT: "edit",
  RESOURCE: "Resource",
  SERVICES: "services",
  VIEW_MODELS: "viewModels",
  MODELS: "models",
  HOOKS: "hooks",
  COLLECTIONS: "collections",
  TABLES: "tables",
  DOCKERFILES: "dockerfiles",
  CONFIG: "config",
  API_CONFIG: "apiConfig.ts",
  APIS: "apis",
  META_TS: "meta.ts",
  RESOURCES_TS: "resources.ts",
  ENUM_TS: "enum.ts",
  USE_META_DATA_TS: "useMetaData.ts",
  TEMPLATES:"templates"
};

export const APIMETHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE"
};

export const FILE_NAMES = {
  LOGIN_TSX: "Login.tsx",
  REGISTRATION_TSX: "Registration.tsx",
  PACKAGE_JSON: "package.json",
  ENV: ".env",
  DOCKER_COMPOSE_YML: 'docker-compose.yml',
  FRONTEND_DOCKERFILE: 'frontend.Dockerfile'
};

export const STRINGS = {
  PLACEHOLDER_CONTENT: "PLACEHOLDERCONTENT",
  RESOURCE_CONTENT:"<div>Add Data in Data Tab</div>",
  RAW_ONCLICK_HANDLE_CREATE: "__RAW_ONCLICK_HANDLECREATE__",
  ON_CLICK_HANDLE_CREATE: 'onClick={handleCreate}',
  RAW_ONCLICK_HANDLE_UPDATE: "__RAW_ONCLICK_HANDLEUPDATE__",
  ON_CLICK_HANDLE_UPDATE: 'onClick={(e) => handleUpdate(id,e)}',
  SUBMIT: "submit",
  READ: "Read",
  CREATE: "Create",
  EDIT: "Edit",
  LOGIN_COMPONENT_NAME: "Login",
  REGISTRATION_COMPONENT_NAME: "Registration",
  BOOTSTRAP_CSS: "bootstrap/dist/css/bootstrap.min.css",
  CALENDAR: "calendar",
  LISTING_CONTAINER: "listingContainer",
  TABLE: "table",
  RESOURCE: "resource",
  COLLECTION: "collection"
};
export const EJSFILENAMES ={


    AGGRID : "Aggrid",
    TABLEHOOK:"Tablehook",
    FILEHOOK:"Filehook",
    INPUT:"Input",
    ENUMDROPDOWN:"Enum-dropdown",
    FILEINPUT:"File-input",
    FOREIGNKEYDROPDOWN:"ForeignKey-dropdown",
    BOOLEANDROPDOWN:"Boolean-dropdown"

  


}
export const REGEX = {
  CLASSNAME_REPLACE: /classname="/g,
  RETURN_STATEMENT: /return\s*\([\s\S]*?\);/,
  PROPS_REPLACE: /\bprops\b/g,
  PRODUCT_REPLACE: /product\.(\w+)/g,
  CLASS_REPLACE: /\bclass=/g,
  CALENDAR_TAG: /<calendar\b([^>]*)>/gi,
  CALENDAR_CLOSING_TAG: /<\/calendar>/gi,
  INPUT_TAG: /<input([^>]*)>/g,
  COMMENTS: /<!--.*?-->/g,
  CUSTOM_VIEW_CARD_CONTAINER: /<div class(?:Name)?="custom-view-card-container">[\s\S]*?<\/div>\s*<\/div>/,
};

export const API_CONFIG_CONTENT = `const apiConfig = {
    WORKFLOW_IDS: (() => {
        try {
          return process.env.REACT_APP_GENERATED_WORKFLOW_IDS
            ? JSON.parse(process.env.REACT_APP_GENERATED_WORKFLOW_IDS)
            : [];
        } catch (e) {
          console.error("Invalid WORKFLOW IDS env format", e);
          return [];
        }
      })(),
    // This is the base URL for the Workflow Backend
    WORKFLOW_BASE_URL: process.env.REACT_APP_GENERATED_WORKFLOW_URL || "http://localhost:9000/api",
    // This is the base URL for the Designer Backend (for metadata)
    API_BASE_URL: process.env.REACT_APP_GENERATED_BACKEND_URL,
    // This function should point to the generated backend\\'s data endpoint for a resource
    getResourceUrl: (resourceName: string) => process.env.REACT_APP_GENERATED_BACKEND_URL + "/" + resourceName.toLowerCase(),
    // This function should point to the Designer Backend\\'s metadata endpoint for a resource
    getResourceMetaDataUrl: (resourceName: string) => process.env.REACT_APP_GENERATED_BACKEND_URL + "/getAllResourceMetaData/" + resourceName.toLowerCase(),
};
export default apiConfig;`;


export const ENV_FILE_CONTENT = (port: number, frontendUrl: string | undefined, generatorUrl: string | undefined, generateWorkflowIds: string, workflowUrl: string|undefined) => `PORT=${port}\nREACT_APP_API_BASE_URL=${frontendUrl}/api\nREACT_APP_GENERATED_BACKEND_URL=${generatorUrl}\nREACT_APP_GENERATED_WORKFLOW_IDS=${generateWorkflowIds}\nREACT_APP_GENERATED_WORKFLOW_URL=${workflowUrl}`;

export const LOGIN_RETURN_STATEMENT = (loginPageId: any) => `
    return (
      <Login${loginPageId} 
        formData={formData} 
        setFormData={setFormData} 
        error={error} 
        setError={setError} 
        handleSubmit={handleSubmit} 
        isEmailValid={isEmailValid} 
        isPasswordValid={isPasswordValid} 
      />
    );
  `;