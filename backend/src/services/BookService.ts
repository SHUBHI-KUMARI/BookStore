import { ApprovalStatus, BookCondition, Prisma } from '@prisma/client';
import { BookFactory } from '../utils/BookFactory';
import { BookRepository } from '../repositories/BookRepository';

type BookFilters = {
  query?: string;
  categoryId?: string;
  condition?: BookCondition;
  isUsed?: boolean;
  approvalStatus?: ApprovalStatus;
};

type BookListShape = {
  image?: string | null;
  catalogBook?: { image?: string | null } | null;
  reviews?: Array<{ rating: number }>;
};

export class BookService {
  private bookRepository: BookRepository;

  constructor() {
    this.bookRepository = new BookRepository();
  }

  private resolveImage(book: {
    image?: string | null;
    catalogBook?: { image?: string | null } | null;
  }) {
    return book.image ?? book.catalogBook?.image ?? null;
  }

  private getAverageRating(book: BookListShape) {
    if (!book.reviews?.length) {
      return 0;
    }

    const total = book.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / book.reviews.length).toFixed(1));
  }

  private mapBookList<T extends BookListShape>(book: T) {
    const { catalogBook, reviews, ...rest } = book;

    return {
      ...rest,
      image: this.resolveImage(book),
      averageRating: this.getAverageRating(book),
      reviewCount: reviews?.length ?? 0,
    };
  }

  private ensureValidApprovalStatus(status: ApprovalStatus) {
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      throw new Error('Invalid approval status');
    }
  }

  public async getAllBooks(filters?: BookFilters) {
    const books = await this.bookRepository.findAll(filters);
    return books.map((book) => this.mapBookList(book));
  }

  public async getAdminBooks(filters?: BookFilters) {
    const books = await this.bookRepository.findAdminAll(filters);
    return books.map((book) => this.mapBookList(book));
  }

  public async getBookById(id: string) {
    const book = await this.bookRepository.findById(id);
    if (!book) return null;
    const reviewCount = (book as BookListShape).reviews?.length ?? 0;

    return {
      ...book,
      image: this.resolveImage(book),
      averageRating: this.getAverageRating(book),
      reviewCount,
    };
  }

  public async getBookForManagement(id: string) {
    const book = await this.bookRepository.findByIdForOwnerOrAdmin(id);
    if (!book) return null;
    const reviewCount = (book as BookListShape).reviews?.length ?? 0;

    return {
      ...book,
      image: this.resolveImage(book),
      averageRating: this.getAverageRating(book),
      reviewCount,
    };
  }

  public async getPendingResaleBooks() {
    const books = await this.bookRepository.findPendingResale();
    return books.map((book) => this.mapBookList(book));
  }

  public async getSellerListings(sellerId: string) {
    const books = await this.bookRepository.findBySellerId(sellerId);
    return books.map((book) => this.mapBookList(book));
  }

  public async addNewBook(data: Record<string, string | number>) {
    const payload = BookFactory.createNewBook(data);
    return this.bookRepository.create(payload);
  }

  public async addUsedBook(data: Record<string, string | number>, sellerId: string) {
    const payload = BookFactory.createUsedBook(data, sellerId);
    return this.bookRepository.create(payload);
  }

  public async updateResaleStatus(bookId: string, status: ApprovalStatus) {
    this.ensureValidApprovalStatus(status);
    return this.bookRepository.updateApprovalStatus(bookId, status);
  }

  public async updateBook(
    bookId: string,
    data: Prisma.BookUpdateInput,
    options?: { resetApproval?: boolean },
  ) {
    if (options?.resetApproval) {
      data.approvalStatus = ApprovalStatus.PENDING;
    }

    return this.bookRepository.update(bookId, data);
  }

  public async deleteBook(bookId: string) {
    return this.bookRepository.delete(bookId);
  }
}
