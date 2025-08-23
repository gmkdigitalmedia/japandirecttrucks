import express from 'express';
import pool from '@/config/database';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*,
        COUNT(v.id) as vehicle_count
      FROM manufacturers m
      LEFT JOIN vehicles v ON m.id = v.manufacturer_id 
        AND v.is_available = TRUE 
        AND v.export_status = 'available'
      WHERE m.is_active = TRUE
      GROUP BY m.id
      ORDER BY m.name
    `;
    
    const result = await pool.query(query);
    
    const response: ApiResponse = {
      success: true,
      data: result.rows
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Get manufacturers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get manufacturers'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid manufacturer ID'
      });
    }

    const query = `
      SELECT 
        m.*,
        COUNT(v.id) as vehicle_count
      FROM manufacturers m
      LEFT JOIN vehicles v ON m.id = v.manufacturer_id 
        AND v.is_available = TRUE 
        AND v.export_status = 'available'
      WHERE m.id = $1 AND m.is_active = TRUE
      GROUP BY m.id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Manufacturer not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: result.rows[0]
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Get manufacturer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get manufacturer'
    });
  }
});

router.get('/:id/models', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid manufacturer ID'
      });
    }

    const query = `
      SELECT 
        md.*,
        COUNT(v.id) as vehicle_count
      FROM models md
      LEFT JOIN vehicles v ON md.id = v.model_id 
        AND v.is_available = TRUE 
        AND v.export_status = 'available'
      WHERE md.manufacturer_id = $1
      GROUP BY md.id
      ORDER BY md.is_popular DESC, md.name
    `;
    
    const result = await pool.query(query, [id]);
    
    const response: ApiResponse = {
      success: true,
      data: result.rows
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Get manufacturer models error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get manufacturer models'
    });
  }
});

export default router;