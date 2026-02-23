import { Category, PrismaClient } from '@prisma/client';
import database from '../config/database';

export class CategoryRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = database.prisma;
  }

  public async create(data: { name: string; description?: string }): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  public async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }

  public async findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { name },
    });
  }
}
