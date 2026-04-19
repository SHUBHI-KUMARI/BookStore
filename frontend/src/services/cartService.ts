import api from "./api";
import type { Book } from "./bookService";

export interface CartItem {
  id: string;
  quantity: number;
  bookId: string;
  cartId: string;
  book: Book;
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await api.get<Cart>("/cart");
    return res.data;
  },

  async addToCart(bookId: string, quantity: number): Promise<Cart> {
    const res = await api.post<Cart>("/cart", { bookId, quantity });
    return res.data;
  },

  async updateItem(bookId: string, quantity: number): Promise<Cart> {
    const res = await api.put<Cart>(`/cart/items/${bookId}`, { quantity });
    return res.data;
  },

  async removeItem(bookId: string): Promise<Cart> {
    const res = await api.delete<Cart>(`/cart/items/${bookId}`);
    return res.data;
  },
};
