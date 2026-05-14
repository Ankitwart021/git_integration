import apiConfig from '../config/apiConfig';
import { ApplicationEnum, Resource } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { AppError } from '../src/errors/customErrors';

interface Field {
  foreign?: boolean;
  isEnum?: boolean;
  [key: string]: Prisma.JsonValue | undefined;
}

interface FormattedResource {
  resource: string;
  fieldValues: Field[];
}
interface FormattedEnums {
  enum_name: string;
  fieldValues: Field[];
}
interface ResourcesAndEnums {
  resourceDtos: FormattedResource[];
  enumDtos: FormattedEnums[];
}

// Service to generate backend application zip
export class GenerateBackendAppService {
  constructor() {} // No dependencies needed for this specific service
  // Function to generate backend app zip by calling external API
  async generateBackendAppZip(resourcesAndEnums: ResourcesAndEnums): Promise<Buffer> {
    console.log('Requesting backend app zip...', resourcesAndEnums);
    
    const apiUrl = `${apiConfig.GENERATOR_BASE_URL}/generate_app_zip`;
    const requestData = JSON.stringify(resourcesAndEnums);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/zip',
        },
        body: requestData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new AppError(`Error from backend app generator: ${response.status} - ${errorBody}`, response.status);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Node.js Buffer

      console.log('Backend app zip received.');
      return buffer;

    } catch (error) {
      console.error('Failed to request backend app zip:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('An unexpected error occurred during backend app generation.', 500);
    }
  }
}