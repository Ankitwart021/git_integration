import { ApplicationDecoratorRepository } from "../repository/ApplicationDecoratorRepository";
import { Prisma, ApplicationDecorator } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../src/errors/customErrors";

export class ApplicationDecoratorService {
  private readonly repository: ApplicationDecoratorRepository;

  constructor(repository: ApplicationDecoratorRepository) {
    this.repository = repository;
  }

  async createApplicationDecorator(data: Prisma.ApplicationDecoratorCreateInput): Promise<ApplicationDecorator> {
    // Basic validation
    if (!data.application || !data.decoratorName) {
        throw new BadRequestError('Application and decorator name are required');
    }
    return this.repository.create(data);
  }

  async getApplicationDecoratorById(id: string): Promise<ApplicationDecorator> {
    const decorator = await this.repository.findById(id);
    if (!decorator) {
      throw new NotFoundError('ApplicationDecorator not found');
    }
    return decorator;
  }
  
  async getApplicationDecoratorsByApplicationId(applicationID: string): Promise<ApplicationDecorator[]> {
    return this.repository.findByApplicationId(applicationID);
  }

  async updateApplicationDecorator(id: string, data: Prisma.ApplicationDecoratorUpdateInput): Promise<ApplicationDecorator> {
    await this.getApplicationDecoratorById(id);
    return this.repository.update(id, data);
  }

  async deleteApplicationDecorator(id: string): Promise<ApplicationDecorator> {
    await this.getApplicationDecoratorById(id);
    return this.repository.delete(id);
  }
}