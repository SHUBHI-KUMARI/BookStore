import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

class CategoryRoutes {
  public router: Router;
  private categoryController: CategoryController;

  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.categoryController.getAll);

    // Only Admin can create categories
    this.router.post(
      '/',
      authenticateJWT,
      authorizeRole(['ADMIN']),
      this.categoryController.create,
    );
  }
}

export default new CategoryRoutes().router;
