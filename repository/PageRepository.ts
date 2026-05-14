import { PrismaClient, Prisma } from "@prisma/client";
import { hashUnitContent } from "../src/utils/hashUtils";

export class PageRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.PageCreateInput) {
    try {
      const page = await this.prisma.page.create({ data });
      return page;
    } catch (error) {
      console.error("Error creating page:", error);
      throw new Error("Failed to create page.");
    }
  }

  async findById(id: string, applicationID?: string) {
    try {
      const where: Prisma.PageWhereUniqueInput = { id };
      if (applicationID) {
        const page = await this.prisma.page.findFirst({ where: { id, applicationID } });
        return page;
      }
      const page = await this.prisma.page.findUnique({ where });
      return page;
    } catch (error) {
      console.error(`Error getting page by id ${id}:`, error);
      throw new Error("Failed to get page.");
    }
  }

  async findByApplicationId(applicationID: string) {
    try {
      const pages = await this.prisma.page.findMany({
        where: { applicationID },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return pages;
    } catch (error) {
      console.error(`Error getting pages for application ${applicationID}:`, error);
      throw new Error("Failed to get pages for application.");
    }
  }

  async update(id: string, applicationID: string, data: Prisma.PageUpdateInput) {
    const pageToUpdate = await this.prisma.page.findFirst({
      where: { id, applicationID },
    });

    if (!pageToUpdate) {
      throw new Error("Page not found or does not belong to the application.");
    }
     try {
      const page = await this.prisma.page.update({ where: { id }, data: data });
      return page;
    } catch (error) {
      console.error(`Error updating page ${id}:`, error);
      throw new Error("Failed to update page.");
    }
    // try {
    //   console.log("data of update page", pageToUpdate,data);
    //   const hashContent = { pageName: data.pageName, pageContent: data.pageContent };
    //   const localHash = hashUnitContent(hashContent);
     

    //   const dataToSend = {
    //     ...data,
    //     localHash: localHash,
    //     syncVersion: pageToUpdate.syncVersion==0?0 : pageToUpdate.syncVersion + 1,// Increment sync version on each update
    //   }


    //   const page = await this.prisma.page.update({ where: { id }, data: dataToSend });
    //   return page;
    // } catch (error) {
    //   console.error(`Error updating page ${id}:`, error);
    //   throw new Error("Failed to update page.");
    // }
  }

  async delete(id: string, applicationID: string) {
    const pageToDelete = await this.prisma.page.findFirst({
      where: { id, applicationID },
    });

    if (!pageToDelete) {
      throw new Error("Page not found or does not belong to the application.");
    }
    try {
      const page = await this.prisma.page.delete({ where: { id } });
      return page;
    } catch (error) {
      console.error(`Error deleting page ${id}:`, error);
      throw new Error("Failed to delete page.");
    }
  }
}