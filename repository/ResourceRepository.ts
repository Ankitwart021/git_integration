import { PrismaClient, Prisma } from "@prisma/client";

export class ResourceRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.ResourceCreateInput) {
    try {
      
      const resource = await this.prisma.resource.create({ data });
      return resource;
    } catch (error) {
      console.error("Error creating resource:", error);
      throw new Error("Failed to create resource.");
    }
  }

  async findById(id: string, applicationID?: string) {
    try {
      const where: Prisma.ResourceWhereUniqueInput = { id };
      if (applicationID) {
        const resource = await this.prisma.resource.findFirst({ where: { id, applicationID } });
        return resource;
      }
      const resource = await this.prisma.resource.findUnique({ where });
      return resource;
    } catch (error) {
      console.error(`Error getting resource by id ${id}:`, error);
      throw new Error("Failed to get resource.");
    }
  }

  async findByApplicationId(applicationID: string) {
    try {
      const resources = await this.prisma.resource.findMany({ 
        where: { applicationID },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return resources;
    } catch (error) {
      console.error(`Error getting resources for application ${applicationID}:`, error);
      throw new Error("Failed to get resources for application.");
    }
  }

  async update(id: string, applicationID: string, data: Prisma.ResourceUpdateInput) {
    const resourceToUpdate = await this.prisma.resource.findFirst({
        where: { id, applicationID },
    });

    if (!resourceToUpdate) {
        throw new Error("Resource not found or does not belong to the application.");
    }
    try {
      const resource = await this.prisma.resource.update({ where: { id }, data });
      return resource;
    } catch (error) {
      console.error(`Error updating resource ${id}:`, error);
      throw new Error("Failed to update resource.");
    }
  }

  async delete(id: string, applicationID: string) {
    const resourceToDelete = await this.prisma.resource.findFirst({
        where: { id, applicationID },
    });

    if (!resourceToDelete) {
        throw new Error("Resource not found or does not belong to the application.");
    }
    try {
      const resource = await this.prisma.resource.delete({ where: { id } });
      return resource;
    } catch (error) {
      console.error(`Error deleting resource ${id}:`, error);
      throw new Error("Failed to delete resource.");
    }
  }
}