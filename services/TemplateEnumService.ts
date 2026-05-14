import { Prisma, TemplateEnum } from "@prisma/client";
import { TemplateEnumRepository } from "../repository/TemplateEnumRepository";

export class TemplateEnumService {
  private readonly repository: TemplateEnumRepository;

  constructor(repository: TemplateEnumRepository) {
    this.repository = repository;
  }

  async createTemplateEnum(data: Prisma.TemplateEnumCreateInput): Promise<TemplateEnum> {
    if (!data.enumName || !data.template) {
        throw new Error('Enum name and template are required');
    }
    return this.repository.create(data);
  }

  async getTemplateEnumById(id: string): Promise<TemplateEnum> {
    const templateEnum = await this.repository.findById(id);
    if (!templateEnum) {
        throw new Error("TemplateEnum not found");
    }
    return templateEnum;
  }

  async getTemplateEnumsByTemplateId(templateId: string): Promise<TemplateEnum[]> {
    return this.repository.findByTemplateId(templateId);
  }

  async updateTemplateEnum(id: string, data: Prisma.TemplateEnumUpdateInput): Promise<TemplateEnum> {
    await this.getTemplateEnumById(id);
    return this.repository.update(id, data);
  }

  async deleteTemplateEnum(id: string): Promise<TemplateEnum> {
    await this.getTemplateEnumById(id);
    return this.repository.delete(id);
  }
}