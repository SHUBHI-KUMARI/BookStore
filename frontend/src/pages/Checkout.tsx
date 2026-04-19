import { useState } from "react";
import {
  CreditCard,
  Wallet,
  MapPin,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { useCart } from "../hooks/useCart";
import { orderService, type PaymentData } from "../services/orderService";

export const Checkout = () => {
  const { cart, clearCartLocally } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");

  const cartItems = cart?.items.map((item) => ({
    id: item.id,
    bookId: item.book.id,
    title: item.book.title,
    qty: item.quantity,
    price: item.book.price,
  })) ?? [];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const delivery = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + delivery;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Create the order
      const order = await orderService.createOrder();
      setCreatedOrderId(order.id);

      // Process payment
      const paymentData: PaymentData = {
        method: paymentMethod === "credit-card" ? "CREDIT_CARD" : "UPI",
        cardNumber: paymentMethod === "credit-card" ? cardNumber : undefined,
        expiryDate: paymentMethod === "credit-card" ? expiryDate : undefined,
        cvv: paymentMethod === "credit-card" ? cvv : undefined,
        upiId: paymentMethod === "upi" ? upiId : undefined,
      };

      await orderService.payOrder(order.id, paymentData);

      clearCartLocally();
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to process checkout. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
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
            Order #{createdOrderId.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-gray-500 mb-8">
            Thank you for shopping with ReBook. Your order has been placed successfully.
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
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${paymentMethod === "upi" ? "border-emerald-600 bg-emerald-600/5 ring-1 ring-emerald-600" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <Wallet
                      className={`w-6 h-6 ${paymentMethod === "upi" ? "text-emerald-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm font-bold ${paymentMethod === "upi" ? "text-emerald-600" : "text-gray-500"}`}
                    >
                      UPI
                    </span>
                  </button>
                </div>

                {paymentMethod === "credit-card" && (
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-5">
                    <Input
                      label="Card Number"
                      placeholder="0000 0000 0000 0000"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-5">
                      <Input
                        label="Expiration Date"
                        placeholder="MM/YY"
                        required
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                      />
                      <Input
                        label="Security Code (CVV)"
                        placeholder="123"
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-5">
                    <Input
                      label="UPI ID"
                      placeholder="username@bank"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <div className="text-center text-sm text-gray-500 mt-2">
                      Please enter your UPI ID. You will receive a payment request on your UPI app.
                    </div>
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
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-sm">Your cart is empty.</p>
                ) : (
                  cartItems.map((item, idx) => (
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
                  ))
                )}
              </div>

              <hr className="border-dashed border-gray-200 my-6" />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-[var(--color-brand-dark-blue)]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-[var(--color-brand-dark-blue)]">
                    {delivery === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `$${delivery.toFixed(2)}`
                    )}
                  </span>
                </div>

                <hr className="border-gray-200 my-4" />

                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-[var(--color-brand-dark-blue)]">
                    Total
                  </span>
                  <span className="font-black text-2xl text-[var(--color-brand-dark-blue)]">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={cartItems.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
