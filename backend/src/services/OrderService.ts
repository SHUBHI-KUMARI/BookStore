import { OrderRepository } from '../repositories/OrderRepository';
import { CartRepository } from '../repositories/CartRepository';
import { BookRepository } from '../repositories/BookRepository';
import { PaymentStrategy } from '../interfaces/PaymentStrategy';
import { OrderStatus, PaymentStatus } from '@prisma/client';

import { Order } from '@prisma/client';

export class OrderService {
  private orderRepository: OrderRepository;
  private cartRepository: CartRepository;
  private bookRepository: BookRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.cartRepository = new CartRepository();
    this.bookRepository = new BookRepository();
  }

  public async createOrderFromCart(userId: string): Promise<Order> {
    const cart = await this.cartRepository.findOrCreateCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    let totalAmount = 0;
    const orderItemsData = [];

    // Verify stock and calculate total
    for (const item of cart.items) {
      const book = item.book;
      if (book.stock < item.quantity) {
        throw new Error(`Insufficient stock for book: ${book.title}`);
      }
      totalAmount += book.price * item.quantity;

      orderItemsData.push({
        bookId: book.id,
        quantity: item.quantity,
        price: book.price,
      });
    }

    // Create the order and items
    const order = await this.orderRepository.create({
      userId,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      items: {
        create: orderItemsData,
      },
    });

    // Deduct stock for each item
    for (const item of orderItemsData) {
      await this.bookRepository.updateStock(item.bookId, -item.quantity);
    }

    // Clear the cart
    await this.cartRepository.clearCart(cart.id);

    return order;
  }

  public async processPayment(orderId: string, paymentStrategy: PaymentStrategy): Promise<boolean> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      throw new Error('Order is already paid');
    }

    let success = false;
    try {
      await paymentStrategy.pay(order.totalAmount);
      success = true;
    } catch {
      success = false;
    }

    if (success) {
      await this.orderRepository.updatePaymentStatus(orderId, PaymentStatus.COMPLETED);
      // Automatically confirm the order after payment
      await this.orderRepository.updateStatus(orderId, OrderStatus.SHIPPED);
    } else {
      await this.orderRepository.updatePaymentStatus(orderId, PaymentStatus.FAILED);
    }

    return success;
  }

  public async getAllOrders() {
    return this.orderRepository.findAll();
  }

  public async getUserOrders(userId: string) {
    return this.orderRepository.findByUserId(userId);
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderRepository.updateStatus(orderId, status);
  }
}
