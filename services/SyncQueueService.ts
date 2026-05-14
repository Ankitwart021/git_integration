import { SyncQueue } from "@prisma/client";
import { SyncQueueRepository } from "../repository/SyncQueueRepository";

export class SyncQueueService {
  private readonly repository: SyncQueueRepository;

  constructor(repository: SyncQueueRepository) {
    this.repository = repository;
  }

  /**
   * Enqueue a sync operation for a given unit.
   *
   * Rules:
   *  1. If a PENDING entry already exists for (applicationId, unitType, unitId)
   *     → update its updatedAt timestamp only (no new row).
   *  2. If no PENDING entry exists → insert a new row with status = PENDING.
   *  3. If the previous row was COMPLETED → Rule 2 applies naturally
   *     because there is no PENDING row.
   */
  async enqueueSync(
    applicationId: string,
    unitType: string,
    unitId: string,
    operation: string,
  ): Promise<SyncQueue> {
    // Rule 1 — check for an existing PENDING entry
    const existing = await this.repository.findPendingEntry(
      applicationId,
      unitType,
      unitId,
    );

    if (existing) {
      // Update the timestamp of the existing PENDING row and update operation to UPDATE
      return this.repository.updateTimestampAndOperation(existing.id,operation);
    }

    // Rule 2 & 3 — insert a new PENDING row
    return this.repository.create({
      applicationId,
      unitType,
      unitId,
      operation,
      status: "PENDING",
    });
  }
}
