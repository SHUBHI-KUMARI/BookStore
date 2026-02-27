import database from '../config/database';
import { Prisma, BookCondition, ApprovalStatus } from '@prisma/client';

export class BookRepository {
  public async findAll(filters?: {
    query?: string;
    categoryId?: string;
    condition?: BookCondition;
    isUsed?: boolean;
  }) {
    const where: Prisma.BookWhereInput = {};
    if (filters?.isUsed !== undefined) {
      where.isUsed = filters.isUsed;
    }
    if (filters?.condition) {
      where.condition = filters.condition;
    }
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { author: { contains: filters.query, mode: 'insensitive' } },
      ];
    }
    // Only approved used books, or New books. Null means new book without approval needs
    where.OR = where.OR || [];
    where.OR.push({ isUsed: false });
    where.OR.push({ isUsed: true, approvalStatus: 'APPROVED' });

    return database.prisma.book.findMany({
      where,
      include: { category: true, seller: true },
    });
  }

  public async findById(id: string) {
    return database.prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        seller: { select: { id: true, name: true, email: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
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
  public async findPendingResale() {
    return database.prisma.book.findMany({
      where: { isUsed: true, approvalStatus: 'PENDING' },
      include: { category: true, seller: true },
    });
  }

  public async updateApprovalStatus(id: string, status: ApprovalStatus) {
    return database.prisma.book.update({
      where: { id },
      data: { approvalStatus: status },
    });
  }
}
