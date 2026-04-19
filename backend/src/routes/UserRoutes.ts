import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

class UserRoutes {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Current user routes
    this.router.get('/', authenticateJWT, this.userController.getUserDetails);
    this.router.put('/', authenticateJWT, this.userController.updateUserDetails);
    this.router.get('/listings', authenticateJWT, this.userController.getUserListings);
    this.router.get('/reviews', authenticateJWT, this.userController.getUserReviews);
    this.router.get('/saved', authenticateJWT, this.userController.getSavedBooks);

    // Admin routes
    this.router.get(
      '/all',
      authenticateJWT,
      authorizeRole(['ADMIN']),
      this.userController.getAllUsers,
    );
    this.router.delete(
      '/:id',
      authenticateJWT,
      authorizeRole(['ADMIN']),
      this.userController.deleteUser,
    );
  }
}

export default new UserRoutes().router;
