import express, { Application, Request, Response } from 'express';
import type { Server } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import database from './config/database';
import authRoutes from './routes/AuthRoutes';
import bookRoutes from './routes/BookRoutes';
import cartRoutes from './routes/CartRoutes';
import categoryRoutes from './routes/CategoryRoutes';
import orderRoutes from './routes/OrderRoutes';
import reviewRoutes from './routes/ReviewRoutes';
import userRoutes from './routes/UserRoutes';

dotenv.config();

class App {
  public app: Application;
  public port: number | string;

  constructor(port: number | string) {
    this.app = express();
    this.port = port;

    this.connectDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private async connectDatabase(): Promise<void> {
    await database.connect();
  }

  private initializeMiddlewares(): void {
    this.app.use(
      cors({
        origin: [
          'http://localhost:5173',
          'http://localhost:3000',
          'https://book-store-gamma-three.vercel.app',
          'https://fictional-space-journey-jjqwxp59qrx4cq6wq-5173.app.github.dev',
          'https://fictional-space-journey-jjqwxp59qrx4cq6wq-3000.app.github.dev',
          'https://fictional-space-journey-jjqwxp59qrx4cq6wq-5173.app.github.dev'
        ],
        credentials: true,
      }),
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Add base route for health check
    this.app.get('/api/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'UP', message: 'API is healthy' });
    });

    // Integrated Route Modules
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/categories', categoryRoutes);
    this.app.use('/api/books', bookRoutes);
    this.app.use('/api/cart', cartRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/reviews', reviewRoutes);
    this.app.use('/api/user', userRoutes);
  }

  public listen(): Server {
    const server = this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
    return server;
  }
}

export default App;
