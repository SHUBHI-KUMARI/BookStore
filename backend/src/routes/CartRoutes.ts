import { Router } from 'express';
import { CartController } from '../controllers/CartController';

class CartRoutes {
  public router: Router;
  private cartController: CartController;

  constructor() {
    this.router = Router();
    this.cartController = new CartController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.cartController.getCart);
    this.router.post('/', this.cartController.addToCart);
  }
}

export default new CartRoutes().router;
