import database from '../config/database';
import { Prisma } from '@prisma/client';

export class OrderRepository {
  public async findByUserId(userId: string) {
    return database.prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });
  }

  public async findById(id: string) {
    return database.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { book: true } } },
    });
  }

  public async create(data: Prisma.OrderCreateInput) {
    return database.prisma.order.create({ data });
  }

  public async updateStatus(id: string, status: string) {
    return database.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
