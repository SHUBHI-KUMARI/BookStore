import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware';

class OrderRoutes {
  public router: Router;
  private orderController: OrderController;

  constructor() {
    this.router = Router();
    this.orderController = new OrderController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Both endpoints are protected by standard JWT checks
    this.router.get('/', authenticateJWT, this.orderController.getUserOrders);
    this.router.post('/', authenticateJWT, this.orderController.createOrder);

    // Admin: Fetch all orders
    this.router.get(
      '/all',
      authenticateJWT,
      authorizeRole(['ADMIN']),
      this.orderController.getAllOrders,
    );

    // Protected: Pay for Order (Any Customer can pay for their order)
    this.router.post('/:orderId/pay', authenticateJWT, this.orderController.processPayment);
    this.router.put('/:orderId/cancel', authenticateJWT, this.orderController.cancelOrder);

    // Only Admin can update order statuse (e.g. from PENDING to SHIPPED)
    this.router.put(
      '/:orderId/status',
      authenticateJWT,
      authorizeRole(['ADMIN']),
      this.orderController.updateOrderStatus,
    );
  }
}

export default new OrderRoutes().router;
