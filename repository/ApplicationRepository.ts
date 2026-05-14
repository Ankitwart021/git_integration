import { PrismaClient, Prisma } from "@prisma/client";

export class ApplicationRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.ApplicationCreateInput) {
    try {
      const application = await this.prisma.application.create({ data });
      return application;
    } catch (error) {
      console.error("Error creating application:", error);
      throw new Error("Failed to create application.");
    }
  }

  async findById(id: string) {
    try {
      const application = await this.prisma.application.findUnique({ where: { id } });
      return application;
    } catch (error) {
      console.error(`Error getting application by id ${id}:`, error);
      throw new Error("Failed to get application.");
    }
  }

  async findAll() {
    try {
      const applications = await this.prisma.application.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return applications;
    } catch (error) {
      console.error("Error getting all applications:", error);
      throw new Error("Failed to get all applications.");
    }
  }

  async update(id: string, data: Prisma.ApplicationUpdateInput) {
    try {
      const application = await this.prisma.application.update({ where: { id }, data });
      return application;
    } catch (error) {
      console.error(`Error updating application ${id}:`, error);
      throw new Error("Failed to update application.");
    }
  }

  async delete(id: string) {
    try {
      const application = await this.prisma.application.delete({ where: { id } });
      return application;
    } catch (error) {
      console.error(`Error deleting application ${id}:`, error);
      throw new Error("Failed to delete application.");
    }
  }
}