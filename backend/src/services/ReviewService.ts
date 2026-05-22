import { ReviewRepository } from '../repositories/ReviewRepository';
import { Review } from '@prisma/client';
import database from '../config/database';

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  public async getBookReviews(bookId: string): Promise<Review[]> {
    return this.reviewRepository.getReviewsByBookId(bookId);
  }

  public async addReview(
    userId: string,
    bookId: string,
    rating: number,
    comment?: string,
  ): Promise<Review> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const hasPurchasedBook = await database.prisma.orderItem.findFirst({
      where: {
        bookId,
        order: {
          userId,
          paymentStatus: 'COMPLETED',
        },
      },
      select: { id: true },
    });

    if (!hasPurchasedBook) {
      throw new Error('You can only review books you have purchased');
    }

    return this.reviewRepository.createReview(userId, bookId, rating, comment ?? '');
  }

  public async removeReview(reviewId: string): Promise<Review> {
    return this.reviewRepository.deleteReview(reviewId);
  }
}
