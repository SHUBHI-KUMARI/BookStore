import api from "./api";

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  bookId: string;
  orderId: string;
  book?: {
    id: string;
    title: string;
    author: string;
    image?: string | null;
    isUsed?: boolean;
    condition?: string;
    sellerId?: string | null;
  };
}

export interface Order {
  id: string;
  userId: string;
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paymentNote?: string | null;
  deliveryMethod: string;
  shippingFullName: string;
  shippingEmail: string;
  shippingPhone?: string | null;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  orderNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
}

export interface CheckoutPayload {
  shippingFullName: string;
  shippingEmail: string;
  shippingPhone?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  deliveryMethod: string;
  orderNotes?: string;
}

export interface PaymentData {
  method: "CREDIT_CARD" | "UPI" | "WALLET" | "COD";
  cardNumber?: string;
  upiId?: string;
  walletId?: string;
}

export const orderService = {
  async createOrder(data: CheckoutPayload): Promise<Order> {
    const res = await api.post<Order>("/orders", data);
    return res.data;
  },

  async payOrder(
    orderId: string,
    paymentData: PaymentData,
  ): Promise<{ message: string; order: Order }> {
    const res = await api.post<{ message: string; order: Order }>(
      `/orders/${orderId}/pay`,
      paymentData,
    );
    return res.data;
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const res = await api.put<Order>(`/orders/${orderId}/cancel`);
    return res.data;
  },

  async getUserOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>("/orders");
    return res.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>("/orders/all");
    return res.data;
  },

  async updateOrderStatus(
    orderId: string,
    status: Order["status"],
  ): Promise<Order> {
    const res = await api.put<Order>(`/orders/${orderId}/status`, { status });
    return res.data;
  },
};
