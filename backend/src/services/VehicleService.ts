import pool from '@/config/database';
import { Vehicle, SearchFilters, PaginationOptions, SortOptions, SearchResult } from '@/types';
import { logger } from '@/utils/logger';

export class VehicleService {
  async searchVehicles(
    filters: SearchFilters,
    pagination: PaginationOptions,
    sort: SortOptions
  ): Promise<SearchResult<Vehicle>> {
    try {
      let query = `
        SELECT 
          v.*,
          m.name as manufacturer_name,
          md.name as model_name,
          COUNT(*) OVER() as total_count
        FROM vehicles v
        LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
        LEFT JOIN models md ON v.model_id = md.id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramCount = 0;

      if (filters.query) {
        paramCount++;
        query += ` AND v.search_vector @@ plainto_tsquery('english', $${paramCount})`;
        queryParams.push(filters.query);
      }

      if (filters.manufacturer) {
        paramCount++;
        query += ` AND m.name ILIKE $${paramCount}`;
        queryParams.push(`%${filters.manufacturer}%`);
      }

      if (filters.model) {
        paramCount++;
        query += ` AND md.name ILIKE $${paramCount}`;
        queryParams.push(`%${filters.model}%`);
      }

      if (filters.minPrice) {
        paramCount++;
        query += ` AND v.price_total_yen >= $${paramCount}`;
        queryParams.push(filters.minPrice);
      }

      if (filters.maxPrice) {
        paramCount++;
        query += ` AND v.price_total_yen <= $${paramCount}`;
        queryParams.push(filters.maxPrice);
      }

      if (filters.minYear) {
        paramCount++;
        query += ` AND v.model_year_ad >= $${paramCount}`;
        queryParams.push(filters.minYear);
      }

      if (filters.maxYear) {
        paramCount++;
        query += ` AND v.model_year_ad <= $${paramCount}`;
        queryParams.push(filters.maxYear);
      }

      if (filters.maxMileage) {
        paramCount++;
        query += ` AND v.mileage_km <= $${paramCount}`;
        queryParams.push(filters.maxMileage);
      }

      if (filters.driveType) {
        paramCount++;
        query += ` AND v.drive_type ILIKE $${paramCount}`;
        queryParams.push(`%${filters.driveType}%`);
      }

      if (filters.fuelType) {
        paramCount++;
        query += ` AND v.fuel_type ILIKE $${paramCount}`;
        queryParams.push(`%${filters.fuelType}%`);
      }

      if (filters.hasWarranty !== undefined) {
        paramCount++;
        query += ` AND v.has_warranty = $${paramCount}`;
        queryParams.push(filters.hasWarranty);
      }

      if (filters.isOnlyAvailable) {
        query += ` AND v.is_available = TRUE AND v.export_status = 'available'`;
      }

      if (filters.isFeaturedOnly) {
        query += ` AND v.is_featured = TRUE`;
      }

      if (filters.prefecture) {
        paramCount++;
        query += ` AND v.location_prefecture ILIKE $${paramCount}`;
        queryParams.push(`%${filters.prefecture}%`);
      }

      query += ` ORDER BY v.${sort.field} ${sort.order}`;

      const offset = (pagination.page - 1) * pagination.limit;
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      queryParams.push(pagination.limit);

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      queryParams.push(offset);

      const result = await pool.query(query, queryParams);
      
      const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
      const totalPages = Math.ceil(total / pagination.limit);

      return {
        data: result.rows.map(row => ({
          ...row,
          manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : undefined,
          model: row.model_name ? { name: row.model_name } : undefined
        })),
        total,
        page: pagination.page,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      };
    } catch (error) {
      logger.error('Error searching vehicles:', error);
      throw new Error('Failed to search vehicles');
    }
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    try {
      const query = `
        SELECT 
          v.*,
          m.name as manufacturer_name,
          m.logo_path as manufacturer_logo,
          md.name as model_name,
          md.body_type as model_body_type
        FROM vehicles v
        LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
        LEFT JOIN models md ON v.model_id = md.id
        WHERE v.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const vehicle = result.rows[0];
      
      const imagesQuery = `
        SELECT * FROM vehicle_images 
        WHERE vehicle_id = $1 
        ORDER BY is_primary DESC, image_order ASC
      `;
      const imagesResult = await pool.query(imagesQuery, [id]);

      return {
        ...vehicle,
        manufacturer: vehicle.manufacturer_name ? {
          name: vehicle.manufacturer_name,
          logo_path: vehicle.manufacturer_logo
        } : undefined,
        model: vehicle.model_name ? {
          name: vehicle.model_name,
          body_type: vehicle.model_body_type
        } : undefined,
        images: imagesResult.rows.map(img => ({
          ...img,
          url: img.original_url ? `/api/images/proxy?url=${encodeURIComponent(img.original_url)}` : null
        }))
      };
    } catch (error) {
      logger.error('Error getting vehicle by ID:', error);
      throw new Error('Failed to get vehicle');
    }
  }

