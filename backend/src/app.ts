import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from './config/database';

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
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Add base route for health check
    this.app.get('/api/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'UP', message: 'API is healthy' });
    });
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}

export default App;
