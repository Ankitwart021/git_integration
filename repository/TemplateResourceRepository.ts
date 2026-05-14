import { PrismaClient, Prisma } from "@prisma/client";

export class TemplateResourceRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.TemplateResourceCreateInput) {
    try {
      const templateResource = await this.prisma.templateResource.create({ data });
      return templateResource;
    } catch (error) {
      console.error("Error creating template resource:", error);
      throw new Error("Failed to create template resource.");
    }
  }

  async findById(id: string) {
    try {
      const templateResource = await this.prisma.templateResource.findUnique({ where: { id } });
      return templateResource;
    } catch (error) {
      console.error(`Error getting template resource by id ${id}:`, error);
      throw new Error("Failed to get template resource.");
    }
  }

  async findByTemplateId(templateId: string) {
    try {
      const templateResources = await this.prisma.templateResource.findMany({ 
        where: { templateId },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return templateResources;
    } catch (error) {
      console.error(`Error getting resources for template ${templateId}:`, error);
      throw new Error("Failed to get resources for template.");
    }
  }

  async update(id: string, data: Prisma.TemplateResourceUpdateInput) {
    try {
      const templateResource = await this.prisma.templateResource.update({ where: { id }, data });
      return templateResource;
    } catch (error) {
      console.error(`Error updating template resource ${id}:`, error);
      throw new Error("Failed to update template resource.");
    }
  }

  async delete(id: string) {
    try {
      const templateResource = await this.prisma.templateResource.delete({ where: { id } });
      return templateResource;
    } catch (error) {
      console.error(`Error deleting template resource ${id}:`, error);
      throw new Error("Failed to delete template resource.");
    }
  }
}