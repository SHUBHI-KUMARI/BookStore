import { Prisma, BookCondition, ApprovalStatus } from '@prisma/client';
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BookService } from '../services/BookService';

export class BookController {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  private buildFilters(req: AuthRequest) {
    return {
      query: req.query.q as string,
      categoryId: req.query.category as string,
      condition: req.query.condition as BookCondition,
      isUsed: req.query.isUsed ? req.query.isUsed === 'true' : undefined,
      approvalStatus: req.query.approvalStatus as ApprovalStatus,
    };
  }

  private buildUpdatePayload(req: AuthRequest) {
    const {
      title,
      author,
      price,
      stock,
      categoryId,
      condition,
      description,
      image,
      sellerNotes,
      approvalStatus,
    } = req.body as Record<string, string | number | undefined>;

    const data: Prisma.BookUpdateInput = {};

    if (title !== undefined) data.title = String(title);
    if (author !== undefined) data.author = String(author);
    if (price !== undefined) data.price = Number(price);
    if (stock !== undefined) data.stock = Number(stock);
    if (description !== undefined) data.description = String(description);
    if (image !== undefined) data.image = String(image);
    if (sellerNotes !== undefined) data.sellerNotes = String(sellerNotes);
    if (condition !== undefined) data.condition = condition as BookCondition;

    if (categoryId) {
      data.category = {
        connect: { id: String(categoryId) },
      };
    }

    if (req.user?.role === 'ADMIN' && approvalStatus) {
      data.approvalStatus = approvalStatus as ApprovalStatus;
    }

    return data;
  }

  public getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const books = await this.bookService.getAllBooks(this.buildFilters(req));
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching books', error: (error as Error).message });
    }
  };

  public getAdminBooks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const books = await this.bookService.getAdminBooks(this.buildFilters(req));
      res.status(200).json(books);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching admin books', error: (error as Error).message });
    }
  };

  public getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const book = await this.bookService.getBookById(req.params.id as string);
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
      if (req.user?.role === 'ADMIN') {
        const book = await this.bookService.addNewBook(req.body);
        res.status(201).json(book);
        return;
      }

      if (req.user?.role === 'CUSTOMER') {
        const book = await this.bookService.addUsedBook(req.body, req.user.userId);
        res.status(201).json(book);
        return;
      }

      res.status(403).json({ message: 'Forbidden' });
    } catch (error) {
      console.error('createBook failed:', error);
      res.status(400).json({ message: 'Failed to create book', error: (error as Error).message });
    }
  };

  public updateBook = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const bookId = req.params.id as string;
      const existing = await this.bookService.getBookForManagement(bookId);

      if (!existing) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }

      if (req.user?.role !== 'ADMIN' && existing.sellerId !== req.user?.userId) {
        res.status(403).json({ message: 'You can only update your own listings' });
        return;
      }

      if (req.user?.role !== 'ADMIN' && !existing.isUsed) {
        res.status(403).json({ message: 'Only admins can update catalog books' });
        return;
      }

      const updated = await this.bookService.updateBook(bookId, this.buildUpdatePayload(req), {
        resetApproval: req.user?.role !== 'ADMIN',
      });
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update book', error: (error as Error).message });
    }
  };

  public deleteBook = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const bookId = req.params.id as string;
      const existing = await this.bookService.getBookForManagement(bookId);

      if (!existing) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }

      if (req.user?.role !== 'ADMIN' && existing.sellerId !== req.user?.userId) {
        res.status(403).json({ message: 'You can only delete your own listings' });
        return;
      }

      if (req.user?.role !== 'ADMIN' && !existing.isUsed) {
        res.status(403).json({ message: 'Only admins can delete catalog books' });
        return;
      }

      await this.bookService.deleteBook(bookId);
      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete book', error: (error as Error).message });
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
      const { status } = req.body;
      const book = await this.bookService.updateResaleStatus(
        req.params.id as string,
        status as ApprovalStatus,
      );
      res.status(200).json({ message: `Book marked as ${status}`, book });
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Failed to update book status', error: (error as Error).message });
    }
  };
}