  async getFeaturedVehicles(limit: number = 8): Promise<Vehicle[]> {
    try {
      const query = `
        SELECT 
          v.*,
          m.name as manufacturer_name,
          md.name as model_name,
          vi.original_url as primary_image_url
        FROM vehicles v
        LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
        LEFT JOIN models md ON v.model_id = md.id
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        WHERE v.is_featured = TRUE 
          AND v.is_available = TRUE 
          AND v.export_status = 'available'
        ORDER BY v.created_at DESC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      
      return result.rows.map(row => ({
        ...row,
        manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : undefined,
        model: row.model_name ? { name: row.model_name } : undefined,
        primary_image: row.primary_image_url ? `/api/images/proxy?url=${encodeURIComponent(row.primary_image_url)}` : null
      }));
    } catch (error) {
      logger.error('Error getting featured vehicles:', error);
      throw new Error('Failed to get featured vehicles');
    }
  }

  async getSimilarVehicles(vehicleId: number, limit: number = 6): Promise<Vehicle[]> {
    try {
      const vehicleQuery = `
        SELECT manufacturer_id, model_id, price_total_yen 
        FROM vehicles 
        WHERE id = $1
      `;
      const vehicleResult = await pool.query(vehicleQuery, [vehicleId]);
      
      if (vehicleResult.rows.length === 0) {
        return [];
      }

      const { manufacturer_id, model_id, price_total_yen } = vehicleResult.rows[0];
      const priceRange = price_total_yen * 0.3;

      const query = `
        SELECT 
          v.*,
          m.name as manufacturer_name,
          md.name as model_name,
          vi.original_url as primary_image_url
        FROM vehicles v
        LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
        LEFT JOIN models md ON v.model_id = md.id
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        WHERE v.id != $1
          AND v.is_available = TRUE
          AND v.export_status = 'available'
          AND (
            v.manufacturer_id = $2 
            OR v.model_id = $3
            OR (v.price_total_yen BETWEEN $4 AND $5)
          )
        ORDER BY 
          CASE WHEN v.manufacturer_id = $2 AND v.model_id = $3 THEN 1
               WHEN v.manufacturer_id = $2 THEN 2
               WHEN v.model_id = $3 THEN 3
               ELSE 4
          END,
          ABS(v.price_total_yen - $6)
        LIMIT $7
      `;
      
      const result = await pool.query(query, [
        vehicleId,
        manufacturer_id,
        model_id,
        price_total_yen - priceRange,
        price_total_yen + priceRange,
        price_total_yen,
        limit
      ]);
      
      return result.rows.map(row => ({
        ...row,
        manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : undefined,
        model: row.model_name ? { name: row.model_name } : undefined,
        primary_image: row.primary_image_url ? `/api/images/proxy?url=${encodeURIComponent(row.primary_image_url)}` : null
      }));
    } catch (error) {
      logger.error('Error getting similar vehicles:', error);
      throw new Error('Failed to get similar vehicles');
    }
  }

  async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const query = `
        INSERT INTO vehicles (
          source_id, source_url, source_site, manufacturer_id, model_id,
          title_description, grade, body_style, price_vehicle_yen, price_total_yen,
          monthly_payment_yen, model_year_ad, model_year_era, mileage_km, color,
          transmission_details, engine_displacement_cc, fuel_type, drive_type,
          has_repair_history, is_one_owner, has_warranty, is_accident_free,
          warranty_details, maintenance_details, shaken_status, equipment_details,
          dealer_name, location_prefecture, location_city, dealer_phone,
          is_available, is_featured, export_status, admin_notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
          $29, $30, $31, $32, $33, $34, $35
        ) RETURNING *
      `;

      const values = [
        vehicleData.source_id,
        vehicleData.source_url,
        vehicleData.source_site,
        vehicleData.manufacturer_id,
        vehicleData.model_id,
        vehicleData.title_description,
        vehicleData.grade,
        vehicleData.body_style,
        vehicleData.price_vehicle_yen,
        vehicleData.price_total_yen,
        vehicleData.monthly_payment_yen,
        vehicleData.model_year_ad,
        vehicleData.model_year_era,
        vehicleData.mileage_km,
        vehicleData.color,
        vehicleData.transmission_details,
        vehicleData.engine_displacement_cc,
        vehicleData.fuel_type,
        vehicleData.drive_type,
        vehicleData.has_repair_history,
        vehicleData.is_one_owner || false,
        vehicleData.has_warranty,
        vehicleData.is_accident_free ?? true,
        vehicleData.warranty_details,
        vehicleData.maintenance_details,
        vehicleData.shaken_status,
        vehicleData.equipment_details,
        vehicleData.dealer_name,
        vehicleData.location_prefecture,
        vehicleData.location_city,
        vehicleData.dealer_phone,
        vehicleData.is_available ?? true,
        vehicleData.is_featured || false,
        vehicleData.export_status || 'available',
        vehicleData.admin_notes
      ];

      const result = await pool.query(query, values);
      logger.info(`Created vehicle with ID: ${result.rows[0].id}`);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating vehicle:', error);
      throw new Error('Failed to create vehicle');
    }
  }

  async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const fields = Object.keys(vehicleData).filter(key => key !== 'id');
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      const query = `
        UPDATE vehicles 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1 
        RETURNING *
      `;

      const values = [id, ...fields.map(field => vehicleData[field as keyof Vehicle])];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      logger.info(`Updated vehicle with ID: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle');
    }
  }

