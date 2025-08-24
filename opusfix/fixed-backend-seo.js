// simple-server.js - FIXED VERSION WITH AUTOMATIC SEO
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const compression = require('compression');

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

// Import SEO Service
const SEOService = require('./seo-service.js');
const seoService = new SEOService(pool);

// Middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// CRITICAL FIX: Individual vehicle endpoint with proper SEO handling
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`🔍 Vehicle detail request for ID: ${id}`);
    
    // FIXED QUERY - seo_metadata is already JSONB, no need to parse
    const query = `
      SELECT 
        v.*,
        m.name as manufacturer_name,
        md.name as model_name,
        v.seo_metadata, -- PostgreSQL JSONB field
        json_agg(
          json_build_object(
            'url', vi.original_url,
            'alt_text', vi.alt_text,
            'is_primary', vi.is_primary
          ) ORDER BY vi.image_order, vi.is_primary DESC
        ) FILTER (WHERE vi.id IS NOT NULL) as images
      FROM vehicles v
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE v.id = $1 AND v.is_available = TRUE
      GROUP BY v.id, m.name, md.name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }
    
    const row = result.rows[0];
    
    // GENERATE SEO ON-THE-FLY IF MISSING
    let seoMetadata = row.seo_metadata;
    if (!seoMetadata) {
      logger.info(`⚠️ Vehicle ${id} missing SEO, generating now...`);
      
      // Generate SEO immediately
      const vehicleData = {
        id: row.id,
        model_year_ad: row.model_year_ad,
        mileage_km: row.mileage_km,
        price_vehicle_yen: row.price_vehicle_yen,
        price_total_yen: row.price_total_yen,
        grade: row.grade,
        is_accident_free: row.is_accident_free,
        is_one_owner: row.is_one_owner,
        has_warranty: row.has_warranty,
        manufacturer_name: row.manufacturer_name,
        model_name: row.model_name
      };
      
      seoMetadata = {
        title: seoService.generateTitle(vehicleData),
        description: seoService.generateDescription(vehicleData),
        keywords: seoService.generateKeywords(vehicleData),
        og_title: `${vehicleData.model_year_ad} ${vehicleData.manufacturer_name} ${vehicleData.model_name} - Export from Japan`,
        og_description: seoService.generateDescription(vehicleData),
        canonical_url: `https://japandirecttrucks.com/vehicles/${row.id}`
      };
      
      // Save to database in background (don't wait)
      seoService.updateVehicleSEO(row.id, seoMetadata).catch(err => {
        logger.error(`Failed to save SEO for vehicle ${row.id}:`, err);
      });
    }
    
    const vehicle = {
      id: row.id,
      title_description: row.title_description,
      price_total_yen: row.price_total_yen,
      price_vehicle_yen: row.price_vehicle_yen,
      model_year_ad: row.model_year_ad,
      mileage_km: row.mileage_km,
      location_prefecture: row.location_prefecture,
      transmission_type: row.transmission_type,
      drivetrain_type: row.drivetrain_type,
      fuel_type: row.fuel_type,
      engine_displacement: row.engine_displacement,
      has_repair_history: row.has_repair_history,
      has_warranty: row.has_warranty,
      dealer_name: row.dealer_name,
      features: row.features,
      detail_specs: row.detail_specs,
      manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : null,
      model: row.model_name ? { name: row.model_name } : null,
      source_url: row.source_url,
      is_featured: row.is_featured,
      is_available: row.is_available,
      created_at: row.created_at,
      images: row.images || [],
      seo_metadata: seoMetadata, // NO JSON.parse needed!
      ai_description: row.ai_description
    };
    
    // Generate AI analysis if needed...
    // [Rest of AI analysis code remains the same]
    
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    logger.error('Vehicle details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get vehicle details',
      details: error.message
    });
  }
});

// Admin endpoint to regenerate all SEO
app.post('/api/admin/seo/regenerate-all', async (req, res) => {
  try {
    const { force = false } = req.body;
    
    logger.info(`🔄 Starting full SEO regeneration (force: ${force})`);
    
    // Start regeneration in background
    seoService.regenerateAllSEO(force).catch(error => {
      logger.error('Background SEO regeneration failed:', error);
    });

    res.json({
      success: true,
      message: `SEO regeneration started in background (force: ${force})`
    });
  } catch (error) {
    logger.error('Start SEO regeneration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start SEO regeneration'
    });
  }
});

// Get SEO stats
app.get('/api/admin/seo/stats', async (req, res) => {
  try {
    const stats = await seoService.getSEOStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get SEO stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get SEO stats'
    });
  }
});

// Trigger SEO generation
app.post('/api/admin/seo/generate', async (req, res) => {
  try {
    seoService.runSEOGeneration().catch(error => {
      logger.error('Background SEO generation failed:', error);
    });

    res.json({
      success: true,
      message: 'SEO generation started in background'
    });
  } catch (error) {
    logger.error('Start SEO generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start SEO generation'
    });
  }
});

// [Rest of your existing endpoints remain the same...]

// Start server
app.listen(port, () => {
  logger.info(`✅ Japan Direct Trucks Backend running on http://localhost:${port}`);
  
  // Start automatic SEO generation service
  seoService.startAutomaticSEOGeneration();
  
  // Check and generate SEO for any missing vehicles on startup
  seoService.runSEOGeneration().catch(err => {
    logger.error('Initial SEO generation failed:', err);
  });
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('\n🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});