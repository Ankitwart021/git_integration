import { PrismaClient, Prisma } from "@prisma/client";

export class TemplateEnumRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.TemplateEnumCreateInput) {
    try {
      const templateEnum = await this.prisma.templateEnum.create({ data });
      return templateEnum;
    } catch (error) {
      console.error("Error creating template enum:", error);
      throw new Error("Failed to create template enum.");
    }
  }

  async findById(id: string) {
    try {
      const templateEnum = await this.prisma.templateEnum.findUnique({ where: { id } });
      return templateEnum;
    } catch (error) {
      console.error(`Error getting template enum by id ${id}:`, error);
      throw new Error("Failed to get template enum.");
    }
  }

  async findByTemplateId(templateId: string) {
    try {
      const templateEnums = await this.prisma.templateEnum.findMany({ 
        where: { templateId },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return templateEnums;
    } catch (error) {
      console.error(`Error getting enums for template ${templateId}:`, error);
      throw new Error("Failed to get enums for template.");
    }
  }

  async update(id: string, data: Prisma.TemplateEnumUpdateInput) {
    try {
      const templateEnum = await this.prisma.templateEnum.update({ where: { id }, data });
      return templateEnum;
    } catch (error) {
      console.error(`Error updating template enum ${id}:`, error);
      throw new Error("Failed to update template enum.");
    }
  }

  async delete(id: string) {
    try {
      const templateEnum = await this.prisma.templateEnum.delete({ where: { id } });
      return templateEnum;
    } catch (error) {
      console.error(`Error deleting template enum ${id}:`, error);
      throw new Error("Failed to delete template enum.");
    }
  }
}