import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

class BookRoutes {
  public router: Router;
  private bookController: BookController;

  constructor() {
    this.router = Router();
    this.bookController = new BookController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public routes
    this.router.get('/', this.bookController.getAll);
    this.router.get('/:id', this.bookController.getById);

    // Protected Routes: Create Books (Admin -> New, Customer -> Used)
    this.router.post('/', authenticateJWT, this.bookController.createBook);

    // Admin Routes: Handle Resale workflow
    this.router.get(
      '/admin/pending',
      authenticateJWT,
      authorizeRole(['ADMIN']),
      this.bookController.getPendingUsedBooks,
    );
    this.router.patch(
      '/admin/:id/approve',
      authenticateJWT,
      authorizeRole(['ADMIN']),
      this.bookController.approveUsedBook,
    );
  }
}

export default new BookRoutes().router;
