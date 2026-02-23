import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  public getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching categories', error: (error as Error).message });
    }
  };

  public create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, description } = req.body;

      if (!name) {
        res.status(400).json({ message: 'Category name is required' });
        return;
      }

      const category = await this.categoryService.createCategory(name, description);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: 'Error creating category', error: (error as Error).message });
    }
  };
}
