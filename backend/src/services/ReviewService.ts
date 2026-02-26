import { ReviewRepository } from '../repositories/ReviewRepository';
import { Review } from '@prisma/client';

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
    comment: string,
  ): Promise<Review> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    // You could also verify if the user has purchased the book
    return this.reviewRepository.createReview(userId, bookId, rating, comment);
  }

  public async removeReview(reviewId: string): Promise<Review> {
    return this.reviewRepository.deleteReview(reviewId);
  }
}
