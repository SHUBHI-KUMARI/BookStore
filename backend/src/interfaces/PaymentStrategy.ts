export interface PaymentStrategy {
  pay(amount: number): Promise<void>;
}
