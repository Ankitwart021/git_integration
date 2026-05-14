import { PrismaClient, Prisma } from "@prisma/client";

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.UserCreateInput) {
    try {
      const user = await this.prisma.user.create({ data });
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user.");
    }
  }

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      return user;
    } catch (error) {
      console.error(`Error getting user by id ${id}:`, error);
      throw new Error("Failed to get user.");
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      return user;
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
      throw new Error("Failed to get user by email.");
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return users;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw new Error("Failed to get all users.");
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      return user;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw new Error("Failed to update user.");
    }
  }

  async delete(id: string) {
    try {
      const user = await this.prisma.user.delete({ where: { id } });
      return user;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw new Error("Failed to delete user.");
    }
  }

  async upsert(data: Prisma.UserCreateInput) {
    try {
      const user = await this.prisma.user.upsert({
        where: { id: data.id as string },
        update: {
          username: data.username,
          email: data.email
        },
        create: {
          id: data.id as string,
          username: data.username,
          email: data.email
        }
      });
      return user;
    } catch (error) {
      console.error("Error upserting user:", error);
      throw new Error("Failed to upsert user.");
    }
  }
}