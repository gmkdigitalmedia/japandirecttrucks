// fix-all-seo.js - RUN THIS SCRIPT TO FIX ALL SEO IMMEDIATELY
// Usage: node fix-all-seo.js

require('dotenv').config();
const { Pool } = require('pg');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

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

async function fixAllSEO() {
  logger.info('🚀 Starting comprehensive SEO fix for all vehicles...');
  
  try {
    // First, add the missing column if it doesn't exist
    logger.info('📊 Checking database structure...');
    await pool.query(`
      ALTER TABLE vehicles 
      ADD COLUMN IF NOT EXISTS seo_updated_at TIMESTAMP
    `);
    logger.info('✅ Database structure verified');
    
    // Get current stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE seo_metadata IS NOT NULL) as with_seo,
        COUNT(*) FILTER (WHERE seo_metadata IS NULL) as without_seo
      FROM vehicles 
      WHERE is_available = TRUE
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    logger.info(`📈 Current Status:`);
    logger.info(`   Total vehicles: ${stats.total}`);
    logger.info(`   With SEO: ${stats.with_seo}`);
    logger.info(`   Missing SEO: ${stats.without_seo}`);
    
    // Initialize SEO service
    const seoService = new SEOService(pool);
    
    // Option to force regenerate all
    const args = process.argv.slice(2);
    const forceRegenerate = args.includes('--force');
    
    if (forceRegenerate) {
      logger.info('⚠️  FORCE MODE: Clearing all existing SEO...');
      const clearResult = await pool.query(`
        UPDATE vehicles 
        SET seo_metadata = NULL, seo_updated_at = NULL 
        WHERE is_available = TRUE
      `);
      logger.info(`🗑️  Cleared SEO for ${clearResult.rowCount} vehicles`);
    }
    
    // Run SEO generation
    logger.info('🔄 Starting SEO generation...');
    const result = await seoService.runSEOGeneration(true);
    
    logger.info('✅ SEO GENERATION COMPLETE!');
    logger.info(`📊 Final Results:`);
    logger.info(`   Processed: ${result.totalProcessed} vehicles`);
    logger.info(`   Success: ${result.totalSuccess}`);
    logger.info(`   Errors: ${result.totalErrors}`);
    
    // Get updated stats
    const finalStatsResult = await pool.query(statsQuery);
    const finalStats = finalStatsResult.rows[0];
    
    logger.info(`📈 Updated Status:`);
    logger.info(`   Total vehicles: ${finalStats.total}`);
    logger.info(`   With SEO: ${finalStats.with_seo}`);
    logger.info(`   Coverage: ${Math.round((finalStats.with_seo / finalStats.total) * 100)}%`);
    
    // Close database connection
    await pool.end();
    
    logger.info('🎉 SEO fix completed successfully!');
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Fatal error during SEO fix:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the fix
fixAllSEO();