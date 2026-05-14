import { PrismaClient, Prisma } from "@prisma/client";
import { generateWorkflow, getWorkflowSpec } from "../api/generateWorkflow";
import { createOrUpdateNodeConfig } from "../api/nodeConfig";

export class WorkflowRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.WorkflowUncheckedCreateInput) {
    try {
      const workflow = await this.prisma.workflow.create({ data });
      return workflow;
    } catch (error) {
      console.error("Error creating workflow:", error);
      throw new Error("Failed to create workflow.");
    }
  }

  async update(id: string, data: Prisma.WorkflowUpdateInput) {
    try {
      const workflow = await this.prisma.workflow.update({
        where: { id },
        data,
      });
      return workflow;
    } catch (error) {
      console.error(`Error updating workflow ${id}:`, error);
      throw new Error("Failed to update workflow.");
    }
  }

  async findById(id: string) {
    try {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id },
      });
      return workflow;
    } catch (error) {
      console.error(`Error finding workflow ${id}:`, error);
      throw new Error("Failed to find workflow.");
    }
  }

  async findAll(applicationID:string) {
    try {
      const workflows = await this.prisma.workflow.findMany({
        where: { applicationID },
        orderBy: {
          createdAt: "desc",
        },
      });
      return workflows;
    } catch (error) {
      console.error("Error finding all workflows:", error);
      throw new Error("Failed to find workflows.");
    }
  }

    async findByApplicationId(applicationID: string) {
    try {
      const workflows = await this.prisma.workflow.findMany({
        where: { applicationID },
        orderBy: {
          createdAt: "desc",
        },
      });
      return workflows;
    } catch (error) {
      console.error(`Error finding workflows for application ${applicationID}:`, error);
      throw new Error("Failed to find workflows.");
    }
  }

  async delete(id: string) {
    try {
      const workflow = await this.prisma.workflow.delete({
        where: { id },
      });
      return workflow;
    } catch (error) {
      console.error(`Error deleting workflow ${id}:`, error);
      throw new Error("Failed to delete workflow.");
    }
  }

 async generateWorkflow(workflowSpec: any, workflowId: string) {
  try {
    const workflow = await generateWorkflow(workflowSpec);
    console.log("generated workflow", workflow);

    const fixed = workflow.workflow_data
      .replace(/'/g, '"')
      .replace(/ObjectId\("(.+?)"\)/g, '"$1"');

    const workflow_data = JSON.parse(fixed);

    if (workflow) {
      await this.prisma.workflow.update({
        where: { id: workflowId },
        data: {
          generatedWorkflowIds: workflow_data.id,
        },
      });
      return workflow;
    }

    throw new Error("Failed to generate workflow.");
  } catch (error) {
    console.error("Error generating workflow:", error);
    throw new Error("Failed to generate workflow.");
  }
}


  async getWorkflowSpec(workflowID: string) {
    try {
      const workflowSpec = await getWorkflowSpec(workflowID);
      return workflowSpec;
    } catch (error) {
      console.error("Error getting workflow spec:", error);
      throw new Error("Failed to get workflow spec.");
    }
  }
}
