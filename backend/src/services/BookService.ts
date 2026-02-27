import { BookRepository } from '../repositories/BookRepository';
import { BookFactory } from '../utils/BookFactory';
import { BookCondition, ApprovalStatus } from '@prisma/client';

export class BookService {
  private bookRepository: BookRepository;

  constructor() {
    this.bookRepository = new BookRepository();
  }

  public async getAllBooks(filters?: {
    query?: string;
    categoryId?: string;
    condition?: BookCondition;
    isUsed?: boolean;
  }) {
    return this.bookRepository.findAll(filters);
  }

  public async getBookById(id: string) {
    const book = await this.bookRepository.findById(id);
    if (!book) return null;

    // Average rating
    let averageRating = 0;
    if (book.reviews && book.reviews.length > 0) {
      const sum = book.reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = Number((sum / book.reviews.length).toFixed(1));
    }

    return {
      ...book,
      averageRating,
    };
  }

  public async getPendingResaleBooks() {
    // Requires a new method in BookRepo, mockup for now
    return this.bookRepository.findPendingResale();
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
    return this.bookRepository.updateApprovalStatus(bookId, status);
  }
}
