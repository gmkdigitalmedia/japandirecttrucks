import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { rateLimit } from 'express-rate-limit';

import { logger } from '@/utils/logger';
import pool from '@/config/database';

import vehicleRoutes from '@/routes/vehicles';
import inquiryRoutes from '@/routes/inquiries';
import authRoutes from '@/routes/auth';
import adminRoutes from '@/routes/admin';
import imageRoutes from '@/routes/images';
import manufacturerRoutes from '@/routes/manufacturers';
import modelRoutes from '@/routes/models';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001'
  ],
  credentials: true
}));

app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'GPS Trucks Japan API is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'GPS Trucks Japan API',
    version: '1.0.0',
    endpoints: {
      vehicles: '/api/vehicles',
      inquiries: '/api/inquiries',
      auth: '/api/auth',
      admin: '/api/admin',
      manufacturers: '/api/manufacturers',
      models: '/api/models'
    }
  });
});

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/models', modelRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

async function startServer() {
  try {
    await pool.query('SELECT 1');
    logger.info('Database connection established');
    
    app.listen(PORT, () => {
      logger.info(`🚛 GPS Trucks Japan API server running on port ${PORT}`);
      logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API docs: http://localhost:${PORT}/api`);
      logger.info(`🖼️  Images served from: http://localhost:${PORT}/images`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

startServer();