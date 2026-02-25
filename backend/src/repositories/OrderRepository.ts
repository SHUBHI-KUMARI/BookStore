import database from '../config/database';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';

export class OrderRepository {
  public async findByUserId(userId: string) {
    return database.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { book: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAll() {
    return database.prisma.order.findMany({
      include: { items: { include: { book: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findById(id: string) {
    return database.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { book: true } } },
    });
  }

  public async create(data: Prisma.OrderUncheckedCreateInput) {
    return database.prisma.order.create({
      data,
      include: { items: true },
    });
  }

  public async updateStatus(id: string, status: OrderStatus) {
    return database.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  public async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return database.prisma.order.update({
      where: { id },
      data: { paymentStatus },
    });
  }
}
