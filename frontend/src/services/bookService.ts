import api from "./api";

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { id: string; name: string };
  book?: { id: string; title: string; author: string };
}

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
  sellerNotes?: string | null;
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
  reviewCount?: number;
}

export interface BookFilters {
  q?: string;
  category?: string;
  condition?: string;
  isUsed?: boolean;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

export interface BookPayload {
  title: string;
  author: string;
  categoryId: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  condition?: Book["condition"];
  sellerNotes?: string;
}

const buildParams = (filters?: BookFilters) => {
  const params = new URLSearchParams();

  if (filters?.q) params.append("q", filters.q);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.condition) params.append("condition", filters.condition);
  if (filters?.isUsed !== undefined)
    params.append("isUsed", String(filters.isUsed));
  if (filters?.approvalStatus)
    params.append("approvalStatus", filters.approvalStatus);

  return params.toString();
};

export const bookService = {
  async getAll(filters?: BookFilters): Promise<Book[]> {
    const query = buildParams(filters);
    const res = await api.get<Book[]>(`/books${query ? `?${query}` : ""}`);
    return res.data;
  },

  async getAdminBooks(filters?: BookFilters): Promise<Book[]> {
    const query = buildParams(filters);
    const res = await api.get<Book[]>(
      `/books/admin/all${query ? `?${query}` : ""}`,
    );
    return res.data;
  },

  async getById(id: string): Promise<Book> {
    const res = await api.get<Book>(`/books/${id}`);
    return res.data;
  },

  async createBook(data: BookPayload): Promise<Book> {
    const res = await api.post<Book>("/books", data);
    return res.data;
  },

  async updateBook(id: string, data: Partial<BookPayload>): Promise<Book> {
    const res = await api.patch<Book>(`/books/${id}`, data);
    return res.data;
  },

  async deleteBook(id: string): Promise<{ message: string }> {
    const res = await api.delete<{ message: string }>(`/books/${id}`);
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
