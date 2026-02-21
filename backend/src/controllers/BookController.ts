import { Request, Response } from 'express';
import { BookRepository } from '../repositories/BookRepository';

export class BookController {
  private bookRepository: BookRepository;

  constructor() {
    this.bookRepository = new BookRepository();
  }

  public getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const books = await this.bookRepository.findAll();
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching books', error: (error as Error).message });
    }
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const book = await this.bookRepository.findById(req.params.id);
      if (!book) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }
      res.status(200).json(book);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching book', error: (error as Error).message });
    }
  };

  public createBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const book = await this.bookRepository.create(req.body);
      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create book', error: (error as Error).message });
    }
  };
}
