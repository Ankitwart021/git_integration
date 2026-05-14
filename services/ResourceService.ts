import { Prisma, Resource } from "@prisma/client";
import { NotFoundError } from "../src/errors/customErrors";
import { ResourceRepository } from "../repository/ResourceRepository";
import { SyncQueueService } from "./SyncQueueService";
import { computeContentHash } from "../utils/hashUtils";

export class ResourceService {
  private readonly repository: ResourceRepository;
  private readonly syncQueueService: SyncQueueService;

  constructor(repository: ResourceRepository, syncQueueService: SyncQueueService) {
    this.repository = repository;
    this.syncQueueService = syncQueueService;
  }

  async createResource(data: Prisma.ResourceCreateInput): Promise<Resource> {
    if (!data.resourceName || !data.application) {
        throw new Error('Resource name and application are required');
    }

    // Compute hash of resource attributes (if provided)
    let localHash: string | undefined;
    if (data.attributes) {
      localHash = await computeContentHash(data.attributes);
    }

    const resource = await this.repository.create({
      ...data,
      ...(localHash && { localHash }),
    });

    // Enqueue sync for the newly created resource
    await this.syncQueueService.enqueueSync(resource.applicationID, 'RESOURCE', resource.id, 'CREATE');

    return resource;
  }

  async getResourceById(id: string, applicationId?: string): Promise<Resource> {
    const resource = await this.repository.findById(id, applicationId);
    if (!resource) {
        throw new NotFoundError("Resource not found");
    }
    return resource;
  }

  async getResourcesByApplicationId(applicationID: string): Promise<Resource[]> {
    return this.repository.findByApplicationId(applicationID);
  }

  async updateResource(id: string, applicationID: string, data: Prisma.ResourceUpdateInput): Promise<Resource> {
    // 1. Compute hash of resource attributes (if provided)
    let localHash: string | undefined;
    if (data.attributes) {
      localHash = await computeContentHash(data.attributes);
    }

    // 2. Update the resource (include localHash)
    const updatedResource = await this.repository.update(id, applicationID, {
      ...data,
      ...(localHash && { localHash }),
    });

    // 3. Enqueue sync
    await this.syncQueueService.enqueueSync(applicationID, 'RESOURCE', id, 'UPDATE');

    return updatedResource;
  }

  async deleteResource(id: string, applicationID: string): Promise<Resource> {
    return this.repository.delete(id, applicationID);
  }
}