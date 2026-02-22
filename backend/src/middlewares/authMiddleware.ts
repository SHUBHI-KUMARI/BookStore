import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include decoded user info
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
      if (err) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
      }

      req.user = decoded as { userId: string; role: string };
      next();
    });
  } else {
    res.status(401).json({ message: 'Authentication token missing' });
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: `Access denied. Requires one of: ${roles.join(', ')}` });
      return;
    }

    next();
  };
};
