import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserController {
  // Get User Details
  public getUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  };

  // Update User Details
  public updateUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, email } = req.body;
      const user = await prisma.user.update({
        where: { id: req.user?.userId },
        data: { name, email },
        select: { id: true, name: true, email: true, role: true },
      });
      res.json(user);
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  };

  // Get User Listings
  public getUserListings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const listings = await prisma.book.findMany({
        where: { sellerId: req.user?.userId },
      });
      res.json(listings);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  };

  // Get User Reviews
  public getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const reviews = await prisma.review.findMany({
        where: { userId: req.user?.userId },
        include: { book: { select: { title: true } } },
      });
      res.json(reviews);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  };

  // Saved Books (assuming a field or table for it isn't there, we return mock or empty for now if missing)
  public getSavedBooks = async (req: AuthRequest, res: Response): Promise<void> => {
    res.json([]); // Placeholder
  };
}
