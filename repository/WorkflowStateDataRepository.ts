import { PrismaClient } from "@prisma/client";

export class WorkflowStateDataRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createOrUpdate(workflowID: string, applicationID: string, nodes: any, edges: any) {
        try {
            const existing = await this.prisma.workflowStateData.findFirst({
                where: { workflowID , applicationID}
            });

            if (existing) {
                return await this.prisma.workflowStateData.update({
                    where: { id: existing.id },
                    data: { applicationID, nodes, edges },
                });
            }

            return await this.prisma.workflowStateData.create({
                data: { workflowID, applicationID, nodes, edges },
            });
        } catch (error) {
            console.error("Error creating workflow state data:", error);
            throw new Error("Failed to create workflow state data.");
        }
    }

    async findById(workflowID: string) {
        try {
            const workflowStateData = await this.prisma.workflowStateData.findFirst({
                where: { workflowID }
            });
            return workflowStateData;
        } catch (error) {
            console.error(`Error finding workflow state data ${workflowID}:`, error);
            throw new Error("Failed to find workflow state data.");
        }
    }

    async findAll() {
        try {
            const workflowStateData = await this.prisma.workflowStateData.findMany({
                orderBy: {
                    createdAt: "desc",
                },
            });
            return workflowStateData;
        } catch (error) {
            console.error("Error finding all workflow state data:", error);
            throw new Error("Failed to find workflow state data.");
        }
    }
    async findByWorkflowId(workflowID: string) {
        try {
            const workflowStateData = await this.prisma.workflowStateData.findFirst({
                where: { workflowID }
            });
            return workflowStateData;
        } catch (error) {
            console.error(`Error finding workflow state data for workflow ${workflowID}:`, error);
            throw new Error("Failed to find workflow state data.");
        }
    }
}
