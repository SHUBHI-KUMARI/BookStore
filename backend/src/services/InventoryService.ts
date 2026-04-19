import { BookRepository } from '../repositories/BookRepository';

/**
 * InventoryService — wired to real BookRepository for stock checks and reductions.
 * Used internally by OrderService to validate and update stock during order placement.
 */
export class InventoryService {
  private bookRepository: BookRepository;

  constructor() {
    this.bookRepository = new BookRepository();
  }

  /**
   * Check whether a book has enough stock for the requested quantity.
   */
  public async checkStock(bookId: string, quantity: number): Promise<boolean> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) throw new Error(`Book ${bookId} not found`);
    return book.stock >= quantity;
  }

  /**
   * Reduce a book's stock after a successful order.
   * Delegates to updateStock which uses Prisma's atomic increment.
   */
  public async reduceStock(bookId: string, quantity: number): Promise<void> {
    const hasStock = await this.checkStock(bookId, quantity);
    if (!hasStock) {
      throw new Error(`Insufficient stock for book ${bookId}`);
    }
    // Negative quantity to decrement
    await this.bookRepository.updateStock(bookId, -quantity);
  }
}
