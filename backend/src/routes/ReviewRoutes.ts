import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

class ReviewRoutes {
  public router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.router = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public: Fetch reviews for a particular book
    this.router.get('/:bookId', this.reviewController.getReviews);

    // Protected: Post a review
    this.router.post('/:bookId', authenticateJWT, this.reviewController.postReview);

    // Protected: Delete review (only admin in this simplified version)
    this.router.delete(
      '/:id',
      authenticateJWT,
      authorizeRole(['ADMIN']),
      this.reviewController.deleteReview,
    );
  }
}

export default new ReviewRoutes().router;
