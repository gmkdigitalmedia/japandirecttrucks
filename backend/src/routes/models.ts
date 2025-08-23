import express from 'express';
import pool from '@/config/database';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid model ID'
      });
    }

    const query = `
      SELECT 
        md.*,
        m.name as manufacturer_name,
        COUNT(v.id) as vehicle_count
      FROM models md
      LEFT JOIN manufacturers m ON md.manufacturer_id = m.id
      LEFT JOIN vehicles v ON md.id = v.model_id 
        AND v.is_available = TRUE 
        AND v.export_status = 'available'
      WHERE md.id = $1
      GROUP BY md.id, m.name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: result.rows[0]
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Get model error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get model'
    });
  }
});

router.get('/:id/vehicles', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as string || 'DESC';
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid model ID'
      });
    }

    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        v.*,
        m.name as manufacturer_name,
        md.name as model_name,
        vi.original_url as primary_image_url,
        COUNT(*) OVER() as total_count
      FROM vehicles v
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
      WHERE v.model_id = $1 
        AND v.is_available = TRUE 
        AND v.export_status = 'available'
      ORDER BY v.${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [id, limit, offset]);
    
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);

    const vehicles = result.rows.map(row => ({
      ...row,
      manufacturer: { name: row.manufacturer_name },
      model: { name: row.model_name },
      primary_image: row.primary_image_url ? `/api/images/proxy?url=${encodeURIComponent(row.primary_image_url)}` : null
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        data: vehicles,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Get model vehicles error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get model vehicles'
    });
  }
});

export default router;