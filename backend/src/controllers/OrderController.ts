import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { OrderService } from '../services/OrderService';
import { OrderStatus } from '@prisma/client';
import { CreditCardPayment } from '../services/payments/CreditCardPayment';
import { UpiPayment } from '../services/payments/UpiPayment';
import { WalletPayment } from '../services/payments/WalletPayment';
import { PaymentStrategy } from '../interfaces/PaymentStrategy';

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

      const order = await this.orderService.createOrderFromCart(userId);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create order', error: (error as Error).message });
    }
  };

  public getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
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

  /**
   * Process payment for a specific order.
   * Accepts `method` field to select payment strategy: CREDIT_CARD | UPI | WALLET
   */
  public processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const { method, cardNumber, expiryDate, cvv, upiId, walletId } = req.body;

      let strategy: PaymentStrategy;

      switch ((method as string)?.toUpperCase()) {
        case 'UPI':
          if (!upiId) {
            res.status(400).json({ message: 'UPI ID is required for UPI payment' });
            return;
          }
          strategy = new UpiPayment(upiId);
          break;
        case 'WALLET':
          if (!walletId) {
            res.status(400).json({ message: 'Wallet ID is required for wallet payment' });
            return;
          }
          strategy = new WalletPayment(walletId);
          break;
        case 'CREDIT_CARD':
        default:
          if (!cardNumber || !expiryDate || !cvv) {
            res.status(400).json({ message: 'Card details are required for credit card payment' });
            return;
          }
          strategy = new CreditCardPayment(cardNumber, expiryDate, cvv);
          break;
      }

      const success = await this.orderService.processPayment(orderId as string, strategy);
      if (success) {
        res.status(200).json({ message: 'Payment successful, order shipped' });
      } else {
        res.status(400).json({ message: 'Payment failed' });
      }
    } catch (error) {
      res.status(400).json({ message: 'Payment error', error: (error as Error).message });
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
