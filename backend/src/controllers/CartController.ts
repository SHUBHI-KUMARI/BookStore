import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { BookRepository } from '../repositories/BookRepository';
import { CartRepository } from '../repositories/CartRepository';

export class CartController {
  private cartRepository: CartRepository;
  private bookRepository: BookRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.bookRepository = new BookRepository();
  }

  public getCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'User ID is missing from headers' });
        return;
      }

      const cart = await this.cartRepository.findOrCreateCart(userId);
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching cart', error: (error as Error).message });
    }
  };

  public addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { bookId, quantity } = req.body;
      const normalizedQuantity = Number(quantity);

      if (!userId || !bookId || Number.isNaN(normalizedQuantity) || normalizedQuantity < 1) {
        res.status(400).json({ message: 'Missing required parameters' });
        return;
      }

      const book = await this.bookRepository.findByIdForOwnerOrAdmin(bookId as string);
      if (!book) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }

      if (book.isUsed && book.approvalStatus !== 'APPROVED') {
        res.status(400).json({ message: 'This listing is not available yet' });
        return;
      }

      const cart = await this.cartRepository.findOrCreateCart(userId);
      const existingItem = cart.items.find((item) => item.bookId === bookId);
      const requestedQuantity = (existingItem?.quantity ?? 0) + normalizedQuantity;

      if (book.stock < requestedQuantity) {
        res.status(400).json({ message: 'Requested quantity exceeds available stock' });
        return;
      }

      await this.cartRepository.addItem(cart.id, bookId, normalizedQuantity);

      const updatedCart = await this.cartRepository.findOrCreateCart(userId);
      res.status(200).json(updatedCart);
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Failed to add item to cart', error: (error as Error).message });
    }
  };

  public updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { bookId } = req.params;
      const { quantity } = req.body;
      const normalizedQuantity = Number(quantity);

      if (!userId || !bookId || quantity === undefined || Number.isNaN(normalizedQuantity)) {
        res.status(400).json({ message: 'Missing required parameters' });
        return;
      }

      if (normalizedQuantity > 0) {
        const book = await this.bookRepository.findByIdForOwnerOrAdmin(bookId as string);
        if (!book) {
          res.status(404).json({ message: 'Book not found' });
          return;
        }

        if (book.stock < normalizedQuantity) {
          res.status(400).json({ message: 'Requested quantity exceeds available stock' });
          return;
        }
      }

      const cart = await this.cartRepository.findOrCreateCart(userId);
      await this.cartRepository.updateItemQuantity(cart.id, bookId as string, normalizedQuantity);

      const updatedCart = await this.cartRepository.findOrCreateCart(userId);
      res.status(200).json(updatedCart);
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Failed to update cart item', error: (error as Error).message });
    }
  };

  public removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { bookId } = req.params;

      if (!userId || !bookId) {
        res.status(400).json({ message: 'Missing required parameters' });
        return;
      }

      const cart = await this.cartRepository.findOrCreateCart(userId);
      await this.cartRepository.removeItem(cart.id, bookId as string);

      const updatedCart = await this.cartRepository.findOrCreateCart(userId);
      res.status(200).json(updatedCart);
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Failed to remove item from cart', error: (error as Error).message });
    }
  };
}
