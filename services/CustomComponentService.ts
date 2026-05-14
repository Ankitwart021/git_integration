import { Prisma, CustomComponent } from "@prisma/client";
import { NotFoundError } from "../src/errors/customErrors";
import { CustomComponentRepository } from "../repository/CustomComponentRepository";
import { SyncQueueService } from "./SyncQueueService";
import { computeContentHash } from "../utils/hashUtils";

export class CustomComponentService {
  private readonly repository: CustomComponentRepository;
  private readonly syncQueueService: SyncQueueService;

  constructor(repository: CustomComponentRepository, syncQueueService: SyncQueueService) {
    this.repository = repository;
    this.syncQueueService = syncQueueService;
  }

  async createCustomComponent(data: Prisma.CustomComponentCreateInput): Promise<CustomComponent> {
    if (!data.componentName || !data.user) {
        throw new Error('Custom component name and user are required');
    }

    // Compute hash of component content (if provided)
    let localHash: string | undefined;
    if (data.componentContent) {
      localHash = await computeContentHash(data.componentContent);
    }

    const component = await this.repository.create({
      ...data,
      ...(localHash && { localHash }),
    });

    // Enqueue sync for the newly created component (userId as scope)
    await this.syncQueueService.enqueueSync(component.userId, 'CUSTOM_COMPONENT', component.id, 'CREATE');

    return component;
  }

  async getCustomComponentById(id: string): Promise<CustomComponent> {
    const component = await this.repository.findById(id);
    if (!component) {
        throw new NotFoundError("CustomComponent not found");
    }
    return component;
  }

  async getCustomComponentsByUserId(userId: string): Promise<CustomComponent[]> {
    return this.repository.findByUserId(userId);
  }

  async updateCustomComponent(id: string, data: Prisma.CustomComponentUpdateInput): Promise<CustomComponent> {
    await this.getCustomComponentById(id);

    // 1. Compute hash of component content (if provided)
    let localHash: string | undefined;
    if (data.componentContent) {
      localHash = await computeContentHash(data.componentContent);
    }

    // 2. Update the custom component (include localHash)
    const updatedComponent = await this.repository.update(id, {
      ...data,
      ...(localHash && { localHash }),
    });

    // 3. Enqueue sync (use userId as scope since CustomComponent is user-scoped, not app-scoped)
    await this.syncQueueService.enqueueSync(
      updatedComponent.userId, 'CUSTOM_COMPONENT', id, 'UPDATE'
    );

    return updatedComponent;
  }

  async deleteCustomComponent(id: string): Promise<CustomComponent> {
    await this.getCustomComponentById(id);
    return this.repository.delete(id);
  }
}