  async deleteVehicle(id: number): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
      logger.info(`Deleted vehicle with ID: ${id}`);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle');
    }
  }

  async getVehicleStats() {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM vehicles',
        'SELECT COUNT(*) as available FROM vehicles WHERE is_available = TRUE AND export_status = \'available\'',
        'SELECT COUNT(*) as featured FROM vehicles WHERE is_featured = TRUE',
        `SELECT 
           m.name, 
           COUNT(*) as count 
         FROM vehicles v 
         LEFT JOIN manufacturers m ON v.manufacturer_id = m.id 
         WHERE v.is_available = TRUE 
         GROUP BY m.name 
         ORDER BY count DESC 
         LIMIT 5`,
        `SELECT 
           CASE 
             WHEN price_total_yen < 1000000 THEN 'Under ¥1M'
             WHEN price_total_yen < 3000000 THEN '¥1M - ¥3M'
             WHEN price_total_yen < 5000000 THEN '¥3M - ¥5M'
             ELSE 'Over ¥5M'
           END as range,
           COUNT(*) as count
         FROM vehicles 
         WHERE is_available = TRUE 
         GROUP BY range`
      ];

      const results = await Promise.all(
        queries.map(query => pool.query(query))
      );

      return {
        total: parseInt(results[0].rows[0].total),
        available: parseInt(results[1].rows[0].available),
        featured: parseInt(results[2].rows[0].featured),
        popularManufacturers: results[3].rows,
        priceDistribution: results[4].rows
      };
    } catch (error) {
      logger.error('Error getting vehicle stats:', error);
      throw new Error('Failed to get vehicle stats');
    }
  }
}