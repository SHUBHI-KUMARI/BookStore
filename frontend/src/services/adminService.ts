import api from "./api";
import type { Book } from "./bookService";
import type { Order } from "./orderService";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  _count?: { orders: number; reviews: number; listedBooks: number };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const adminService = {
  // --- Books ---
  async getAllBooks(): Promise<Book[]> {
    const res = await api.get<Book[]>("/books");
    return res.data;
  },

  async getPendingBooks(): Promise<Book[]> {
    const res = await api.get<Book[]>("/books/admin/pending");
    return res.data;
  },

  async approveBook(
    id: string,
    status: "APPROVED" | "REJECTED",
  ): Promise<{ book: Book; message: string }> {
    const res = await api.patch<{ book: Book; message: string }>(
      `/books/admin/${id}/approve`,
      { status },
    );
    return res.data;
  },

  async addBook(data: Record<string, unknown>): Promise<Book> {
    const res = await api.post<Book>("/books", data);
    return res.data;
  },

  // --- Orders ---
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

  // --- Users ---
  async getAllUsers(): Promise<AdminUser[]> {
    const res = await api.get<AdminUser[]>("/user/all");
    return res.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/user/${id}`);
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    const res = await api.get<Category[]>("/categories");
    return res.data;
  },

  async createCategory(name: string, description?: string): Promise<Category> {
    const res = await api.post<Category>("/categories", { name, description });
    return res.data;
  },
};
