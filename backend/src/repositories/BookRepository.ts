import database from '../config/database';
import { Prisma } from '@prisma/client';

export class BookRepository {
  public async findAll() {
    return database.prisma.book.findMany({
      include: { category: true, seller: true },
    });
  }

  public async findById(id: string) {
    return database.prisma.book.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  public async create(data: Prisma.BookCreateInput) {
    return database.prisma.book.create({ data });
  }

  public async updateStock(id: string, quantity: number) {
    return database.prisma.book.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });
  }
}
