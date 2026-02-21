import { Request, Response } from 'express';
import { CartRepository } from '../repositories/CartRepository';

export class CartController {
  private cartRepository: CartRepository;

  constructor() {
    this.cartRepository = new CartRepository();
  }

  public getCart = async (req: Request, res: Response): Promise<void> => {
    try {
      // Mocking User logic since authentication middleware is not implemented entirely yet
      const userId = req.headers['x-user-id'] as string;
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

  public addToCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { bookId, quantity } = req.body;

      if (!userId || !bookId || !quantity) {
        res.status(400).json({ message: 'Missing required parameters' });
        return;
      }

      const cart = await this.cartRepository.findOrCreateCart(userId);
      await this.cartRepository.addItem(cart.id, bookId, quantity);

      const updatedCart = await this.cartRepository.findOrCreateCart(userId);
      res.status(200).json(updatedCart);
    } catch (error) {
      res
        .status(400)
        .json({ message: 'Failed to add item to cart', error: (error as Error).message });
    }
  };
}
