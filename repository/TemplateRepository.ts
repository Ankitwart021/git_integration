import { PrismaClient, Prisma } from "@prisma/client";

export class TemplateRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.TemplateCreateInput) {
    try {
      const template = await this.prisma.template.create({ data });
      return template;
    } catch (error) {
      console.error("Error creating template:", error);
      throw new Error("Failed to create template.");
    }
  }

  async findById(id: string) {
    try {
      const template = await this.prisma.template.findUnique({ where: { id } });
      return template;
    } catch (error) {
      console.error(`Error getting template by id ${id}:`, error);
      throw new Error("Failed to get template.");
    }
  }

  async findAll() {
    try {
      const templates = await this.prisma.template.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return templates;
    } catch (error) {
      console.error("Error getting all templates:", error);
      throw new Error("Failed to get all templates.");
    }
  }

  async update(id: string, data: Prisma.TemplateUpdateInput) {
    try {
      const template = await this.prisma.template.update({ where: { id }, data });
      return template;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      throw new Error("Failed to update template.");
    }
  }

  async delete(id: string) {
    try {
      const template = await this.prisma.template.delete({ where: { id } });
      return template;
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      throw new Error("Failed to delete template.");
    }
  }
}