import { Prisma, BookCondition } from '@prisma/client';

export class BookFactory {
  /**
   * Factory method to create a new book payload
   */
  public static createNewBook(data: Record<string, string | number>): Prisma.BookCreateInput {
    return {
      title: data.title as string,
      author: data.author as string,
      price: Number(data.price),
      stock: Number(data.stock),
      image: (data.image as string | undefined) ?? undefined,
      isUsed: false,
      condition: 'NEW',
      approvalStatus: 'APPROVED',
      category: {
        connect: { id: data.categoryId as string },
      },
    };
  }

  /**
   * Factory method to create a used book payload
   */
  public static createUsedBook(
    data: Record<string, string | number>,
    sellerId: string,
  ): Prisma.BookCreateInput {
    return {
      title: data.title as string,
      author: data.author as string,
      price: Number(data.price),
      stock: 1, // Used books typically have stock 1 per listing
      image: (data.image as string | undefined) ?? undefined,
      isUsed: true,
      condition: (data.condition as BookCondition) || 'GOOD',
      approvalStatus: 'PENDING',
      seller: {
        connect: { id: sellerId },
      },
      category: {
        connect: { id: data.categoryId as string },
      },
    };
  }
}
