import { Prisma, TemplateResource } from "@prisma/client";
import { TemplateResourceRepository } from "../repository/TemplateResourceRepository";

export class TemplateResourceService {
  private readonly repository: TemplateResourceRepository;

  constructor(repository: TemplateResourceRepository) {
    this.repository = repository;
  }

  async createTemplateResource(data: Prisma.TemplateResourceCreateInput): Promise<TemplateResource> {
    if (!data.resourceName || !data.template) {
        throw new Error('Resource name and template are required');
    }
    return this.repository.create(data);
  }

  async getTemplateResourceById(id: string): Promise<TemplateResource> {
    const templateResource = await this.repository.findById(id);
    if (!templateResource) {
        throw new Error("TemplateResource not found");
    }
    return templateResource;
  }

  async getTemplateResourcesByTemplateId(templateId: string): Promise<TemplateResource[]> {
    return this.repository.findByTemplateId(templateId);
  }

  async updateTemplateResource(id: string, data: Prisma.TemplateResourceUpdateInput): Promise<TemplateResource> {
    await this.getTemplateResourceById(id);
    return this.repository.update(id, data);
  }

  async deleteTemplateResource(id: string): Promise<TemplateResource> {
    await this.getTemplateResourceById(id);
    return this.repository.delete(id);
  }
}