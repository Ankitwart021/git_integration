import { Prisma, TemplatePage } from "@prisma/client";
import { TemplatePageRepository } from "../repository/TemplatePageRepository";

export class TemplatePageService {
  private readonly repository: TemplatePageRepository;

  constructor(repository: TemplatePageRepository) {
    this.repository = repository;
  }

  async createTemplatePage(data: Prisma.TemplatePageCreateInput): Promise<TemplatePage> {
    if (!data.tpName || !data.template) {
        throw new Error('Page name and template are required');
    }
    return this.repository.create(data);
  }

  async getTemplatePageById(id: string): Promise<TemplatePage> {
    const templatePage = await this.repository.findById(id);
    if (!templatePage) {
        throw new Error("TemplatePage not found");
    }
    return templatePage;
  }

  async getTemplatePagesByTemplateId(templateId: string): Promise<TemplatePage[]> {
    return this.repository.findByTemplateId(templateId);
  }

  async updateTemplatePage(id: string, data: Prisma.TemplatePageUpdateInput): Promise<TemplatePage> {
    await this.getTemplatePageById(id);
    return this.repository.update(id, data);
  }

  async deleteTemplatePage(id: string): Promise<TemplatePage> {
    await this.getTemplatePageById(id);
    return this.repository.delete(id);
  }
}