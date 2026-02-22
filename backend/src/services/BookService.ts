import { BookRepository } from '../repositories/BookRepository';
import { BookFactory } from '../utils/BookFactory';

export class BookService {
  private bookRepository: BookRepository;

  constructor() {
    this.bookRepository = new BookRepository();
  }

  public async getAllBooks() {
    return this.bookRepository.findAll();
  }

  public async getBookById(id: string) {
    return this.bookRepository.findById(id);
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

  public async updateResaleStatus(bookId: string, status: string) {
    return this.bookRepository.updateApprovalStatus(bookId, status);
  }
}
