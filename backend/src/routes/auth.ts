import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/config/database';
import { authenticateAdmin, AuthRequest } from '@/middleware/auth';
import { validateRequest, loginSchema } from '@/middleware/validation';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

const router = express.Router();

router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    const query = 'SELECT * FROM admin_users WHERE username = $1 AND is_active = TRUE';
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await pool.query(
      'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const response: ApiResponse = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      },
      message: 'Login successful'
    };

    logger.info(`Admin user ${username} logged in successfully`);
    res.json(response);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

router.post('/logout', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful'
    };

    logger.info(`Admin user ${req.user?.username} logged out`);
    res.json(response);
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

router.get('/me', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
        full_name: req.user!.full_name,
        role: req.user!.role,
        last_login: req.user!.last_login
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

router.put('/change-password', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    const user = req.user!;
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      'UPDATE admin_users SET password_hash = $1 WHERE id = $2',
      [hashedNewPassword, user.id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    logger.info(`Admin user ${user.username} changed password`);
    res.json(response);
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

export default router;