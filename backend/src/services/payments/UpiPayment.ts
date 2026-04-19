import { PaymentStrategy } from '../../interfaces/PaymentStrategy';

/**
 * UPI payment strategy — mock implementation for demo/dev.
 * Simulates a successful UPI payment after a short delay.
 */
export class UpiPayment implements PaymentStrategy {
  private upiId: string;

  constructor(upiId: string) {
    this.upiId = upiId;
  }

  public async pay(amount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.upiId && this.upiId.includes('@') && amount > 0) {
          resolve();
        } else {
          reject(new Error('Invalid UPI ID or amount'));
        }
      }, 800);
    });
  }
}
