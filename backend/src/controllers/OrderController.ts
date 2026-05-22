import { OrderStatus } from '@prisma/client';
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { OrderService } from '../services/OrderService';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  public createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'User ID is missing from token' });
        return;
      }

      const order = await this.orderService.createOrderFromCart(userId, req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create order', error: (error as Error).message });
    }
  };

  public getAllOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orders = await this.orderService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to fetch all orders', error: (error as Error).message });
    }
  };

  public getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'User ID is missing from token' });
        return;
      }

      const orders = await this.orderService.getUserOrders(userId);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders', error: (error as Error).message });
    }
  };

  public processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { orderId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'User ID is missing from token' });
        return;
      }

      const order = await this.orderService.processPayment(orderId as string, userId, req.body);
      res.status(200).json({
        message: 'Mock payment completed successfully',
        order,
      });
    } catch (error) {
      res.status(400).json({ message: 'Payment error', error: (error as Error).message });
    }
  };

  public cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'User ID is missing from token' });
        return;
      }

      const order = await this.orderService.cancelOrder(req.params.orderId as string, userId);
      res.status(200).json(order);
    } catch (error) {
      res.status(400).json({ message: 'Failed to cancel order', error: (error as Error).message });
    }
  };

  public updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const updatedOrder = await this.orderService.updateOrderStatus(
        orderId as string,
        status as OrderStatus,
      );
      res.status(200).json(updatedOrder);
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Failed to update order status', error: (error as Error).message });
    }
  };
}
