import { Router } from 'express';
import { CartController } from '../controllers/CartController';
import { authenticateJWT } from '../middlewares/authMiddleware';

class CartRoutes {
  public router: Router;
  private cartController: CartController;

  constructor() {
    this.router = Router();
    this.cartController = new CartController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', authenticateJWT, this.cartController.getCart);
    this.router.post('/', authenticateJWT, this.cartController.addToCart);
    this.router.put('/items/:bookId', authenticateJWT, this.cartController.updateCartItem);
    this.router.delete('/items/:bookId', authenticateJWT, this.cartController.removeCartItem);
  }
}

export default new CartRoutes().router;
