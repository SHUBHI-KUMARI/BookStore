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
}
