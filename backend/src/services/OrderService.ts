import { Order } from '../models/Order';
import { PaymentStrategy } from '../interfaces/PaymentStrategy';

export class OrderService {
  public createOrder(userId: string, totalAmount: number): Order {
    const newOrder = new Order(new Date().getTime().toString(), userId, totalAmount);
    newOrder.createOrder();
    return newOrder;
  }

  public processPayment(order: Order, paymentStrategy: PaymentStrategy): void {
    order.setPaymentStrategy(paymentStrategy);
    order.processPayment();
  }
}
