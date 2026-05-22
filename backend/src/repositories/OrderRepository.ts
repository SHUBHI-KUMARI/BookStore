import database from '../config/database';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';

const orderInclude = {
  items: {
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          image: true,
          isUsed: true,
          condition: true,
          sellerId: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.OrderInclude;

export class OrderRepository {
  public async findByUserId(userId: string) {
    return database.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAll() {
    return database.prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findById(id: string) {
    return database.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
  }

  public async create(data: Prisma.OrderUncheckedCreateInput) {
    return database.prisma.order.create({
      data,
      include: orderInclude,
    });
  }

  public async update(id: string, data: Prisma.OrderUpdateInput) {
    return database.prisma.order.update({
      where: { id },
      data,
      include: orderInclude,
    });
  }

  public async updateStatus(id: string, status: OrderStatus) {
    return this.update(id, { status });
  }

  public async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return this.update(id, { paymentStatus });
  }
}
