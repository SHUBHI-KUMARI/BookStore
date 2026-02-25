import { PaymentStrategy } from '../interfaces/PaymentStrategy';

export class CreditCardPayment implements PaymentStrategy {
  public async pay(amount: number): Promise<void> {
    console.log(`Processing credit card payment of $${amount}`);
  }
}

export class UpiPayment implements PaymentStrategy {
  public async pay(amount: number): Promise<void> {
    console.log(`Processing UPI payment of $${amount}`);
  }
}

export class WalletPayment implements PaymentStrategy {
  public async pay(amount: number): Promise<void> {
    console.log(`Processing Wallet payment of $${amount}`);
  }
}
