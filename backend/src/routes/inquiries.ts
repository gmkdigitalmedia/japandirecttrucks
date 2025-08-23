import express from 'express';
import { InquiryService } from '@/services/InquiryService';
import { authenticateAdmin } from '@/middleware/auth';
import { validateRequest, inquirySchema } from '@/middleware/validation';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

const router = express.Router();
const inquiryService = new InquiryService();

router.post('/', validateRequest(inquirySchema), async (req, res) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);
    
    const response: ApiResponse = {
      success: true,
      data: inquiry,
      message: 'Inquiry submitted successfully. We will contact you soon!'
    };
    
    res.status(201).json(response);
  } catch (error) {
    logger.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit inquiry'
    });
  }
});

router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const pagination = { page, limit };
    const result = await inquiryService.getInquiries(pagination, status);
    
    const response: ApiResponse = {
      success: true,
      data: result
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inquiries'
    });
  }
});

router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await inquiryService.getInquiryStats();
    
    const response: ApiResponse = {
      success: true,
      data: stats
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Get inquiry stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inquiry statistics'
    });
  }
});

router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid inquiry ID'
      });
    }

    const inquiry = await inquiryService.getInquiryById(id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: inquiry
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inquiry'
    });
  }
});

router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, admin_response } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid inquiry ID'
      });
    }

    if (!status || !['new', 'contacted', 'quoted', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: new, contacted, quoted, or closed'
      });
    }

    const inquiry = await inquiryService.updateInquiryStatus(id, status, admin_response);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: inquiry,
      message: 'Inquiry status updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Update inquiry status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inquiry status'
    });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid inquiry ID'
      });
    }

    const deleted = await inquiryService.deleteInquiry(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Inquiry deleted successfully'
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete inquiry'
    });
  }
});

export default router;