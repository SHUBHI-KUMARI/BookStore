import { PaymentStrategy } from '../../interfaces/PaymentStrategy';

/**
 * Wallet payment strategy — mock implementation for demo/dev.
 * Simulates a successful wallet payment after a short delay.
 */
export class WalletPayment implements PaymentStrategy {
  private walletId: string;

  constructor(walletId: string) {
    this.walletId = walletId;
  }

  public async pay(amount: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.walletId && amount > 0) {
          resolve();
        } else {
          reject(new Error('Invalid wallet ID or amount'));
        }
      }, 600);
    });
  }
}
