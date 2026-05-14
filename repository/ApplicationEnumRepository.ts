import { PrismaClient, Prisma } from "@prisma/client";

export class ApplicationEnumRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.ApplicationEnumCreateInput) {
    try {
      const appEnum = await this.prisma.applicationEnum.create({ data });
      return appEnum;
    } catch (error) {
      console.error("Error creating application enum:", error);
      throw new Error("Failed to create application enum.");
    }
  }

  async findById(id: string, applicationID?: string) {
    try {
      const where: Prisma.ApplicationEnumWhereUniqueInput = { id };
      if (applicationID) {
        const appEnum = await this.prisma.applicationEnum.findFirst({ where: { id, applicationID } });
        return appEnum;
      }
      const appEnum = await this.prisma.applicationEnum.findUnique({ where });
      return appEnum;
    } catch (error) {
      console.error(`Error getting application enum by id ${id}:`, error);
      throw new Error("Failed to get application enum.");
    }
  }

  async findByApplicationId(applicationID: string) {
    try {
      const appEnums = await this.prisma.applicationEnum.findMany({ 
        where: { applicationID },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return appEnums;
    } catch (error) {
      console.error(`Error getting enums for application ${applicationID}:`, error);
      throw new Error("Failed to get enums for application.");
    }
  }

  async update(id: string, applicationID: string, data: Prisma.ApplicationEnumUpdateInput) {
    const enumToUpdate = await this.prisma.applicationEnum.findFirst({
        where: { id, applicationID },
    });

    if (!enumToUpdate) {
        throw new Error("Enum not found or does not belong to the application.");
    }
    try {
      const appEnum = await this.prisma.applicationEnum.update({ where: { id }, data });
      return appEnum;
    } catch (error) {
      console.error(`Error updating application enum ${id}:`, error);
      throw new Error("Failed to update application enum.");
    }
  }

  async delete(id: string, applicationID: string) {
    const enumToDelete = await this.prisma.applicationEnum.findFirst({
        where: { id, applicationID },
    });

    if (!enumToDelete) {
        throw new Error("Enum not found or does not belong to the application.");
    }
    try {
      const appEnum = await this.prisma.applicationEnum.delete({ where: { id } });
      return appEnum;
    } catch (error) {
      console.error(`Error deleting application enum ${id}:`, error);
      throw new Error("Failed to delete application enum.");
    }
  }
}