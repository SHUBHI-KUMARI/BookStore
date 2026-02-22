import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BookService } from '../services/BookService';

export class BookController {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  public getAll = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const books = await this.bookService.getAllBooks();
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching books', error: (error as Error).message });
    }
  };

  public getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const book = await this.bookService.getBookById(req.params.id);
      if (!book) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }
      res.status(200).json(book);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching book', error: (error as Error).message });
    }
  };

  public createBook = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // By default here, if the user is Admin it creates a new Book
      if (req.user?.role === 'ADMIN') {
        const book = await this.bookService.addNewBook(req.body);
        res.status(201).json(book);
      } else if (req.user?.role === 'CUSTOMER') {
        // Customer listing a used book
        const book = await this.bookService.addUsedBook(req.body, req.user.userId);
        res.status(201).json({ message: 'Used book submitted for approval', book });
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    } catch (error) {
      res.status(400).json({ message: 'Failed to create book', error: (error as Error).message });
    }
  };

  public getPendingUsedBooks = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const books = await this.bookService.getPendingResaleBooks();
      res.status(200).json(books);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching pending books', error: (error as Error).message });
    }
  };

  public approveUsedBook = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.body; // e.g. "APPROVED" or "REJECTED"
      const book = await this.bookService.updateResaleStatus(req.params.id, status);
      res.status(200).json({ message: `Book marked as ${status}`, book });
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Failed to update book status', error: (error as Error).message });
    }
  };
}
