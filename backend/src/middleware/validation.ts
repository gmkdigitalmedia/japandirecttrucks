import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '@/utils/logger';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn('Validation error:', errorMessage);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errorMessage
      });
    }
    
    next();
  };
};

export const vehicleSearchSchema = Joi.object({
  query: Joi.string().optional(),
  manufacturer: Joi.string().optional(),
  model: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  minYear: Joi.number().min(1990).max(2030).optional(),
  maxYear: Joi.number().min(1990).max(2030).optional(),
  maxMileage: Joi.number().min(0).optional(),
  driveType: Joi.string().optional(),
  fuelType: Joi.string().optional(),
  hasWarranty: Joi.boolean().optional(),
  isOnlyAvailable: Joi.boolean().optional(),
  isFeaturedOnly: Joi.boolean().optional(),
  prefecture: Joi.string().optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sortBy: Joi.string().valid('price_total_yen', 'model_year_ad', 'mileage_km', 'created_at').default('created_at'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
});

export const inquirySchema = Joi.object({
  vehicle_id: Joi.number().optional(),
  customer_name: Joi.string().required().min(2).max(255),
  customer_email: Joi.string().email().required(),
  customer_phone: Joi.string().optional().max(50),
  customer_country: Joi.string().optional().max(100),
  message: Joi.string().optional().max(2000),
  inquiry_type: Joi.string().valid('general', 'quote', 'inspection').default('general')
});

export const vehicleCreateSchema = Joi.object({
  source_id: Joi.string().required(),
  source_url: Joi.string().uri().optional(),
  source_site: Joi.string().required(),
  manufacturer_id: Joi.number().optional(),
  model_id: Joi.number().optional(),
  title_description: Joi.string().required(),
  grade: Joi.string().optional(),
  body_style: Joi.string().optional(),
  price_vehicle_yen: Joi.number().min(0).required(),
  price_total_yen: Joi.number().min(0).required(),
  monthly_payment_yen: Joi.number().min(0).optional(),
  model_year_ad: Joi.number().min(1990).max(2030).required(),
  model_year_era: Joi.string().optional(),
  mileage_km: Joi.number().min(0).required(),
  color: Joi.string().optional(),
  transmission_details: Joi.string().optional(),
  engine_displacement_cc: Joi.number().min(0).optional(),
  fuel_type: Joi.string().optional(),
  drive_type: Joi.string().optional(),
  has_repair_history: Joi.boolean().required(),
  is_one_owner: Joi.boolean().default(false),
  has_warranty: Joi.boolean().required(),
  is_accident_free: Joi.boolean().default(true),
  warranty_details: Joi.string().optional(),
  maintenance_details: Joi.string().optional(),
  shaken_status: Joi.string().optional(),
  equipment_details: Joi.string().optional(),
  dealer_name: Joi.string().optional(),
  location_prefecture: Joi.string().optional(),
  location_city: Joi.string().optional(),
  dealer_phone: Joi.string().optional(),
  is_available: Joi.boolean().default(true),
  is_featured: Joi.boolean().default(false),
  export_status: Joi.string().valid('available', 'reserved', 'sold', 'shipped').default('available'),
  admin_notes: Joi.string().optional()
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});