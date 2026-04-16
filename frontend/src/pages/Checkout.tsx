import { useState } from "react";
import {
  CreditCard,
  Wallet,
  MapPin,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";

// Mock summary data to keep it self-contained
const ORDER_SUMMARY = {
  subtotal: 30.19,
  delivery: 5.99,
  total: 36.18,
  items: [
    { title: "The Midnight Library", qty: 1, price: 18.99 },
    { title: "Project Hail Mary", qty: 1, price: 11.2 },
  ],
};

export const Checkout = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API checkout
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="bg-[var(--color-brand-cream)]/30 min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-xl border border-black/5 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-serif font-black text-[var(--color-brand-dark-blue)] mb-3">
            Order Confirmed!
          </h2>
          <p className="text-[var(--color-brand-brown)] mb-2 font-medium">
            Order #RB-948210
          </p>
          <p className="text-gray-500 mb-8">
            Thank you for shopping with ReBook. We've sent a confirmation email
            with your order details and tracking information.
          </p>
          <Link to="/books" className="w-full">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-black/5 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/cart"
            className="flex items-center text-sm font-bold text-[var(--color-brand-brown)] hover:text-[var(--color-brand-dark-blue)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Cart
          </Link>
          <h1 className="text-2xl font-serif font-black text-[var(--color-brand-dark-blue)] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Secure Checkout
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT: CHECKOUT FORMS */}
          <div className="flex-1">
            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Section 1: Shipping */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-black/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-[var(--color-brand-cream)] rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[var(--color-brand-muted-orange)]" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">
                    Shipping Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <Input label="First Name" required placeholder="John" />
                  <Input label="Last Name" required placeholder="Doe" />
                </div>

                <div className="mb-5">
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className="mb-5">
                  <Input
                    label="Street Address"
                    required
                    placeholder="123 Main St, Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Input
                    label="City"
                    required
                    placeholder="New York"
                    className="md:col-span-1"
                  />
                  <Select
                    label="State/Province"
                    required
                    options={[
                      { value: "NY", label: "New York" },
                      { value: "CA", label: "California" },
                      { value: "TX", label: "Texas" },
                    ]}
                    className="md:col-span-1"
                  />
                  <Input
                    label="ZIP / Postal Code"
                    required
                    placeholder="10001"
                    className="md:col-span-1"
                  />
                </div>
              </div>

              {/* Section 2: Delivery Method */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-black/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-[var(--color-brand-cream)] rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[var(--color-brand-muted-orange)]" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">
                    Delivery Method
                  </h2>
                </div>

                <div className="space-y-4">
                  <label
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors border-[var(--color-brand-muted-orange)] bg-[var(--color-brand-muted-orange)]/5`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        defaultChecked
                        className="w-4 h-4 text-[var(--color-brand-muted-orange)] border-gray-300 focus:ring-[var(--color-brand-muted-orange)]"
                      />
                      <div>
                        <p className="font-bold text-[var(--color-brand-dark-blue)]">
                          Standard Delivery
                        </p>
                        <p className="text-sm text-gray-500">
                          3-5 business days
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[var(--color-brand-dark-blue)]">
                      $5.99
                    </span>
                  </label>
                </div>
              </div>

              {/* Section 3: Payment */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-black/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-[var(--color-brand-cream)] rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[var(--color-brand-muted-orange)]" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">
                    Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit-card")}
                    className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-colors ${paymentMethod === "credit-card" ? "border-[var(--color-brand-dark-blue)] bg-[var(--color-brand-dark-blue)]/5 ring-1 ring-[var(--color-brand-dark-blue)]" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <CreditCard
                      className={`w-6 h-6 ${paymentMethod === "credit-card" ? "text-[var(--color-brand-dark-blue)]" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm font-bold ${paymentMethod === "credit-card" ? "text-[var(--color-brand-dark-blue)]" : "text-gray-500"}`}
                    >
                      Credit Card
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paypal")}
                    className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-colors ${paymentMethod === "paypal" ? "border-[#003087] bg-[#003087]/5 ring-1 ring-[#003087]" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    {/* Mock PayPal Icon Text */}
                    <div className="font-black italic text-xl">
                      <span className="text-[#003087]">Pay</span>
                      <span className="text-[#009cde]">Pal</span>
                    </div>
                    <span
                      className={`text-sm font-bold ${paymentMethod === "paypal" ? "text-[#003087]" : "text-gray-500"}`}
                    >
                      PayPal
                    </span>
                  </button>
                </div>

                {paymentMethod === "credit-card" && (
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-5">
                    <Input
                      label="Card Number"
                      placeholder="0000 0000 0000 0000"
                      required
                    />
                    <div className="grid grid-cols-2 gap-5">
                      <Input
                        label="Expiration Date"
                        placeholder="MM/YY"
                        required
                      />
                      <Input
                        label="Security Code (CVV)"
                        placeholder="123"
                        required
                      />
                    </div>
                    <Input
                      label="Name on Card"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl text-center text-sm text-gray-600">
                    You will be redirected to PayPal to complete your secure
                    transaction.
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT: ORDER SUMMARY PANEL */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-black/5 sticky top-8">
              <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)] mb-6">
                Review Order
              </h2>

              {/* Items List Mini */}
              <div className="space-y-4 mb-6">
                {ORDER_SUMMARY.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-4 text-sm">
                    <div className="flex gap-2">
                      <span className="font-bold text-gray-400">
                        {item.qty}x
                      </span>
                      <span className="text-[var(--color-brand-dark-blue)] font-medium line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[var(--color-brand-brown)]">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-dashed border-gray-200 my-6" />

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-[var(--color-brand-dark-blue)]">
                    ${ORDER_SUMMARY.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-[var(--color-brand-dark-blue)]">
                    ${ORDER_SUMMARY.delivery.toFixed(2)}
                  </span>
                </div>

                <hr className="border-gray-200 my-4" />

                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-[var(--color-brand-dark-blue)]">
                    Total
                  </span>
                  <span className="font-black text-2xl text-[var(--color-brand-dark-blue)]">
                    ${ORDER_SUMMARY.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                {`Pay $${ORDER_SUMMARY.total.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
