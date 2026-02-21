import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Registers a brand new user
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      if ((error as Error).message === 'User already exists') {
        res.status(409).json({ message: (error as Error).message });
      } else {
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
      }
    }
  };

  /**
   * Logs a user in and returns a JWT Token
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const result = await this.authService.authenticate({ email, password });
      res.status(200).json({ message: 'Login successful', ...result });
    } catch (error) {
      if ((error as Error).message === 'Invalid email or password') {
        res.status(401).json({ message: (error as Error).message });
      } else {
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
      }
    }
  };
}
