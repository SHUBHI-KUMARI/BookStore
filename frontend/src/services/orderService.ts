import api from "./api";

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  bookId: string;
  orderId: string;
  book?: { id: string; title: string; author: string };
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
}

export interface PaymentData {
  method: "CREDIT_CARD" | "UPI" | "WALLET";
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
  walletId?: string;
}

export const orderService = {
  async createOrder(): Promise<Order> {
    const res = await api.post<Order>("/orders");
    return res.data;
  },

  async payOrder(
    orderId: string,
    paymentData: PaymentData,
  ): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(
      `/orders/${orderId}/pay`,
      paymentData,
    );
    return res.data;
  },

  async getUserOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>("/orders");
    return res.data;
  },

  // Admin only
  async getAllOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>("/orders/all");
    return res.data;
  },

  // Admin only
  async updateOrderStatus(
    orderId: string,
    status: Order["status"],
  ): Promise<Order> {
    const res = await api.put<Order>(`/orders/${orderId}/status`, { status });
    return res.data;
  },
};
