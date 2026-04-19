import database from '../config/database';
import { Prisma } from '@prisma/client';

export class UserRepository {
  /**
   * Find a user by their email address
   */
  public async findByEmail(email: string) {
    return database.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by their ID
   */
  public async findById(id: string) {
    return database.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user in the database
   */
  public async create(data: Prisma.UserCreateInput) {
    return database.prisma.user.create({
      data,
    });
  }

  /**
   * Update an existing user
   */
  public async update(id: string, data: Prisma.UserUpdateInput) {
    return database.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
  }

  /**
   * Find all users (admin use)
   */
  public async findAll() {
    return database.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
