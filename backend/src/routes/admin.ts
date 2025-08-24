import express from 'express';
import { VehicleService } from '@/services/VehicleService';
import { InquiryService } from '@/services/InquiryService';
import { ImageService } from '@/services/ImageService';
import { seoService } from '@/services/SEOService';
import { authenticateAdmin, requireRole } from '@/middleware/auth';
import { ApiResponse, DashboardStats } from '@/types';
import { logger } from '@/utils/logger';
import pool from '@/config/database';

const router = express.Router();
const vehicleService = new VehicleService();
const inquiryService = new InquiryService();
const imageService = new ImageService();

router.use(authenticateAdmin);

router.get('/dashboard', async (req, res) => {
  try {
    const [vehicleStats, inquiryStats] = await Promise.all([
      vehicleService.getVehicleStats(),
      inquiryService.getInquiryStats()
    ]);

    const recentActivityQuery = `
      SELECT 
        'vehicle_added' as type,
        'New vehicle: ' || title_description as message,
        created_at as timestamp
      FROM vehicles 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'inquiry_received' as type,
        'Inquiry from ' || customer_name || ' (' || customer_country || ')' as message,
        created_at as timestamp
      FROM inquiries 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      
      ORDER BY timestamp DESC 
      LIMIT 20
    `;

    const recentActivityResult = await pool.query(recentActivityQuery);

    const dashboardStats: DashboardStats = {
      totalVehicles: vehicleStats.total,
      availableVehicles: vehicleStats.available,
      featuredVehicles: vehicleStats.featured,
      totalInquiries: inquiryStats.total,
      newInquiries: inquiryStats.newInquiries,
      recentActivity: recentActivityResult.rows,
      popularManufacturers: vehicleStats.popularManufacturers,
      priceDistribution: vehicleStats.priceDistribution
    };

    const response: ApiResponse = {
      success: true,
      data: dashboardStats
    };

    res.json(response);
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
});

router.get('/manufacturers', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*,
        COUNT(v.id) as vehicle_count
      FROM manufacturers m
      LEFT JOIN vehicles v ON m.id = v.manufacturer_id AND v.is_available = TRUE
      WHERE m.is_active = TRUE
      GROUP BY m.id
      ORDER BY m.name
    `;

    const result = await pool.query(query);

    const response: ApiResponse = {
      success: true,
      data: result.rows
    };

    res.json(response);
  } catch (error) {
    logger.error('Get manufacturers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get manufacturers'
    });
  }
});

router.post('/manufacturers', requireRole(['admin']), async (req, res) => {
  try {
    const { name, country, logo_path } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Manufacturer name is required'
      });
    }

    const query = `
      INSERT INTO manufacturers (name, country, logo_path, is_active)
      VALUES ($1, $2, $3, TRUE)
      RETURNING *
    `;

    const result = await pool.query(query, [name, country, logo_path]);

    const response: ApiResponse = {
      success: true,
      data: result.rows[0],
      message: 'Manufacturer created successfully'
    };

    logger.info(`Created manufacturer: ${name}`);
    res.status(201).json(response);
  } catch (error) {
    logger.error('Create manufacturer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manufacturer'
    });
  }
});

router.get('/models', async (req, res) => {
  try {
    const manufacturerId = req.query.manufacturer_id;
    
    let query = `
      SELECT 
        m.*,
        mf.name as manufacturer_name,
        COUNT(v.id) as vehicle_count
      FROM models m
      LEFT JOIN manufacturers mf ON m.manufacturer_id = mf.id
      LEFT JOIN vehicles v ON m.id = v.model_id AND v.is_available = TRUE
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    if (manufacturerId) {
      queryParams.push(manufacturerId);
      query += ` AND m.manufacturer_id = $${queryParams.length}`;
    }

    query += ` GROUP BY m.id, mf.name ORDER BY mf.name, m.name`;

    const result = await pool.query(query, queryParams);

    const response: ApiResponse = {
      success: true,
      data: result.rows
    };

    res.json(response);
  } catch (error) {
    logger.error('Get models error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get models'
    });
  }
});

router.post('/models', requireRole(['admin']), async (req, res) => {
  try {
    const { manufacturer_id, name, body_type, is_popular } = req.body;

    if (!manufacturer_id || !name) {
      return res.status(400).json({
        success: false,
        error: 'Manufacturer ID and model name are required'
      });
    }

    const query = `
      INSERT INTO models (manufacturer_id, name, body_type, is_popular)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [manufacturer_id, name, body_type, is_popular || false]);

    const response: ApiResponse = {
      success: true,
      data: result.rows[0],
      message: 'Model created successfully'
    };

    logger.info(`Created model: ${name} for manufacturer ID ${manufacturer_id}`);
    res.status(201).json(response);
  } catch (error) {
    logger.error('Create model error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create model'
    });
  }
});

router.post('/cleanup-images', requireRole(['admin']), async (req, res) => {
  try {
    await imageService.cleanupOrphanedImages();

    const response: ApiResponse = {
      success: true,
      message: 'Image cleanup completed successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Image cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup images'
    });
  }
});

router.get('/scraper-runs', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        *,
        COUNT(*) OVER() as total_count
      FROM scraper_runs 
      ORDER BY started_at DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      data: {
        data: result.rows,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Get scraper runs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scraper runs'
    });
  }
});

router.get('/export/vehicles', requireRole(['admin']), async (req, res) => {
  try {
    const query = `
      SELECT 
        v.*,
        m.name as manufacturer_name,
        md.name as model_name
      FROM vehicles v
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      ORDER BY v.created_at DESC
    `;

    const result = await pool.query(query);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=vehicles-export.json');
    
    res.json({
      export_date: new Date().toISOString(),
      total_count: result.rows.length,
      vehicles: result.rows
    });
  } catch (error) {
    logger.error('Export vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export vehicles'
    });
  }
});

router.get('/export/inquiries', requireRole(['admin']), async (req, res) => {
  try {
    const query = `
      SELECT 
        i.*,
        v.title_description as vehicle_title,
        v.price_total_yen as vehicle_price
      FROM inquiries i
      LEFT JOIN vehicles v ON i.vehicle_id = v.id
      ORDER BY i.created_at DESC
    `;

    const result = await pool.query(query);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=inquiries-export.json');
    
    res.json({
      export_date: new Date().toISOString(),
      total_count: result.rows.length,
      inquiries: result.rows
    });
  } catch (error) {
    logger.error('Export inquiries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export inquiries'
    });
  }
});

// SEO Management Routes
router.get('/seo/stats', async (req, res) => {
  try {
    const stats = await seoService.getSEOStats();
    
    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    logger.error('Get SEO stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get SEO stats'
    });
  }
});

router.post('/seo/generate', requireRole(['admin']), async (req, res) => {
  try {
    // Start SEO generation in background
    seoService.runSEOGeneration().catch(error => {
      logger.error('Background SEO generation failed:', error);
    });

    const response: ApiResponse = {
      success: true,
      message: 'SEO generation started in background'
    };

    res.json(response);
  } catch (error) {
    logger.error('Start SEO generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start SEO generation'
    });
  }
});

export default router;