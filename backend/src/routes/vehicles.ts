import express from 'express';
import multer from 'multer';
import { VehicleService } from '@/services/VehicleService';
import { ImageService } from '@/services/ImageService';
import { authenticateAdmin } from '@/middleware/auth';
import { validateRequest, vehicleSearchSchema, vehicleCreateSchema } from '@/middleware/validation';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

const router = express.Router();
const vehicleService = new VehicleService();
const imageService = new ImageService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE || '10485760'),
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp').split(',');
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (fileExtension && allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.post('/search', async (req, res) => {
  try {
    const { error, value } = vehicleSearchSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => detail.message).join(', ')
      });
    }

    const {
      query, manufacturer, model, minPrice, maxPrice, minYear, maxYear,
      maxMileage, driveType, fuelType, hasWarranty, isOnlyAvailable,
      isFeaturedOnly, prefecture, page, limit, sortBy, sortOrder
    } = value;

    const filters = {
      query, manufacturer, model, minPrice, maxPrice, minYear, maxYear,
      maxMileage, driveType, fuelType, hasWarranty, isOnlyAvailable,
      isFeaturedOnly, prefecture
    };

    const pagination = { page, limit };
    const sort = { field: sortBy, order: sortOrder };

    const result = await vehicleService.searchVehicles(filters, pagination, sort);
    
    const response: ApiResponse = {
      success: true,
      data: result
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Vehicle search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search vehicles'
    });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    const vehicles = await vehicleService.getFeaturedVehicles(limit);
    
    const response: ApiResponse = {
      success: true,
      data: vehicles
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Featured vehicles error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get featured vehicles'
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await vehicleService.getVehicleStats();
    
    const response: ApiResponse = {
      success: true,
      data: stats
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Vehicle stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get vehicle statistics'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID'
      });
    }

    const vehicle = await vehicleService.getVehicleById(id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: vehicle
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Get vehicle error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get vehicle'
    });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 6;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID'
      });
    }

    const similar = await vehicleService.getSimilarVehicles(id, limit);
    
    const response: ApiResponse = {
      success: true,
      data: similar
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Similar vehicles error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get similar vehicles'
    });
  }
});

router.post('/', authenticateAdmin, validateRequest(vehicleCreateSchema), async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    
    const response: ApiResponse = {
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully'
    };
    
    return res.status(201).json(response);
  } catch (error) {
    logger.error('Create vehicle error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create vehicle'
    });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID'
      });
    }

    const vehicle = await vehicleService.updateVehicle(id, req.body);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully'
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Update vehicle error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update vehicle'
    });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID'
      });
    }

    const deleted = await vehicleService.deleteVehicle(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Vehicle deleted successfully'
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Delete vehicle error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle'
    });
  }
});

router.post('/:id/images', authenticateAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID'
      });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      });
    }

    const images = await imageService.addVehicleImages(id, req.files);
    
    const response: ApiResponse = {
      success: true,
      data: images,
      message: `${images.length} images uploaded successfully`
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Upload images error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    });
  }
});

router.get('/:id/images', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID'
      });
    }

    const images = await imageService.getVehicleImages(id);
    
    const response: ApiResponse = {
      success: true,
      data: images
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Get images error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get vehicle images'
    });
  }
});

router.put('/:vehicleId/images/:imageId/primary', authenticateAdmin, async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    const imageId = parseInt(req.params.imageId);
    
    if (isNaN(vehicleId) || isNaN(imageId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle or image ID'
      });
    }

    const success = await imageService.setPrimaryImage(imageId, vehicleId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Primary image updated successfully'
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Set primary image error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to set primary image'
    });
  }
});

router.delete('/images/:imageId', authenticateAdmin, async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    
    if (isNaN(imageId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image ID'
      });
    }

    const deleted = await imageService.deleteVehicleImage(imageId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Image deleted successfully'
    };
    
    return res.json(response);
  } catch (error) {
    logger.error('Delete image error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

export default router;