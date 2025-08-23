// Compatibility wrapper for Node.js v12
// Simple working backend for GPS Trucks Japan
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const port = process.env.PORT || 8000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gps_trucks_japan',
  user: process.env.DB_USER || 'gp',
  password: process.env.DB_PASSWORD || 'Megumi12',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the public folder
app.use('/images', express.static('public/images'));

// Test database connection
async function testDatabase() {
  try {
    const result = await pool.query('SELECT NOW()');
    logger.info('Database connected successfully');
    logger.info('Database time:', result.rows[0].now);
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    return false;
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all vehicles with filters
app.get('/api/vehicles', async (req, res) => {
  try {
    const { 
      make, 
      model, 
      minPrice, 
      maxPrice, 
      minYear, 
      maxYear,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (make) {
      paramCount++;
      query += ` AND make = $${paramCount}`;
      params.push(make);
    }

    if (model) {
      paramCount++;
      query += ` AND model ILIKE $${paramCount}`;
      params.push(`%${model}%`);
    }

    if (minPrice) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      params.push(parseInt(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      params.push(parseInt(maxPrice));
    }

    if (minYear) {
      paramCount++;
      query += ` AND year >= $${paramCount}`;
      params.push(parseInt(minYear));
    }

    if (maxYear) {
      paramCount++;
      query += ` AND year <= $${paramCount}`;
      params.push(parseInt(maxYear));
    }

    // Add sorting
    const allowedSortFields = ['price', 'year', 'created_at', 'mileage'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    logger.info('Executing query:', query);
    logger.info('With params:', params);

    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM vehicles WHERE 1=1';
    const countParams = [];
    paramCount = 0;

    if (make) {
      paramCount++;
      countQuery += ` AND make = $${paramCount}`;
      countParams.push(make);
    }

    if (model) {
      paramCount++;
      countQuery += ` AND model ILIKE $${paramCount}`;
      countParams.push(`%${model}%`);
    }

    if (minPrice) {
      paramCount++;
      countQuery += ` AND price >= $${paramCount}`;
      countParams.push(parseInt(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      countQuery += ` AND price <= $${paramCount}`;
      countParams.push(parseInt(maxPrice));
    }

    if (minYear) {
      paramCount++;
      countQuery += ` AND year >= $${paramCount}`;
      countParams.push(parseInt(minYear));
    }

    if (maxYear) {
      paramCount++;
      countQuery += ` AND year <= $${paramCount}`;
      countParams.push(parseInt(maxYear));
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      vehicles: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get single vehicle by ID
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Get unique makes
app.get('/api/makes', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT make FROM vehicles ORDER BY make');
    res.json(result.rows.map(row => row.make));
  } catch (error) {
    logger.error('Error fetching makes:', error);
    res.status(500).json({ error: 'Failed to fetch makes' });
  }
});

// Get models for a specific make
app.get('/api/models/:make', async (req, res) => {
  try {
    const { make } = req.params;
    const result = await pool.query(
      'SELECT DISTINCT model FROM vehicles WHERE make = $1 ORDER BY model',
      [make]
    );
    res.json(result.rows.map(row => row.model));
  } catch (error) {
    logger.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Start server
async function startServer() {
  // Test database connection
  const dbConnected = await testDatabase();
  
  if (!dbConnected) {
    logger.warn('Database connection failed, but server will still start');
  }

  app.listen(port, () => {
    logger.info(`Backend server running on port ${port}`);
    console.log(`
🚛 GPS Trucks Japan Backend Server
==================================
Server running at: http://localhost:${port}
Health check: http://localhost:${port}/health
API endpoints:
  - GET /api/vehicles
  - GET /api/vehicles/:id
  - GET /api/makes
  - GET /api/models/:make
==================================
    `);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});