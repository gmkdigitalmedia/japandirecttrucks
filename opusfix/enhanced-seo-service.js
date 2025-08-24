// seo-service.js - ENHANCED VERSION WITH AUTOMATIC GENERATION
const winston = require('winston');

class SEOService {
  constructor(pool) {
    this.pool = pool;
    this.isRunning = false;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  /**
   * Generate SEO title for vehicle
   */
  generateTitle(vehicle) {
    const year = vehicle.model_year_ad;
    const make = vehicle.manufacturer_name || 'Vehicle';
    const model = vehicle.model_name || 'Model';
    const mileage = Math.round(vehicle.mileage_km / 1000);
    
    // Vary titles for better SEO
    const templates = [
      `${year} ${make} ${model} Export from Japan - ${mileage}k km - Japan Direct Trucks`,
      `Buy ${year} ${make} ${model} - Japanese Import ${mileage}k km | JapanDirectTrucks.com`,
      `${make} ${model} ${year} for Export - ${mileage}k km - Direct from Japan Auction`,
      `Export Quality ${year} ${make} ${model} - Low Mileage ${mileage}k km - Japan Direct`
    ];
    
    // Use vehicle ID to consistently pick same template
    const templateIndex = vehicle.id % templates.length;
    return templates[templateIndex];
  }

  /**
   * Generate SEO description for vehicle
   */
  generateDescription(vehicle) {
    const year = vehicle.model_year_ad;
    const make = vehicle.manufacturer_name || 'Vehicle';
    const model = vehicle.model_name || 'Model';
    const mileage = this.formatMileage(vehicle.mileage_km);
    const price = this.formatPrice(vehicle.price_total_yen || vehicle.price_vehicle_yen);
    
    let description = `Export ${year} ${make} ${model} from Japan. ${mileage}, ${price}.`;
    
    // Add unique attributes for better SEO
    const attributes = [];
    if (vehicle.is_accident_free) attributes.push('Accident-free');
    if (vehicle.is_one_owner) attributes.push('One owner');
    if (vehicle.grade) attributes.push(`Grade ${vehicle.grade}`);
    if (vehicle.has_warranty) attributes.push('Warranty included');
    
    if (attributes.length > 0) {
      description += ` ${attributes.join('. ')}.`;
    }
    
    // Add location-specific keywords
    const locations = ['USA', 'Australia', 'UK', 'Kenya', 'Dubai', 'Canada', 'New Zealand'];
    const locationIndex = vehicle.id % locations.length;
    description += ` Direct export to ${locations[locationIndex]}. English service by Japan Direct Trucks.`;
    
    return description.substring(0, 160);
  }

  /**
   * Generate SEO keywords for vehicle
   */
  generateKeywords(vehicle) {
    const year = vehicle.model_year_ad;
    const make = (vehicle.manufacturer_name || '').toLowerCase();
    const model = (vehicle.model_name || '').toLowerCase();
    
    // Generate comprehensive keywords
    const keywords = [
      `${year} ${make} ${model} export`,
      `${make} ${model} japan export`,
      `${model} export from japan`,
      `japanese ${make} ${model}`,
      `${make} ${model} for sale japan`,
      `import ${make} ${model} from japan`,
      `${year} ${make} export usa`,
      `${year} ${make} export australia`,
      `${year} ${make} export uk`,
      `${make} japan auction`,
      `buy ${make} ${model} japan`,
      'japan vehicle export',
      'english service japan cars',
      'japandirecttrucks.com'
    ];
    
    // Add model-specific keywords
    if (model.includes('land cruiser') || model.includes('landcruiser')) {
      keywords.push('landcruiser export', 'toyota land cruiser japan', '4wd export japan');
    }
    if (model.includes('hiace')) {
      keywords.push('toyota hiace van export', 'commercial van japan');
    }
    if (model.includes('hilux')) {
      keywords.push('toyota hilux pickup export', 'pickup truck japan');
    }
    
    return keywords.join(', ');
  }

  /**
   * Format mileage for display
   */
  formatMileage(km) {
    if (!km) return '0km';
    if (km >= 10000) {
      return `${Math.round(km / 1000)}k km`;
    }
    return `${km.toLocaleString()} km`;
  }

  /**
   * Format price for display
   */
  formatPrice(priceYen) {
    if (!priceYen) return 'Price on inquiry';
    const usd = Math.round(priceYen / 150);
    return `¥${priceYen.toLocaleString()} (~$${usd.toLocaleString()})`;
  }

  /**
   * Update vehicle SEO in database
   */
  async updateVehicleSEO(vehicleId, seoData) {
    try {
      const query = `
        UPDATE vehicles 
        SET seo_metadata = $1::jsonb, 
            seo_updated_at = NOW(),
            updated_at = NOW()
        WHERE id = $2
      `;
      
      await this.pool.query(query, [JSON.stringify(seoData), vehicleId]);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update SEO for vehicle ${vehicleId}:`, error);
      return false;
    }
  }

  /**
   * Get vehicles that need SEO generation
   */
  async getVehiclesNeedingSEO(limit = 100, includeOutdated = false) {
    let whereClause = 'v.seo_metadata IS NULL AND v.is_available = TRUE';
    
    if (includeOutdated) {
      // Also get vehicles with outdated SEO (older than 30 days)
      whereClause = `
        v.is_available = TRUE 
        AND (
          v.seo_metadata IS NULL 
          OR v.seo_updated_at IS NULL 
          OR v.seo_updated_at < NOW() - INTERVAL '30 days'
        )
      `;
    }
    
    const query = `
      SELECT 
        v.id,
        v.model_year_ad,
        v.mileage_km,
        v.price_vehicle_yen,
        v.price_total_yen,
        v.grade,
        v.is_accident_free,
        v.is_one_owner,
        v.has_warranty,
        m.name as manufacturer_name,
        md.name as model_name
      FROM vehicles v
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      WHERE ${whereClause}
      ORDER BY v.created_at DESC
      LIMIT $1
    `;
    
    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }

  /**
   * Process a batch of vehicles for SEO generation
   */
  async processBatch(vehicles) {
    let successCount = 0;
    let errorCount = 0;
    
    for (const vehicle of vehicles) {
      try {
        const seoData = {
          title: this.generateTitle(vehicle),
          description: this.generateDescription(vehicle),
          keywords: this.generateKeywords(vehicle),
          og_title: `${vehicle.model_year_ad} ${vehicle.manufacturer_name} ${vehicle.model_name} - Export from Japan`,
          og_description: this.generateDescription(vehicle),
          canonical_url: `https://japandirecttrucks.com/vehicles/${vehicle.id}`,
          generated_at: new Date().toISOString()
        };

        const success = await this.updateVehicleSEO(vehicle.id, seoData);
        
        if (success) {
          this.logger.info(`✅ Generated SEO for vehicle ${vehicle.id}: ${vehicle.manufacturer_name} ${vehicle.model_name}`);
          successCount++;
        } else {
          errorCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        this.logger.error(`❌ Failed to generate SEO for vehicle ${vehicle.id}:`, error.message);
        errorCount++;
      }
    }
    
    return { successCount, errorCount };
  }

