import { PrismaClient, Prisma } from "@prisma/client";

export class TemplatePageRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.TemplatePageCreateInput) {
    try {
      const templatePage = await this.prisma.templatePage.create({ data });
      return templatePage;
    } catch (error) {
      console.error("Error creating template page:", error);
      throw new Error("Failed to create template page.");
    }
  }

  async findById(id: string) {
    try {
      const templatePage = await this.prisma.templatePage.findUnique({ where: { id } });
      return templatePage;
    } catch (error) {
      console.error(`Error getting template page by id ${id}:`, error);
      throw new Error("Failed to get template page.");
    }
  }

  async findByTemplateId(templateId: string) {
    try {
      const templatePages = await this.prisma.templatePage.findMany({ 
        where: { templateId },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return templatePages;
    } catch (error) {
      console.error(`Error getting pages for template ${templateId}:`, error);
      throw new Error("Failed to get pages for template.");
    }
  }

  async update(id: string, data: Prisma.TemplatePageUpdateInput) {
    try {
      const templatePage = await this.prisma.templatePage.update({ where: { id }, data });
      return templatePage;
    } catch (error) {
      console.error(`Error updating template page ${id}:`, error);
      throw new Error("Failed to update template page.");
    }
  }

  async delete(id: string) {
    try {
      const templatePage = await this.prisma.templatePage.delete({ where: { id } });
      return templatePage;
    } catch (error) {
      console.error(`Error deleting template page ${id}:`, error);
      throw new Error("Failed to delete template page.");
    }
  }
}