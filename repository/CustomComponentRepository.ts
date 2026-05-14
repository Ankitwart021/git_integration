import { PrismaClient, Prisma } from "@prisma/client";

export class CustomComponentRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.CustomComponentCreateInput) {
    try {
      const customComponent = await this.prisma.customComponent.create({ data });
      return customComponent;
    } catch (error) {
      console.error("Error creating custom component:", error);
      throw new Error("Failed to create custom component.");
    }
  }

  async findById(id: string) {
    try {
      const customComponent = await this.prisma.customComponent.findUnique({ where: { id } });
      return customComponent;
    } catch (error) {
      console.error(`Error getting custom component by id ${id}:`, error);
      throw new Error("Failed to get custom component.");
    }
  }

  async findByUserId(userId: string) {
    try {
      const customComponents = await this.prisma.customComponent.findMany({ 
        where: { userId },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return customComponents;
    } catch (error) {
      console.error(`Error getting custom components for user ${userId}:`, error);
      throw new Error("Failed to get custom components for user.");
    }
  }

  async update(id: string, data: Prisma.CustomComponentUpdateInput) {
    try {
      const customComponent = await this.prisma.customComponent.update({ where: { id }, data });
      return customComponent;
    } catch (error) {
      console.error(`Error updating custom component ${id}:`, error);
      throw new Error("Failed to update custom component.");
    }
  }

  async delete(id: string) {
    try {
      const customComponent = await this.prisma.customComponent.delete({ where: { id } });
      return customComponent;
    } catch (error) {
      console.error(`Error deleting custom component ${id}:`, error);
      throw new Error("Failed to delete custom component.");
    }
  }
}