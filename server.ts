import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Import custom routers with type annotations
import { router as authRouter, verifyJWT } from './routes/server_keycloak';
////import createAppRouter from './routes/createApp';
import resorceRouter from './routes/Resource';
import enumRouter from './routes/Enum';

// Import new route files
import applicationsRouter from './routes/applications';
import pagesRouter from './routes/pages';
import customComponentsRouter from './routes/customComponents';
import templatesRouter from './routes/templates';
import templatePagesRouter from './routes/templatePages';
import templateResourcesRouter from './routes/templateResources';
import templateEnumsRouter from './routes/templateEnums';

import applicationDecoratorsRouter from './routes/applicationDecorators';
import saveAppRouter from './routes/saveApp';
import setAppContextRouter from './routes/setAppContext';
import saveThenDownloadRouter from './routes/saveThenDownload';
import rootDownloadRouter from './routes/rootDownload';
import generateAppRouter from './routes/generateApp';
import workflowRouter from './routes/workflow';
import workflowNodeRouter from './routes/workflowNode';
import workflowStateRouter from './routes/workflowStateData';
import exportAppRouter from './routes/exportApp';
import importAppRouter from './routes/importApp';

// Import authentication middleware
import { authenticateJWT as authenticateRequest } from './middleware/auth';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import userRoutes from './routes/user.routes';
import ejs from "ejs";
import fs from "fs/promises";
import { PATHS } from './constants/constants';
import { initHasher } from './src/utils/hashUtils';

const theme = new SwaggerTheme();
const swaggerOptions = {
  customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
};

// Extend the Express session interface to include custom properties
declare module 'express-session' {
  interface SessionData {
    accessToken?: string;
    user?: KeycloakUser
  }
}
interface KeycloakUser {
  sub: string;
  email: string;
  preferred_username: string;
  realm_access?: {
    roles: string[];
  };
}
dotenv.config();
// Create the Express application
export const app = express();
// Disable the X-Powered-By header to avoid disclosing the framework/version
app.disable('x-powered-by');

// Define the port
const PORT: number = parseInt(process.env.PORT || '8000', 10);

// Production middleware
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(process.cwd(), 'build')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(process.cwd(), 'build/index.html'));
  });
}

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL, // Change this to your frontend's URL
  credentials: true,
}));

// Middleware setup
app.use(cookieParser());
app.use(session({
  secret: '1234', // Replace with a secure key
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,  // Prevent JavaScript access to session cookie (mitigates XSS session hijacking)
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  }
}));

// JSON parsing middleware
app.use(express.json());
app.use(bodyParser.json());

// --- Authentication Middleware ---
// Protect all /api routes. The /auth routes will not be affected.
app.use('/api', authenticateRequest);

// Route handlers
////app.use('/api', createAppRouter);
app.use('/auth', authRouter);
app.use('/api', resorceRouter);
app.use('/api', enumRouter);

// New route handlers
app.use('/api', applicationsRouter);
app.use('/api', pagesRouter);
app.use('/api', customComponentsRouter);
// app.use('/api', templatesRouter);
// app.use('/api', templatePagesRouter);
// app.use('/api', templateResourcesRouter);
// app.use('/api', templateEnumsRouter);
// Load user routes
app.use('/api/users', userRoutes);
app.use('/api', applicationDecoratorsRouter);
app.use('/api', saveAppRouter);
app.use('/api', setAppContextRouter);
app.use('/api', saveThenDownloadRouter);
app.use('/api', rootDownloadRouter);
app.use('/api', generateAppRouter);
app.use('/api', workflowRouter);
app.use('/api', workflowNodeRouter);
app.use('/api', workflowStateRouter);
app.use('/api', exportAppRouter);
app.use('/api', importAppRouter);


app.get('/test', (req: Request, res: Response) => {
  res.status(200).send('Test route works!');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));


// Get access token endpoint
app.get('/api/get-token', (req: Request, res: Response) => {
  const accessToken = req.session.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token found.' });
  }
  res.json({ accessToken });
});

// Dashboard endpoint with JWT verification
app.get('/dashboard', authenticateRequest, (req: Request, res: Response) => {
  // After authentication, the user object is available in req.user from the middleware
  const access_token = (req as any).user;
  console.log('user:', access_token);

  if (!access_token) {
    // This check is somewhat redundant as the middleware would have already caught it
    return res.redirect('/auth/login');
  }

  const user_Id = access_token.sub;

  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});


export const getOperationTemplate = async (operation: string, data: any) => {
  const filePath = path.join(__dirname, "templates", "crud", `${path.basename(String(operation))}.ejs`);
  return await ejs.renderFile(filePath, data);
};


export const getTemplateForEdit = async (component: any, data: any) => {
  const filePath = path.join(__dirname, "templates", "components", "edit", `${path.basename(String(component))}.ejs`);
  return await ejs.renderFile(filePath, data);
};
export const getTemplate = async (component: any, data: any) => {
  console.log("component name in server for template", component);
  const filePath = path.join(__dirname, "templates", "components", `${path.basename(String(component))}.ejs`);
  return await ejs.renderFile(filePath, data, {
    // Keep JSX formatting intact
    // rmWhitespace: false,
    // escape: (str) => str,   // IMPORTANT: Disable EJS escaping
  });
};
export const getTemplateForCollection = async (component: any, data: any) => {
  console.log("component name in server for template", component);
  const filePath = path.join(__dirname, "templates", "components", "collections", `${path.basename(String(component))}.ejs`);
  return await ejs.renderFile(filePath, data, {
    // Keep JSX formatting intact
    // rmWhitespace: false,
    // escape: (str) => str,   // IMPORTANT: Disable EJS escaping
  });
};
export const getResourceServiceTemplate = async (component: any, data: any) => {
  const filePath = path.join(__dirname, "templates", "services", `${path.basename(String(component))}.ejs`);
  return await ejs.renderFile(filePath, data);
};
export const getResourceViewModelTemplate = async (component: any, data: any) => {
  const filePath = path.join(__dirname, "templates", "viewModels", `${path.basename(String(component))}.ejs`);
  return await ejs.renderFile(filePath, data);
};


export const getCustomViewTemplate = async (viewType: string) => {
  const filePath = path.join(__dirname, "templates", "customViews", `${path.basename(String(viewType))}.ejs`);
  return await ejs.renderFile(filePath, {});
}

export const getResourceModelTemplate = async (component: any, data: any) => {
  const filePath = path.join(__dirname, "templates", "models", `${path.basename(String(component))}.ejs`);
  return await ejs.renderFile(filePath, data);
}
export const getCardComponentTemplate = async (data: any) => {
  // Path: templates/components/Card.ejs
  const filePath = path.join(__dirname, PATHS.TEMPLATES, PATHS.COMPONENTS, "Card.ejs");
  return await ejs.renderFile(filePath, data);
};

let server: import('http').Server;

export const startServer = async (port = PORT) => {
  await initHasher();
  server = app.listen(port, () => {
    console.log(`Server Connected at Port ${port}`);
  });
  return server;
};

export const closeServer = () => {
  if (server) {
    server.close();
  }
};

// Start the server only if the file is run directly
if (require.main === module) {
  startServer();
}

// Global error handler - must be the last middleware
app.use(errorHandler);