import api from "./api";
import type { Book, Review } from "./bookService";
import type { Order } from "./orderService";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  phone?: string;
  address?: string;
  age?: number;
}

export const userService = {
  async getUserDetails(): Promise<UserProfile> {
    const res = await api.get<UserProfile>("/user");
    return res.data;
  },

  async updateUserDetails(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    age?: string | number;
  }): Promise<UserProfile> {
    const res = await api.put<UserProfile>("/user", data);
    return res.data;
  },

  async getUserListings(): Promise<Book[]> {
    const res = await api.get<Book[]>("/user/listings");
    return res.data;
  },

  async getUserReviews(): Promise<Review[]> {
    const res = await api.get<Review[]>("/user/reviews");
    return res.data;
  },

  async getUserSaved(): Promise<Book[]> {
    const res = await api.get<Book[]>("/user/saved");
    return res.data;
  },

  async getUserOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>("/orders");
    return res.data;
  },
};
