import { PrismaClient, Review } from '@prisma/client';
import database from '../config/database';

export class ReviewRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = database.prisma;
  }

  public async getReviewsByBookId(bookId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { bookId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createReview(
    userId: string,
    bookId: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    return this.prisma.review.create({
      data: {
        userId,
        bookId,
        rating,
        comment,
      },
    });
  }

  public async deleteReview(reviewId: string): Promise<Review> {
    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }
}
