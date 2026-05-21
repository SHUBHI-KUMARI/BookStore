import api from "./api";

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  image?: string | null;
  isbn13?: string | null;
  isbn10?: string | null;
  publisher?: string | null;
  language?: string | null;
  publishedAt?: string | null;
  description?: string | null;
  isUsed: boolean;
  condition: "NEW" | "GOOD" | "FAIR" | "POOR";
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  categoryId: string;
  sellerId?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string };
  seller?: { id: string; name: string; email: string } | null;
  reviews?: Review[];
  averageRating?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { id: string; name: string };
}

export interface BookFilters {
  q?: string;
  category?: string;
  condition?: string;
  isUsed?: boolean;
}

export const bookService = {
  async getAll(filters?: BookFilters): Promise<Book[]> {
    const params = new URLSearchParams();
    if (filters?.q) params.append("q", filters.q);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.condition) params.append("condition", filters.condition);
    if (filters?.isUsed !== undefined)
      params.append("isUsed", String(filters.isUsed));
    const res = await api.get<Book[]>(`/books?${params.toString()}`);
    return res.data;
  },

  async getById(id: string): Promise<Book> {
    const res = await api.get<Book>(`/books/${id}`);
    return res.data;
  },

  async createBook(data: Record<string, unknown>): Promise<Book> {
    const res = await api.post<Book>("/books", data);
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
};
