import { Prisma, User } from "@prisma/client";
import { NotFoundError, BadRequestError, AppError } from "../src/errors/customErrors";
import { UserRepository } from "../repository/UserRepository";
import { UserApplicationMapRepository } from "../repository/UserApplicationMapRepository";

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly userApplicationMapRepository: UserApplicationMapRepository;

  constructor(
    userRepository: UserRepository,
    userApplicationMapRepository: UserApplicationMapRepository
  ) {
    this.userRepository = userRepository;
    this.userApplicationMapRepository = userApplicationMapRepository;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    if (!data.email) {
        throw new BadRequestError('Email is required');
    }
    // Add more validation if needed e.g. email format
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
        throw new BadRequestError('User with this email already exists');
    }
    return this.userRepository.create(data);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
        throw new NotFoundError("User not found");
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    await this.getUserById(id);
    if (data.email && typeof data.email === 'string') {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser && existingUser.id !== id) {
            throw new BadRequestError('User with this email already exists');
        }
    }
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<User> {
    await this.getUserById(id);
    // Business logic: check for active applications before deleting
    const userApplications = await this.userApplicationMapRepository.findApplicationsByUserId(id);
    if (userApplications && userApplications.length > 0) {
      throw new BadRequestError("Cannot delete user with active applications.");
    }
    return this.userRepository.delete(id);
  }

  async upsertUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.userRepository.upsert(data);
  }

  async getApplicationsForUser(userId: string): Promise<any> { // The return type depends on what findApplicationsByUserId returns
    await this.getUserById(userId);
    return this.userApplicationMapRepository.findApplicationsByUserId(userId);
  }
}