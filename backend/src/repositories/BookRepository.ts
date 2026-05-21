import database from '../config/database';
import { Prisma, BookCondition, ApprovalStatus } from '@prisma/client';

export class BookRepository {
  public async findAll(filters?: {
    query?: string;
    categoryId?: string;
    condition?: BookCondition;
    isUsed?: boolean;
  }) {
    // Build AND conditions so each filter is independently applied
    const andConditions: Prisma.BookWhereInput[] = [];

    // Visibility rule: only new books OR approved used books
    andConditions.push({
      OR: [{ isUsed: false }, { isUsed: true, approvalStatus: 'APPROVED' }],
    });

    if (filters?.isUsed !== undefined) {
      andConditions.push({ isUsed: filters.isUsed });
    }
    if (filters?.condition) {
      andConditions.push({ condition: filters.condition });
    }
    if (filters?.categoryId) {
      andConditions.push({ categoryId: filters.categoryId });
    }
    if (filters?.query) {
      andConditions.push({
        OR: [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { author: { contains: filters.query, mode: 'insensitive' } },
          { isbn13: { contains: filters.query, mode: 'insensitive' } },
          { isbn10: { contains: filters.query, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.BookWhereInput = { AND: andConditions };

    return database.prisma.book.findMany({
      where,
      include: {
        category: true,
        seller: true,
        catalogBook: { select: { image: true, imageOriginal: true } },
      },
    });
  }

  public async findById(id: string) {
    return database.prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        catalogBook: { select: { image: true, imageOriginal: true } },
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
