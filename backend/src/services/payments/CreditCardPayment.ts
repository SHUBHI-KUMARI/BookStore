import { PaymentStrategy } from '../../interfaces/PaymentStrategy';

export class CreditCardPayment implements PaymentStrategy {
  private cardNumber: string;
  private expiryDate: string;
  private cvv: string;

  constructor(cardNumber: string, expiryDate: string, cvv: string) {
    this.cardNumber = cardNumber;
    this.expiryDate = expiryDate;
    this.cvv = cvv;
  }

  public async pay(amount: number): Promise<void> {
    // Mock processing...
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.cardNumber.length >= 10 && amount > 0) {
          resolve(); // Success
        } else {
          reject(new Error('Invalid credit card details or amount'));
        }
      }, 1000); // 1-second delay mocking API
    });
  }
}
