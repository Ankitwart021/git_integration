import { PrismaClient, Prisma, SyncQueue } from "@prisma/client";

export class SyncQueueRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Find an existing SyncQueue entry with status = PENDING for the given unit.
   */
  async findPendingEntry(
    applicationId: string,
    unitType: string,
    unitId: string,
  ): Promise<SyncQueue | null> {
    try {
      return await this.prisma.syncQueue.findFirst({
        where: {
          applicationId,
          unitType,
          unitId,
          status: "PENDING",
        },
      });
    } catch (error) {
      console.error("Error finding pending SyncQueue entry:", error);
      throw new Error("Failed to find pending SyncQueue entry.");
    }
  }

  /**
   * Create a new SyncQueue row.
   */
  async create(data: Prisma.SyncQueueCreateInput): Promise<SyncQueue> {
    try {
      return await this.prisma.syncQueue.create({ data });
    } catch (error) {
      console.error("Error creating SyncQueue entry:", error);
      throw new Error("Failed to create SyncQueue entry.");
    }
  }

  /**
   * Touch the updatedAt timestamp of an existing SyncQueue row.
   * Prisma's @updatedAt on the model does this automatically when we
   * perform an `update`, so we issue a minimal update.
   */
  async updateTimestampAndOperation(id: string,operation:string): Promise<SyncQueue> {
    try {
      return await this.prisma.syncQueue.update({
        where: { id },
        data: { operation,updatedAt: new Date() },
      });
    } catch (error) {
      console.error("Error updating SyncQueue timestamp:", error);
      throw new Error("Failed to update SyncQueue timestamp.");
    }
  }
}
