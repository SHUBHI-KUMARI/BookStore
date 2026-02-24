import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CartRepository } from '../repositories/CartRepository';

export class CartController {
  private cartRepository: CartRepository;

  constructor() {
    this.cartRepository = new CartRepository();
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

  public updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { bookId } = req.params;
      const { quantity } = req.body;

      if (!userId || !bookId || quantity === undefined) {
        res.status(400).json({ message: 'Missing required parameters' });
        return;
      }

      const cart = await this.cartRepository.findOrCreateCart(userId);
      await this.cartRepository.updateItemQuantity(cart.id, bookId as string, Number(quantity));

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
