import { OrderStatus, PaymentStatus } from '@prisma/client';
import { BookRepository } from '../repositories/BookRepository';
import { CartRepository } from '../repositories/CartRepository';
import { OrderRepository } from '../repositories/OrderRepository';

export type CheckoutPayload = {
  shippingFullName: string;
  shippingEmail: string;
  shippingPhone?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  deliveryMethod?: string;
  orderNotes?: string;
};

export type MockPaymentPayload = {
  method: 'CREDIT_CARD' | 'UPI' | 'WALLET' | 'COD';
  cardNumber?: string;
  upiId?: string;
  walletId?: string;
};

export class OrderService {
  private orderRepository: OrderRepository;
  private cartRepository: CartRepository;
  private bookRepository: BookRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.cartRepository = new CartRepository();
    this.bookRepository = new BookRepository();
  }

  private ensureCheckoutPayload(payload: CheckoutPayload) {
    const requiredFields = [
      payload.shippingFullName,
      payload.shippingEmail,
      payload.shippingAddressLine1,
      payload.shippingCity,
      payload.shippingState,
      payload.shippingPostalCode,
      payload.shippingCountry,
    ];

    if (requiredFields.some((value) => !value || !value.trim())) {
      throw new Error('Complete shipping details are required');
    }
  }

  private ensureCanUpdateToStatus(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
    paymentStatus: PaymentStatus,
  ) {
    if (currentStatus === OrderStatus.CANCELLED || currentStatus === OrderStatus.DELIVERED) {
      throw new Error('This order can no longer be updated');
    }

    if (nextStatus === OrderStatus.SHIPPED && paymentStatus !== PaymentStatus.COMPLETED) {
      throw new Error('Only paid orders can be shipped');
    }
  }

  private async restoreStock(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    for (const item of order.items) {
      await this.bookRepository.updateStock(item.bookId, item.quantity);
    }
  }

  public async createOrderFromCart(userId: string, checkout: CheckoutPayload) {
    this.ensureCheckoutPayload(checkout);

    const cart = await this.cartRepository.findOrCreateCart(userId);

    if (!cart.items?.length) {
      throw new Error('Cart is empty');
    }

    let subtotalAmount = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const book = item.book;

      if (book.isUsed && book.approvalStatus !== 'APPROVED') {
        throw new Error(`Listing "${book.title}" is not available for purchase`);
      }

      if (book.stock < item.quantity) {
        throw new Error(`Insufficient stock for book: ${book.title}`);
      }

      subtotalAmount += book.price * item.quantity;
      orderItemsData.push({
        bookId: book.id,
        quantity: item.quantity,
        price: book.price,
      });
    }

    const deliveryMethod = checkout.deliveryMethod?.trim() || 'STANDARD';
    const shippingFee = subtotalAmount >= 50 || deliveryMethod === 'PICKUP' ? 0 : 5.99;
    const totalAmount = Number((subtotalAmount + shippingFee).toFixed(2));

    const order = await this.orderRepository.create({
      userId,
      subtotalAmount,
      shippingFee,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      deliveryMethod,
      shippingFullName: checkout.shippingFullName,
      shippingEmail: checkout.shippingEmail,
      shippingPhone: checkout.shippingPhone,
      shippingAddressLine1: checkout.shippingAddressLine1,
      shippingAddressLine2: checkout.shippingAddressLine2,
      shippingCity: checkout.shippingCity,
      shippingState: checkout.shippingState,
      shippingPostalCode: checkout.shippingPostalCode,
      shippingCountry: checkout.shippingCountry,
      orderNotes: checkout.orderNotes,
      items: {
        create: orderItemsData,
      },
    });

    for (const item of orderItemsData) {
      await this.bookRepository.updateStock(item.bookId, -item.quantity);
    }

    await this.cartRepository.clearCart(cart.id);

    return order;
  }

  public async processPayment(orderId: string, userId: string, payment: MockPaymentPayload) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('You can only pay for your own orders');
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      throw new Error('Order is already paid');
    }

    if (!payment.method) {
      throw new Error('Payment method is required');
    }

    const reference = `MOCK-${Date.now().toString(36).toUpperCase()}`;
    const descriptor =
      payment.method === 'CREDIT_CARD'
        ? `Card ending ${payment.cardNumber?.slice(-4) || '4242'}`
        : payment.method === 'UPI'
          ? `UPI ${payment.upiId || 'mock@upi'}`
          : payment.method === 'WALLET'
            ? `Wallet ${payment.walletId || 'MOCK-WALLET'}`
            : 'Cash on delivery';

    return this.orderRepository.update(orderId, {
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: payment.method,
      paymentReference: reference,
      paymentNote: `Mock payment accepted via ${descriptor}`,
      status: OrderStatus.PROCESSING,
    });
  }

  public async getAllOrders() {
    return this.orderRepository.findAll();
  }

  public async getUserOrders(userId: string) {
    return this.orderRepository.findByUserId(userId);
  }

  public async cancelOrder(orderId: string, userId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('You can only cancel your own orders');
    }

    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new Error('This order can no longer be cancelled');
    }

    await this.restoreStock(orderId);

    return this.orderRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
      paymentStatus:
        order.paymentStatus === PaymentStatus.COMPLETED
          ? PaymentStatus.REFUNDED
          : PaymentStatus.FAILED,
      paymentNote:
        order.paymentStatus === PaymentStatus.COMPLETED
          ? 'Mock refund issued after cancellation'
          : 'Order cancelled before payment completion',
    });
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    this.ensureCanUpdateToStatus(order.status, status, order.paymentStatus);

    if (status === OrderStatus.CANCELLED) {
      await this.restoreStock(orderId);
      return this.orderRepository.update(orderId, {
        status,
        paymentStatus:
          order.paymentStatus === PaymentStatus.COMPLETED
            ? PaymentStatus.REFUNDED
            : order.paymentStatus,
        paymentNote:
          order.paymentStatus === PaymentStatus.COMPLETED
            ? 'Mock refund issued by admin after cancellation'
            : order.paymentNote,
      });
    }

    return this.orderRepository.updateStatus(orderId, status);
  }
}
