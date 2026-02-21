import { Router } from 'express';
import { BookController } from '../controllers/BookController';

class BookRoutes {
  public router: Router;
  private bookController: BookController;

  constructor() {
    this.router = Router();
    this.bookController = new BookController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.bookController.getAll);
    this.router.get('/:id', this.bookController.getById);
    this.router.post('/', this.bookController.createBook);
  }
}

export default new BookRoutes().router;
