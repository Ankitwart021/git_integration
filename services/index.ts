import { PrismaClient } from '@prisma/client';

// Import all repositories
import { ApplicationRepository } from '../repository/ApplicationRepository';
import { ApplicationDecoratorRepository } from '../repository/ApplicationDecoratorRepository';
import { ApplicationEnumRepository } from '../repository/ApplicationEnumRepository';
import { CustomComponentRepository } from '../repository/CustomComponentRepository';
import { PageRepository } from '../repository/PageRepository';
import { ResourceRepository } from '../repository/ResourceRepository';
import { TemplateRepository } from '../repository/TemplateRepository';
import { TemplatePageRepository } from '../repository/TemplatePageRepository';
import { TemplateResourceRepository } from '../repository/TemplateResourceRepository';
import { TemplateEnumRepository } from '../repository/TemplateEnumRepository';
import { UserRepository } from '../repository/UserRepository';
import { UserApplicationMapRepository } from '../repository/UserApplicationMapRepository';
import { WorkflowRepository } from '../repository/WorkflowRepository';
import { SyncQueueRepository } from '../repository/SyncQueueRepository';

// Import all services
import { ApplicationService } from './ApplicationService';
import { ApplicationDecoratorService } from './ApplicationDecoratorService';
import { ApplicationEnumService } from './ApplicationEnumService';
import { CustomComponentService } from './CustomComponentService';
import { PageService } from './PageService';
import { ResourceService } from './ResourceService';
import { TemplateService } from './TemplateService';
import { TemplatePageService } from './TemplatePageService';
import { TemplateResourceService } from './TemplateResourceService';
import { TemplateEnumService } from './TemplateEnumService';
import { UserService } from './UserService';
import { GenerateAppService } from './GenerateBackend';
import { WorkflowService } from './WorkflowService';
import { SyncQueueService } from './SyncQueueService';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Instantiate Repositories
const applicationRepository = new ApplicationRepository(prisma);
const applicationDecoratorRepository = new ApplicationDecoratorRepository(prisma);
const applicationEnumRepository = new ApplicationEnumRepository(prisma);
export const customComponentRepository = new CustomComponentRepository(prisma);
const pageRepository = new PageRepository(prisma);
const resourceRepository = new ResourceRepository(prisma);
const templateRepository = new TemplateRepository(prisma);
const templatePageRepository = new TemplatePageRepository(prisma);
const templateResourceRepository = new TemplateResourceRepository(prisma);
const templateEnumRepository = new TemplateEnumRepository(prisma);
const userRepository = new UserRepository(prisma);
export const userApplicationMapRepository = new UserApplicationMapRepository(prisma);
const workflowRepository = new WorkflowRepository(prisma);
const syncQueueRepository = new SyncQueueRepository(prisma);


// Instantiate Services
export const syncQueueService = new SyncQueueService(syncQueueRepository);
export const applicationService = new ApplicationService(prisma, applicationRepository, userApplicationMapRepository, resourceRepository, syncQueueService, pageRepository, applicationEnumRepository, customComponentRepository, workflowRepository);
export const applicationDecoratorService = new ApplicationDecoratorService(applicationDecoratorRepository);
export const applicationEnumService = new ApplicationEnumService(applicationEnumRepository, syncQueueService);
export const customComponentService = new CustomComponentService(customComponentRepository, syncQueueService);
export const pageService = new PageService(pageRepository, syncQueueService);
export const resourceService = new ResourceService(resourceRepository, syncQueueService);
export const templateService = new TemplateService(
    templateRepository,
    templatePageRepository,
    templateResourceRepository,
    templateEnumRepository
);
export const templatePageService = new TemplatePageService(templatePageRepository);
export const templateResourceService = new TemplateResourceService(templateResourceRepository);
export const templateEnumService = new TemplateEnumService(templateEnumRepository);
export const userService = new UserService(userRepository, userApplicationMapRepository);
export const generateAppService = new GenerateAppService(applicationService, resourceService, applicationEnumService);
export const workflowService = new WorkflowService(workflowRepository, syncQueueService);