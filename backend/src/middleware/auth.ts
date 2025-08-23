import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminUser } from '@/types';
import pool from '@/config/database';
import { logger } from '@/utils/logger';

export interface AuthRequest extends Request {
  user?: AdminUser;
}

export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        error: 'Access denied. No token provided.' 
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: number };
    
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE id = $1 AND is_active = TRUE',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid token or user not found' 
      });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
};