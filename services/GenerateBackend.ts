import { ApplicationService } from './ApplicationService';
import { ResourceService } from './ResourceService';
import { ApplicationEnumService } from './ApplicationEnumService';
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

export class GenerateAppService {
  private readonly applicationService: ApplicationService;
  private readonly resourceService: ResourceService;
  private readonly applicationEnumService: ApplicationEnumService;

  constructor(
    applicationService: ApplicationService,
    resourceService: ResourceService,
    applicationEnumService: ApplicationEnumService
  ) {
    this.applicationService = applicationService;
    this.resourceService = resourceService;
    this.applicationEnumService = applicationEnumService;
  }

  async generateApp(applicationId: string): Promise<string> {
    const allResources = await this.resourceService.getResourcesByApplicationId(applicationId);
    console.log("all resources in generate app service", allResources);
    const allEnums = await this.applicationEnumService.getApplicationEnumsByApplicationId(applicationId);

    const formattedResources: FormattedResource[] = allResources.map((item: Resource) => {
      const attributes = item.attributes as any;
      let fieldValues: Field[] = [];

      if (Array.isArray(attributes)) {
        fieldValues = attributes;
      } else if (attributes && typeof attributes === 'object' && Array.isArray(attributes.fieldValues)) {
        fieldValues = attributes.fieldValues;
      }

      return {
        resource: item.resourceName,
        fieldValues: fieldValues.map((field: Field) => ({ ...field }))
      };
    });

    const formattedEnums: FormattedEnums[] = allEnums.map((item: ApplicationEnum) => {
      const values = item.enums as any;
      let fieldValues: Field[] = [];
 
      if (Array.isArray(values)) {
        fieldValues = values;
      } else if (values && typeof values === 'object' && Array.isArray(values.fieldValues)) {
        fieldValues = values.fieldValues;
      }
 
      return {
        enum_name: item.enumName,
        fieldValues: fieldValues.map((field: Field) => ({ ...field }))
      };
    });
    const sendResourceandEnums: ResourcesAndEnums = {
      resourceDtos: formattedResources,
      enumDtos: formattedEnums,
    };
    console.log("all fields in app", sendResourceandEnums);

    const response = await this.fetchResourceData(sendResourceandEnums, applicationId);

    if (response) {
      console.log('Resource generated successfully', response);
      return response;
    }
    return "";
  }

  private async fetchResourceData(resources: ResourcesAndEnums, applicationId: string) {
    console.log('Fetching data...', applicationId, resources);
    const appName = "generatedMyApp";
    const apiUrl = `${apiConfig.GENERATOR_BASE_URL}/generateApp?appName=${applicationId}`;
    const requestData = JSON.stringify(resources);
    console.log('Request Data:', requestData, apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        // 'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: requestData,
    });
    // console.log('Response Status:',  response);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new AppError(`Error from generator: ${response.status} - ${errorBody}`, response.status);
    }
    const responseData = await response.text();

    return responseData;
  }
}