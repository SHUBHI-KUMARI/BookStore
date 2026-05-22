import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  CreditCard,
  MapPin,
  ShieldCheck,
  Truck,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useCart } from "../hooks/useCart";
import {
  orderService,
  type CheckoutPayload,
  type PaymentData,
} from "../services/orderService";
import { userService } from "../services/userService";

const DELIVERY_OPTIONS = [
  { value: "STANDARD", label: "Standard Delivery" },
  { value: "EXPRESS", label: "Express Delivery" },
  { value: "PICKUP", label: "Local Pickup" },
];

const PAYMENT_OPTIONS: Array<{
  id: PaymentData["method"];
  label: string;
  icon: typeof CreditCard;
  accent: string;
}> = [
  {
    id: "CREDIT_CARD",
    label: "Card Mockup",
    icon: CreditCard,
    accent: "border-slate-900 bg-slate-900/5 text-slate-900",
  },
  {
    id: "UPI",
    label: "UPI Mockup",
    icon: Wallet,
    accent: "border-emerald-600 bg-emerald-600/5 text-emerald-600",
  },
  {
    id: "COD",
    label: "Cash on Delivery",
    icon: Truck,
    accent: "border-amber-600 bg-amber-600/5 text-amber-700",
  },
];

export const Checkout = () => {
  const { cart, clearCartLocally, refreshCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentData["method"]>("CREDIT_CARD");
  const [paymentValue, setPaymentValue] = useState("");
  const [checkout, setCheckout] = useState<CheckoutPayload>({
    shippingFullName: "",
    shippingEmail: "",
    shippingPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "United States",
    deliveryMethod: "STANDARD",
    orderNotes: "",
  });

  const cartItems = useMemo(
    () =>
      cart?.items.map((item) => ({
        id: item.id,
        title: item.book.title,
        qty: item.quantity,
        price: item.book.price,
      })) ?? [],
    [cart],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cartItems],
  );
  const shippingFee =
    checkout.deliveryMethod === "PICKUP" || subtotal >= 50
      ? 0
      : checkout.deliveryMethod === "EXPRESS"
        ? 14.99
        : 5.99;
  const total = subtotal + shippingFee;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getUserDetails();
        setCheckout((current) => ({
          ...current,
          shippingFullName: current.shippingFullName || profile.name,
          shippingEmail: current.shippingEmail || profile.email,
          shippingPhone: current.shippingPhone || profile.phone || "",
          shippingAddressLine1:
            current.shippingAddressLine1 || profile.address || "",
        }));
      } catch {
        // Keep manual entry only
      }
    };

    void loadProfile();
  }, []);

  const handleChange =
    (field: keyof CheckoutPayload) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const value = event.target.value;
      setCheckout((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const buildPaymentData = (): PaymentData => {
    if (paymentMethod === "CREDIT_CARD") {
      return {
        method: paymentMethod,
        cardNumber: paymentValue || "4242424242424242",
      };
    }

    if (paymentMethod === "UPI") {
      return {
        method: paymentMethod,
        upiId: paymentValue || "mock@upi",
      };
    }

    return {
      method: paymentMethod,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submitCheckout();
  };

  const submitCheckout = async () => {
    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const order = await orderService.createOrder(checkout);
      const paymentResult = await orderService.payOrder(
        order.id,
        buildPaymentData(),
      );

      setCreatedOrderId(order.id);
      setPaymentReference(paymentResult.order.paymentReference || "");
      clearCartLocally();
      void refreshCart();
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.error ||
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Failed to process checkout. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[var(--color-brand-cream)]/30 min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-xl w-full bg-white p-10 rounded-3xl shadow-xl border border-black/5 text-center">
          <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-serif font-black text-[var(--color-brand-dark-blue)] mb-3">
            Order placed successfully
          </h2>
          <p className="text-[var(--color-brand-brown)] mb-2 font-medium">
            Order #{createdOrderId.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-gray-500 mb-2">
            Your payment was captured through the current mock payment flow.
          </p>
          {paymentReference && (
            <p className="text-sm text-gray-500 mb-8">
              Reference:{" "}
              <span className="font-semibold">{paymentReference}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/dashboard" className="flex-1">
              <Button className="w-full">View Orders</Button>
            </Link>
            <Link to="/books" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
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
            Checkout
          </h1>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <form onSubmit={handleSubmit} className="flex-1 space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-[var(--color-brand-cream)] rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--color-brand-muted-orange)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">
                  Shipping details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <Input
                  label="Full Name"
                  required
                  value={checkout.shippingFullName}
                  onChange={handleChange("shippingFullName")}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={checkout.shippingEmail}
                  onChange={handleChange("shippingEmail")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <Input
                  label="Phone Number"
                  value={checkout.shippingPhone}
                  onChange={handleChange("shippingPhone")}
                />
                <Select
                  label="Delivery Method"
                  value={checkout.deliveryMethod}
                  onChange={handleChange("deliveryMethod")}
                  options={DELIVERY_OPTIONS}
                />
              </div>

              <div className="space-y-5">
                <Input
                  label="Address Line 1"
                  required
                  value={checkout.shippingAddressLine1}
                  onChange={handleChange("shippingAddressLine1")}
                />
                <Input
                  label="Address Line 2"
                  value={checkout.shippingAddressLine2}
                  onChange={handleChange("shippingAddressLine2")}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="City"
                    required
                    value={checkout.shippingCity}
                    onChange={handleChange("shippingCity")}
                  />
                  <Input
                    label="State"
                    required
                    value={checkout.shippingState}
                    onChange={handleChange("shippingState")}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="ZIP / Postal Code"
                    required
                    value={checkout.shippingPostalCode}
                    onChange={handleChange("shippingPostalCode")}
                  />
                  <Input
                    label="Country"
                    required
                    value={checkout.shippingCountry}
                    onChange={handleChange("shippingCountry")}
                  />
                </div>
                <Textarea
                  label="Order Notes"
                  value={checkout.orderNotes}
                  onChange={handleChange("orderNotes")}
                  placeholder="Delivery instructions, pickup notes, or anything the admin should know."
                />
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-[var(--color-brand-cream)] rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[var(--color-brand-muted-orange)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)]">
                    Payment mockup
                  </h2>
                  <p className="text-sm text-gray-500">
                    This demo stores a mock payment reference only. No real
                    charge is made.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {PAYMENT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`p-4 border rounded-2xl text-left transition-colors ${
                      paymentMethod === option.id
                        ? option.accent
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <option.icon className="w-6 h-6 mb-3" />
                    <div className="font-bold">{option.label}</div>
                  </button>
                ))}
              </div>

              {paymentMethod === "CREDIT_CARD" && (
                <Input
                  label="Card Number"
                  value={paymentValue}
                  onChange={(event) => setPaymentValue(event.target.value)}
                  placeholder="4242 4242 4242 4242"
                />
              )}

              {paymentMethod === "UPI" && (
                <Input
                  label="UPI ID"
                  value={paymentValue}
                  onChange={(event) => setPaymentValue(event.target.value)}
                  placeholder="reader@upi"
                />
              )}

              {paymentMethod === "COD" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Cash on delivery is also mocked in this project. The order
                  will still be marked as paid for demo purposes.
                </div>
              )}
            </div>
          </form>

          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-black/5 sticky top-8">
              <h2 className="text-xl font-bold text-[var(--color-brand-dark-blue)] mb-6">
                Order summary
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-sm">Your cart is empty.</p>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <div>
                        <span className="font-bold text-gray-400 mr-2">
                          {item.qty}x
                        </span>
                        <span className="text-[var(--color-brand-dark-blue)] font-medium">
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

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--color-brand-dark-blue)]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-[var(--color-brand-dark-blue)]">
                    {shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg pt-3 border-t border-gray-100">
                  <span className="font-bold text-[var(--color-brand-dark-blue)]">
                    Total
                  </span>
                  <span className="font-black text-2xl text-[var(--color-brand-dark-blue)]">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  void submitCheckout();
                }}
                isLoading={isSubmitting}
                disabled={!cartItems.length}
              >
                Place order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