  /**
   * Run SEO generation for missing vehicles
   */
  async runSEOGeneration(includeOutdated = false) {
    if (this.isRunning) {
      this.logger.info('SEO generation already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.logger.info(`🔍 Starting SEO generation (includeOutdated: ${includeOutdated})...`);

    try {
      let totalProcessed = 0;
      let totalSuccess = 0;
      let totalErrors = 0;
      let batchCount = 0;

      while (true) {
        const vehicles = await this.getVehiclesNeedingSEO(50, includeOutdated);
        
        if (vehicles.length === 0) {
          this.logger.info(`✅ SEO generation complete. Processed ${totalProcessed} vehicles (${totalSuccess} success, ${totalErrors} errors).`);
          break;
        }

        batchCount++;
        const { successCount, errorCount } = await this.processBatch(vehicles);
        
        totalProcessed += vehicles.length;
        totalSuccess += successCount;
        totalErrors += errorCount;
        
        this.logger.info(`📊 Batch ${batchCount}: Processed ${vehicles.length} vehicles (${successCount} success, ${errorCount} errors) - Total: ${totalProcessed}`);
        
        // Break between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return { totalProcessed, totalSuccess, totalErrors };

    } catch (error) {
      this.logger.error('❌ Error in SEO generation service:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Regenerate ALL SEO (force regeneration)
   */
  async regenerateAllSEO(force = false) {
    this.logger.info(`🔄 Starting full SEO regeneration (force: ${force})...`);
    
    if (force) {
      // Clear all existing SEO metadata
      try {
        const clearQuery = 'UPDATE vehicles SET seo_metadata = NULL, seo_updated_at = NULL WHERE is_available = TRUE';
        const result = await this.pool.query(clearQuery);
        this.logger.info(`🗑️ Cleared SEO for ${result.rowCount} vehicles`);
      } catch (error) {
        this.logger.error('Failed to clear existing SEO:', error);
        throw error;
      }
    }
    
    // Now regenerate all
    return await this.runSEOGeneration(true);
  }

  /**
   * Start automatic SEO generation service
   */
  startAutomaticSEOGeneration() {
    this.logger.info('🚀 Starting automatic SEO generation service...');
    
    // Run immediately on startup (after 5 seconds)
    setTimeout(() => {
      this.runSEOGeneration().catch(err => {
        this.logger.error('Initial SEO generation failed:', err);
      });
    }, 5000);
    
    // Run every 30 minutes for new vehicles
    setInterval(() => {
      this.runSEOGeneration().catch(err => {
        this.logger.error('Periodic SEO generation failed:', err);
      });
    }, 30 * 60 * 1000); // 30 minutes
    
    // Run full update (including outdated) every 24 hours
    setInterval(() => {
      this.runSEOGeneration(true).catch(err => {
        this.logger.error('Daily SEO update failed:', err);
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    this.logger.info('⏰ SEO service scheduled: every 30 min (new), daily (outdated)');
  }

  /**
   * Get SEO generation stats
   */
  async getSEOStats() {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM vehicles WHERE is_available = TRUE',
        withSeo: 'SELECT COUNT(*) as count FROM vehicles WHERE seo_metadata IS NOT NULL AND is_available = TRUE',
        withoutSeo: 'SELECT COUNT(*) as count FROM vehicles WHERE seo_metadata IS NULL AND is_available = TRUE',
        outdated: `SELECT COUNT(*) as count FROM vehicles 
                   WHERE is_available = TRUE 
                   AND seo_metadata IS NOT NULL 
                   AND (seo_updated_at IS NULL OR seo_updated_at < NOW() - INTERVAL '30 days')`,
        recent: `SELECT COUNT(*) as count FROM vehicles 
                 WHERE is_available = TRUE 
                 AND seo_updated_at > NOW() - INTERVAL '1 day'`
      };
      
      const results = await Promise.all(
        Object.entries(queries).map(async ([key, query]) => {
          const result = await this.pool.query(query);
          return { key, count: parseInt(result.rows[0].count) };
        })
      );
      
      const stats = results.reduce((acc, { key, count }) => {
        acc[key] = count;
        return acc;
      }, {});
      
      const percentage = stats.total > 0 ? Math.round((stats.withSeo / stats.total) * 100) : 0;
      
      return {
        total: stats.total,
        withSeo: stats.withSeo,
        withoutSeo: stats.withoutSeo,
        outdatedSeo: stats.outdated,
        recentlyUpdated: stats.recent,
        percentage,
        isRunning: this.isRunning
      };
    } catch (error) {
      this.logger.error('❌ Error getting SEO stats:', error);
      throw error;
    }
  }

  /**
   * Generate SEO for a single vehicle on demand
   */
  async generateSingleVehicleSEO(vehicleId) {
    try {
      const query = `
        SELECT 
          v.id,
          v.model_year_ad,
          v.mileage_km,
          v.price_vehicle_yen,
          v.price_total_yen,
          v.grade,
          v.is_accident_free,
          v.is_one_owner,
          v.has_warranty,
          m.name as manufacturer_name,
          md.name as model_name
        FROM vehicles v
        LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
        LEFT JOIN models md ON v.model_id = md.id
        WHERE v.id = $1
      `;
      
      const result = await this.pool.query(query, [vehicleId]);
      
      if (result.rows.length === 0) {
        throw new Error(`Vehicle ${vehicleId} not found`);
      }
      
      const vehicle = result.rows[0];
      
      const seoData = {
        title: this.generateTitle(vehicle),
        description: this.generateDescription(vehicle),
        keywords: this.generateKeywords(vehicle),
        og_title: `${vehicle.model_year_ad} ${vehicle.manufacturer_name} ${vehicle.model_name} - Export from Japan`,
        og_description: this.generateDescription(vehicle),
        canonical_url: `https://japandirecttrucks.com/vehicles/${vehicle.id}`,
        generated_at: new Date().toISOString()
      };
      
      await this.updateVehicleSEO(vehicleId, seoData);
      
      this.logger.info(`✅ Generated SEO for vehicle ${vehicleId} on demand`);
      
      return seoData;
      
    } catch (error) {
      this.logger.error(`Failed to generate SEO for vehicle ${vehicleId}:`, error);
      throw error;
    }
  }
}

module.exports = SEOService;