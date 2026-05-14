import { PrismaClient, Prisma } from "@prisma/client";

export class UserApplicationMapRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.UserApplicationMapCreateInput) {
    try {
      const mapping = await this.prisma.userApplicationMap.create({ data });
      return mapping;
    } catch (error) {
      console.error("Error creating user-application map:", error);
      throw new Error("Failed to create user-application map.");
    }
  }

  async findUnique(userId: string, applicationID: string) {
    try {
      const mapping = await this.prisma.userApplicationMap.findUnique({
        where: { userId_applicationID: { userId, applicationID } },
      });
      return mapping;
    } catch (error) {
      console.error("Error getting user-application map:", error);
      throw new Error("Failed to get user-application map.");
    }
  }

  async findAll() {
    try {
      const mappings = await this.prisma.userApplicationMap.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return mappings;
    } catch (error) {
      console.error("Error getting all user-application maps:", error);
      throw new Error("Failed to get all user-application maps.");
    }
  }

  async delete(userId: string, applicationID: string) {
    try {
      const mapping = await this.prisma.userApplicationMap.delete({
        where: { userId_applicationID: { userId, applicationID } },
      });
      return mapping;
    } catch (error) {
      console.error("Error deleting user-application map:", error);
      throw new Error("Failed to delete user-application map.");
    }
  }

  async findApplicationsByUserId(userId: string) {
    try {
      // Find all application mappings for the given user ID
          const userAppMaps = await this.prisma.userApplicationMap.findMany({
            where: { userId: userId },
            select: { applicationID: true }, // Only select the applicationID
          });
      
          // If no applications are found for the user, return an empty array
          if (!userAppMaps || userAppMaps.length === 0) {
            return [];
          }
      
          // Extract the application IDs from the mappings
          const applicationIds = userAppMaps.map(map => map.applicationID);
      
          // Retrieve the details for all found application IDs
          const applications = await this.prisma.application.findMany({
                where: {
                    id: {
                        in: applicationIds,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

      return applications;
    } catch (error) {
      console.error(`Error fetching applications for user ${userId}:`, error);
      throw new Error(`Failed to get applications for user ${userId}.`);
    }
  }
}