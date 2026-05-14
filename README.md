# RASP-FE Designer Backend

This project is the backend for the RASP-FE designer. It is a Node.js application written in TypeScript that uses Express.js for the server and Prisma as the ORM for interacting with a MySQL database.

## Folder Structure

| Folder | Description |
| --- | --- |
| `api` | Contains the API endpoint definitions for the application. Each file corresponds to a different resource. |
| `config` | Contains configuration files for the application, such as API configuration and Swagger documentation. |
| `dist` | Contains the compiled JavaScript code that is generated from the TypeScript source code. |
| `hooks` | Contains custom React hooks that are used in the application. |
| `middleware` | Contains middleware functions for the Express.js application, such as authentication. |
| `models` | Contains the data models for the application. These are TypeScript classes that define the structure of the data that is used in the application. |
| `node_modules` | Contains the third-party libraries that are used in the project. |
| `prisma` | Contains the Prisma schema file and the database migrations. |
| `React Apps` | Contains the source code for the React front-end application. |
| `repository` | Contains the data access layer for the application. The repository classes are responsible for interacting with the database. |
| `routes` | Contains the Express.js routes for the application. |
| `services` | Contains the business logic for the application. The service classes are responsible for handling the application's logic and for calling the repository classes. |
| `src` | Contains utility files for the project. |
| `templates` | Contains EJS templates that are used to generate code. |
| `tests` | Contains the tests for the application. |
| `utils` | Contains utility functions that are used throughout the application. |

## Environment Variables

The `.env` file contains the following environment variables:

| Variable | Description | Example Value |
| --- | --- | --- |
| `DATABASE_URL` | The connection string for the MySQL database. | `mysql://root:root@localhost:3306/visual_app_design` |
| `KEYCLOAK_URL` | The URL of the Keycloak server. | `http://localhost:4000` |
| `REALM` | The Keycloak realm to use for authentication. | `myRealm` |
| `CLIENT_ID` | The Keycloak client ID to use for authentication. | `myClient` |
| `CLIENT_SECRET` | The Keycloak client secret to use for authentication. | `TkzLVEIWoZ6uqTwWZEVx4Q7KEO6Mn1BR` |
| `REDIRECT_URI` | The redirect URI to use for Keycloak authentication. | `http://localhost:8000/auth/callback` |
| `FRONTEND_PORT` | The port that the front-end application is running on. | `3000` |
| `FRONTEND_URL` | The URL of the front-end application. | `http://localhost:3000` |
| `SERVER_HOSTNAME` | The hostname of the backend server. | `localhost` |
| `SERVER_PORT` | The port that the backend server is running on. | `8000` |
| `GENERATOR_URL` | The URL of the code generator service. | `http://localhost:8082` |
| `TEST_AUTH_TOKEN` | A test authentication token for testing purposes. | `eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4eUY1cW14ZXpleVo4WEpsU3NrRGQ1SEUyUmJ2eXl2ZHpndkVoVXB5ZTBFIn0...` |
| `REACT_APP_API_PROTOCOL` | The protocol to use for the API. | `http` |
| `REACT_APP_API_HOSTNAME` | The hostname of the API. | `localhost` |
| `REACT_APP_API_PORT` | The port of the API. | `8000` |
| `REACT_APP_API_VERSION` | The version of the API. | `v1` |
