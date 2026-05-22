import database from '../config/database';
import { Prisma, BookCondition, ApprovalStatus } from '@prisma/client';

type BookListFilters = {
  query?: string;
  categoryId?: string;
  condition?: BookCondition;
  isUsed?: boolean;
  approvalStatus?: ApprovalStatus;
};

const bookListInclude = {
  category: true,
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  catalogBook: { select: { image: true } },
  reviews: {
    select: {
      rating: true,
    },
  },
} satisfies Prisma.BookInclude;

export class BookRepository {
  private buildFilters(filters?: BookListFilters): Prisma.BookWhereInput[] {
    const andConditions: Prisma.BookWhereInput[] = [];

    if (filters?.isUsed !== undefined) {
      andConditions.push({ isUsed: filters.isUsed });
    }

    if (filters?.condition) {
      andConditions.push({ condition: filters.condition });
    }

    if (filters?.categoryId) {
      andConditions.push({ categoryId: filters.categoryId });
    }

    if (filters?.approvalStatus) {
      andConditions.push({ approvalStatus: filters.approvalStatus });
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

    return andConditions;
  }

  public async findAll(filters?: BookListFilters) {
    const where: Prisma.BookWhereInput = {
      AND: [
        {
          OR: [{ isUsed: false }, { isUsed: true, approvalStatus: 'APPROVED' }],
        },
        ...this.buildFilters(filters),
      ],
    };

    return database.prisma.book.findMany({
      where,
      include: bookListInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAdminAll(filters?: BookListFilters) {
    const where: Prisma.BookWhereInput = {
      AND: this.buildFilters(filters),
    };

    return database.prisma.book.findMany({
      where,
      include: bookListInclude,
      orderBy: [{ approvalStatus: 'asc' }, { createdAt: 'desc' }],
    });
  }

  public async findById(id: string) {
    return database.prisma.book.findFirst({
      where: {
        id,
        OR: [{ isUsed: false }, { isUsed: true, approvalStatus: 'APPROVED' }],
      },
      include: {
        category: true,
        catalogBook: { select: { image: true } },
        seller: { select: { id: true, name: true, email: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  public async findByIdForOwnerOrAdmin(id: string) {
    return database.prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        catalogBook: { select: { image: true } },
        seller: { select: { id: true, name: true, email: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  public async create(data: Prisma.BookCreateInput) {
    return database.prisma.book.create({ data });
  }

  public async update(id: string, data: Prisma.BookUpdateInput) {
    return database.prisma.book.update({
      where: { id },
      data,
      include: bookListInclude,
    });
  }

  public async delete(id: string) {
    return database.prisma.book.delete({
      where: { id },
    });
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
      include: bookListInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  public async findBySellerId(sellerId: string) {
    return database.prisma.book.findMany({
      where: { sellerId },
      include: bookListInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  public async updateApprovalStatus(id: string, status: ApprovalStatus) {
    return database.prisma.book.update({
      where: { id },
      data: { approvalStatus: status },
      include: bookListInclude,
    });
  }
}
