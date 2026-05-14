import swaggerJsdoc from 'swagger-jsdoc';
import apiConfig from "./apiConfig";


const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RASP-FE Designer Backend API',
      version: '1.0.0',
      description: 'API documentation for the RASP-FE Designer Backend',
    },
    servers: [
      {
        url: apiConfig.API_BASE_URL, // You can change this to your server's URL
      },
    ],
    security: [{
      bearerAuth: []
    }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './routes/applications.ts',
    './routes/customComponents.ts',
    './routes/Enum.ts',
    './routes/pages.ts',
    './routes/Resource.ts',
    './routes/saveApp.ts',
    './routes/setAppContext.ts',
    // './routes/server_keycloak.ts',
    // './routes/templateEnums.ts',
    // './routes/templatePages.ts',
    // './routes/templateResources.ts',
    // './routes/templates.ts',
    './routes/saveThenDownload.ts',
    './routes/rootDownload.ts',
    './routes/generateApp.ts',
    
  ], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
