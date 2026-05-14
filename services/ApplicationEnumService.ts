import { Prisma, ApplicationEnum } from "@prisma/client";
import { NotFoundError } from "../src/errors/customErrors";
import { ApplicationEnumRepository } from "../repository/ApplicationEnumRepository";
import { SyncQueueService } from "./SyncQueueService";
import { computeContentHash } from "../utils/hashUtils";

export class ApplicationEnumService {
  private readonly repository: ApplicationEnumRepository;
  private readonly syncQueueService: SyncQueueService;

  constructor(repository: ApplicationEnumRepository, syncQueueService: SyncQueueService) {
    this.repository = repository;
    this.syncQueueService = syncQueueService;
  }

  async createApplicationEnum(data: Prisma.ApplicationEnumCreateInput): Promise<ApplicationEnum> {
    if (!data.enumName || !data.application) {
        throw new Error('Enum name and application are required');
    }

    // Compute hash of enum data (if provided)
    let localHash: string | undefined;
    if (data.enums) {
      localHash = await computeContentHash(data.enums);
    }

    const appEnum = await this.repository.create({
      ...data,
      ...(localHash && { localHash }),
    });

    // Enqueue sync for the newly created enum
    await this.syncQueueService.enqueueSync(appEnum.applicationID, 'ENUM', appEnum.id, 'CREATE');

    return appEnum;
  }

  async getApplicationEnumById(id: string, applicationId?: string): Promise<ApplicationEnum> {
    const appEnum = await this.repository.findById(id, applicationId);
    if (!appEnum) {
        throw new NotFoundError("ApplicationEnum not found");
    }
    return appEnum;
  }

  async getApplicationEnumsByApplicationId(applicationID: string): Promise<ApplicationEnum[]> {
    return this.repository.findByApplicationId(applicationID);
  }

  async updateApplicationEnum(id: string, applicationID: string, data: Prisma.ApplicationEnumUpdateInput): Promise<ApplicationEnum> {
    await this.getApplicationEnumById(id, applicationID);

    // 1. Compute hash of enum data (if provided)
    let localHash: string | undefined;
    if (data.enums) {
      localHash = await computeContentHash(data.enums);
    }

    // 2. Update the enum (include localHash)
    const updatedEnum = await this.repository.update(id, applicationID, {
      ...data,
      ...(localHash && { localHash }),
    });

    // 3. Enqueue sync
    await this.syncQueueService.enqueueSync(applicationID, 'ENUM', id, 'UPDATE');

    return updatedEnum;
  }

  async deleteApplicationEnum(id: string, applicationID: string): Promise<ApplicationEnum> {
    await this.getApplicationEnumById(id, applicationID);
    return this.repository.delete(id, applicationID);
  }
}