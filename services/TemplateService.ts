import { Prisma, Template, TemplatePage, TemplateResource, TemplateEnum } from "@prisma/client";
import { TemplateRepository } from "../repository/TemplateRepository";
import { TemplatePageRepository } from "../repository/TemplatePageRepository";
import { TemplateResourceRepository } from "../repository/TemplateResourceRepository";
import { TemplateEnumRepository } from "../repository/TemplateEnumRepository";

export class TemplateService {
  private readonly templateRepository: TemplateRepository;
  private readonly templatePageRepository: TemplatePageRepository;
  private readonly templateResourceRepository: TemplateResourceRepository;
  private readonly templateEnumRepository: TemplateEnumRepository;

  constructor(
    templateRepository: TemplateRepository,
    templatePageRepository: TemplatePageRepository,
    templateResourceRepository: TemplateResourceRepository,
    templateEnumRepository: TemplateEnumRepository
  ) {
    this.templateRepository = templateRepository;
    this.templatePageRepository = templatePageRepository;
    this.templateResourceRepository = templateResourceRepository;
    this.templateEnumRepository = templateEnumRepository;
  }

  async createTemplate(data: Prisma.TemplateCreateInput): Promise<Template> {
    if (!data.templateName || !data.description) {
        throw new Error('Template name and description are required');
    }
    return this.templateRepository.create(data);
  }

  async getTemplateById(id: string): Promise<Template> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
        throw new Error("Template not found");
    }
    return template;
  }

  async getAllTemplates(): Promise<Template[]> {
    return this.templateRepository.findAll();
  }

  async updateTemplate(id: string, data: Prisma.TemplateUpdateInput): Promise<Template> {
    await this.getTemplateById(id);
    return this.templateRepository.update(id, data);
  }

  async deleteTemplate(id: string): Promise<Template> {
    await this.getTemplateById(id);
    // Business logic: delete associated pages, resources, enums
    // These should be implemented in their respective repositories and called here
    // For example: await this.templatePageRepository.deleteMany({ where: { templateId: id } });
    return this.templateRepository.delete(id);
  }

  async createTemplateWithComponents(
    templateData: Prisma.TemplateCreateInput,
    pagesData: Prisma.TemplatePageCreateInput[],
    resourcesData: Prisma.TemplateResourceCreateInput[],
    enumsData: Prisma.TemplateEnumCreateInput[]
  ): Promise<Template> {
    const template = await this.createTemplate(templateData);

    for (const pageData of pagesData) {
      await this.templatePageRepository.create({ ...pageData, template: { connect: { id: template.id } } });
    }
    for (const resourceData of resourcesData) {
      await this.templateResourceRepository.create({ ...resourceData, template: { connect: { id: template.id } } });
    }
    for (const enumData of enumsData) {
      await this.templateEnumRepository.create({ ...enumData, template: { connect: { id: template.id } } });
    }

    return template;
  }
}