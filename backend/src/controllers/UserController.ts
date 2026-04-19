import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import database from '../config/database';

export class UserController {
  // Get current user details
  public getUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await database.prisma.user.findUnique({
        where: { id: req.user?.userId },
        select: { id: true, name: true, email: true, role: true, createdAt: true, phone: true, address: true, age: true },
      });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  };

  // Update current user details
  public updateUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, email, phone, address, age } = req.body;
      const user = await database.prisma.user.update({
        where: { id: req.user?.userId },
        data: { 
          name, 
          email, 
          phone, 
          address, 
          age: age ? Number(age) : null 
        },
        select: { id: true, name: true, email: true, role: true, phone: true, address: true, age: true },
      });
      res.json(user);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  };

  // Get books listed by the current user (their used book listings)
  public getUserListings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const listings = await database.prisma.book.findMany({
        where: { sellerId: req.user?.userId },
        include: { category: true },
      });
      res.json(listings);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  };

  // Get reviews written by the current user
  public getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const reviews = await database.prisma.review.findMany({
        where: { userId: req.user?.userId },
        include: { book: { select: { id: true, title: true, author: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.json(reviews);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  };

  // Saved books (placeholder — no saved books feature in schema yet)
  public getSavedBooks = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json([]);
  };

  // ADMIN: Get all users
  public getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await database.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: { orders: true, reviews: true, listedBooks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  };

  // ADMIN: Delete a user
  public deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await database.prisma.user.delete({ where: { id: id as string } });
      res.json({ message: 'User deleted successfully' });
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  };
}
