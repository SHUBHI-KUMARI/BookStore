import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ReviewService } from '../services/ReviewService';

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  public getReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookId } = req.params;
      const reviews = await this.reviewService.getBookReviews(bookId as string);
      res.status(200).json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reviews', error: (error as Error).message });
    }
  };

  public postReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const { bookId } = req.params;
      const { rating, comment } = req.body;

      if (!rating) {
        res.status(400).json({ message: 'Rating is required' });
        return;
      }

      const review = await this.reviewService.addReview(
        userId,
        bookId as string,
        Number(rating),
        comment,
      );
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: 'Failed to post review', error: (error as Error).message });
    }
  };

  public deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // In a real app, verify they own the review or are ADMIN
      const { id } = req.params;
      const deleted = await this.reviewService.removeReview(id as string);
      res.status(200).json(deleted);
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete review', error: (error as Error).message });
    }
  };
}
