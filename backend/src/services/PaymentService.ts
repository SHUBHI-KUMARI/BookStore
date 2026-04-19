/**
 * PaymentService — re-exports all payment strategy implementations.
 * Individual strategy files live in the payments/ subdirectory.
 * Import from this file for a single, clean entry-point.
 */
export { CreditCardPayment } from './payments/CreditCardPayment';
export { UpiPayment } from './payments/UpiPayment';
export { WalletPayment } from './payments/WalletPayment';
