import pool from '@/config/database';
import { logger } from '@/utils/logger';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
}

export class SEOService {
  private isRunning = false;

  /**
   * Generate SEO title for vehicle
   */
  private generateTitle(vehicle: any): string {
    const year = vehicle.model_year_ad;
    const make = vehicle.manufacturer_name || 'Vehicle';
    const model = vehicle.model_name || 'Model';
    
    return `${year} ${make} ${model} - Japan Direct Trucks - Worldwide Landcruiser Export from Japan, English Service Only | JapanDirectTrucks.com`;
  }

  /**
   * Generate SEO description for vehicle
   */
  private generateDescription(vehicle: any): string {
    const year = vehicle.model_year_ad;
    const make = vehicle.manufacturer_name || 'Vehicle';
    const model = vehicle.model_name || 'Model';
    const mileage = this.formatMileage(vehicle.mileage_km);
    const price = this.formatPrice(vehicle.price_total_yen || vehicle.price_vehicle_yen);
    
    // Create unique description based on vehicle attributes
    let description = `Export ${year} ${make} ${model} from Japan. ${mileage}, ${price}.`;
    
    // Add unique attributes
    if (vehicle.is_accident_free) {
      description += ' Accident-free.';
    }
    if (vehicle.is_one_owner) {
      description += ' One owner.';
    }
    if (vehicle.grade) {
      description += ` Grade ${vehicle.grade}.`;
    }
    if (vehicle.has_warranty) {
      description += ' Warranty included.';
    }
    
    description += ' Direct export to USA, Australia, UK, France. English service by Japan Direct Trucks.';
    
    return description.substring(0, 160); // Keep under 160 chars
  }

  /**
   * Generate SEO keywords for vehicle
   */
  private generateKeywords(vehicle: any): string {
    const year = vehicle.model_year_ad;
    const make = (vehicle.manufacturer_name || '').toLowerCase();
    const model = (vehicle.model_name || '').toLowerCase();
    
    const keywords = [
      `${year} ${make} ${model} export`,
      `${make} ${model} japan export`,
      `${model} export from japan`,
      `japan direct trucks ${model}`,
      `${make} export japan usa`,
      `${make} export japan australia`,
      `${make} export japan uk`,
      `${make} export japan france`,
      `japanese ${model}`,
      `${year} ${make} export`,
      'japan vehicle export',
      'english service japan export',
      'worldwide landcruiser export',
      'japandirecttrucks.com'
    ];
    
    return keywords.join(', ');
  }

  /**
   * Format mileage for display
   */
  private formatMileage(km: number): string {
    if (!km) return '0km';
    if (km >= 10000) {
      return `${Math.round(km / 1000)}k km`;
    }
    return `${km.toLocaleString()} km`;
  }

  /**
   * Format price for display (rough USD conversion)
   */
  private formatPrice(priceYen: number): string {
    if (!priceYen) return 'Price on inquiry';
    const usd = Math.round(priceYen / 150);
    return `¥${priceYen.toLocaleString()} (~$${usd.toLocaleString()})`;
  }

  /**
   * Update vehicle SEO in database
   */
  private async updateVehicleSEO(vehicleId: number, seoData: SEOData): Promise<void> {
    const query = `
      UPDATE vehicles 
      SET seo_metadata = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    await pool.query(query, [JSON.stringify(seoData), vehicleId]);
  }

  /**
   * Get vehicles that need SEO generation
   */
  private async getVehiclesNeedingSEO(limit: number = 100): Promise<any[]> {
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
      WHERE v.seo_metadata IS NULL
        AND v.is_available = TRUE
      ORDER BY v.created_at ASC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  /**
   * Process a batch of vehicles for SEO generation
   */
  private async processBatch(vehicles: any[]): Promise<void> {
    for (const vehicle of vehicles) {
      try {
        const seoData: SEOData = {
          title: this.generateTitle(vehicle),
          description: this.generateDescription(vehicle),
          keywords: this.generateKeywords(vehicle)
        };

        await this.updateVehicleSEO(vehicle.id, seoData);
        logger.info(`Generated SEO for vehicle ${vehicle.id}: ${vehicle.manufacturer_name} ${vehicle.model_name}`);
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        logger.error(`Failed to generate SEO for vehicle ${vehicle.id}:`, error);
      }
    }
  }

  /**
   * Run SEO generation service
   */
  public async runSEOGeneration(): Promise<void> {
    if (this.isRunning) {
      logger.info('SEO generation already running, skipping...');
      return;
    }

    this.isRunning = true;
    logger.info('🔍 Starting SEO generation service...');

    try {
      let totalProcessed = 0;
      let batchCount = 0;

      while (true) {
        const vehicles = await this.getVehiclesNeedingSEO(50); // Process 50 at a time
        
        if (vehicles.length === 0) {
          logger.info(`✅ SEO generation complete. Processed ${totalProcessed} vehicles total.`);
          break;
        }

        batchCount++;
        await this.processBatch(vehicles);
        totalProcessed += vehicles.length;
        
        logger.info(`📊 Batch ${batchCount}: Processed ${vehicles.length} vehicles (${totalProcessed} total)`);
        
        // Break between batches to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      logger.error('Error in SEO generation service:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start the SEO service that runs periodically
   */
  public startPeriodicSEOGeneration(): void {
    logger.info('🚀 Starting periodic SEO generation service...');
    
    // Run immediately on startup
    setTimeout(() => {
      this.runSEOGeneration();
    }, 5000); // Wait 5 seconds after server start
    
    // Then run every hour
    setInterval(() => {
      this.runSEOGeneration();
    }, 60 * 60 * 1000); // 1 hour
    
    logger.info('⏰ SEO service scheduled to run every hour');
  }

  /**
   * Get SEO generation stats
   */
  public async getSEOStats(): Promise<any> {
    try {
      const totalQuery = 'SELECT COUNT(*) as total FROM vehicles WHERE is_available = TRUE';
      const withSeoQuery = 'SELECT COUNT(*) as with_seo FROM vehicles WHERE seo_metadata IS NOT NULL AND is_available = TRUE';
      const withoutSeoQuery = 'SELECT COUNT(*) as without_seo FROM vehicles WHERE seo_metadata IS NULL AND is_available = TRUE';
      
      const [totalResult, withSeoResult, withoutSeoResult] = await Promise.all([
        pool.query(totalQuery),
        pool.query(withSeoQuery),
        pool.query(withoutSeoQuery)
      ]);
      
      const total = parseInt(totalResult.rows[0].total);
      const withSeo = parseInt(withSeoResult.rows[0].with_seo);
      const withoutSeo = parseInt(withoutSeoResult.rows[0].without_seo);
      const percentage = total > 0 ? Math.round((withSeo / total) * 100) : 0;
      
      return {
        total,
        withSeo,
        withoutSeo,
        percentage,
        isRunning: this.isRunning
      };
    } catch (error) {
      logger.error('Error getting SEO stats:', error);
      throw error;
    }
  }
}

export const seoService = new SEOService();