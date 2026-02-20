import { PaymentStrategy } from '../interfaces/PaymentStrategy';

export class OrderItem {
  private bookId: string;
  private quantity: number;
  private price: number;

  constructor(bookId: string, quantity: number, price: number) {
    this.bookId = bookId;
    this.quantity = quantity;
    this.price = price;
  }

  public getSubtotal(): number {
    return this.quantity * this.price;
  }
}

export class Order {
  private id: string;
  private userId: string;
  private status: string;
  private totalAmount: number;
  private items: OrderItem[];
  private paymentStrategy: PaymentStrategy | null;

  constructor(id: string, userId: string, totalAmount: number) {
    this.id = id;
    this.userId = userId;
    this.status = 'Pending';
    this.totalAmount = totalAmount;
    this.items = [];
    this.paymentStrategy = null;
  }

  public createOrder(): void {
    console.log(
      `Order ${this.id} created for user ${this.userId} with total amount ${this.totalAmount}.`,
    );
  }

  public updateStatus(newStatus: string): void {
    this.status = newStatus;
    console.log(`Order ${this.id} status updated to ${newStatus}.`);
  }

  public setPaymentStrategy(strategy: PaymentStrategy): void {
    this.paymentStrategy = strategy;
  }

  public processPayment(): void {
    if (this.paymentStrategy) {
      this.paymentStrategy.pay(this.totalAmount);
    } else {
      console.log('No payment strategy specified.');
    }
  }
}
