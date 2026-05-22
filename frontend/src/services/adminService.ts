import api from "./api";
import {
  bookService,
  type Book,
  type BookFilters,
  type BookPayload,
} from "./bookService";
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
  async getAllBooks(filters?: BookFilters): Promise<Book[]> {
    return bookService.getAdminBooks(filters);
  },

  async getPendingBooks(): Promise<Book[]> {
    return bookService.getPendingBooks();
  },

  async approveBook(
    id: string,
    status: "APPROVED" | "REJECTED",
  ): Promise<{ book: Book; message: string }> {
    return bookService.approveBook(id, status);
  },

  async addBook(data: BookPayload): Promise<Book> {
    return bookService.createBook(data);
  },

  async updateBook(id: string, data: Partial<BookPayload>): Promise<Book> {
    return bookService.updateBook(id, data);
  },

  async deleteBook(id: string): Promise<{ message: string }> {
    return bookService.deleteBook(id);
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

  async getAllUsers(): Promise<AdminUser[]> {
    const res = await api.get<AdminUser[]>("/user/all");
    return res.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/user/${id}`);
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get<Category[]>("/categories");
    return res.data;
  },

  async createCategory(name: string, description?: string): Promise<Category> {
    const res = await api.post<Category>("/categories", { name, description });
    return res.data;
  },
};
