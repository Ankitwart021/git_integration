import { PrismaClient, Prisma } from "@prisma/client";

export class ApplicationDecoratorRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByApplicationId(applicationID: string) {
    try {
      const decorators = await this.prisma.applicationDecorator.findMany({
        where: { applicationID: applicationID },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return decorators;
    } catch (error) {
      console.error(`Error getting application decorators for application ${applicationID}:`, error);
      throw new Error("Failed to get application decorators for application.");
    }
  }

  async create(data: Prisma.ApplicationDecoratorCreateInput) {
    return this.prisma.applicationDecorator.create({ data });
  }

  async findById(id: string) {
    return this.prisma.applicationDecorator.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.ApplicationDecoratorUpdateInput) {
    return this.prisma.applicationDecorator.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.applicationDecorator.delete({ where: { id } });
  }
}