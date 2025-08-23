import pool from '@/config/database';
import { Inquiry, SearchResult, PaginationOptions } from '@/types';
import { logger } from '@/utils/logger';

export class InquiryService {
  async createInquiry(inquiryData: Partial<Inquiry>): Promise<Inquiry> {
    try {
      const query = `
        INSERT INTO inquiries (
          vehicle_id, customer_name, customer_email, customer_phone,
          customer_country, message, inquiry_type, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        inquiryData.vehicle_id,
        inquiryData.customer_name,
        inquiryData.customer_email,
        inquiryData.customer_phone,
        inquiryData.customer_country,
        inquiryData.message,
        inquiryData.inquiry_type || 'general',
        'new'
      ];

      const result = await pool.query(query, values);
      
      logger.info(`Created inquiry from ${inquiryData.customer_email} for vehicle ${inquiryData.vehicle_id}`);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating inquiry:', error);
      throw new Error('Failed to create inquiry');
    }
  }

  async getInquiries(
    pagination: PaginationOptions,
    status?: string
  ): Promise<SearchResult<Inquiry>> {
    try {
      let query = `
        SELECT 
          i.*,
          v.title_description as vehicle_title,
          v.price_total_yen as vehicle_price,
          m.name as manufacturer_name,
          md.name as model_name,
          COUNT(*) OVER() as total_count
        FROM inquiries i
        LEFT JOIN vehicles v ON i.vehicle_id = v.id
        LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
        LEFT JOIN models md ON v.model_id = md.id
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND i.status = $${paramCount}`;
        queryParams.push(status);
      }

      query += ` ORDER BY i.created_at DESC`;

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
          vehicle: row.vehicle_title ? {
            title_description: row.vehicle_title,
            price_total_yen: row.vehicle_price,
            manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : undefined,
            model: row.model_name ? { name: row.model_name } : undefined
          } : undefined
        })),
        total,
        page: pagination.page,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      };
    } catch (error) {
      logger.error('Error getting inquiries:', error);
      throw new Error('Failed to get inquiries');
    }
  }

  async getInquiryById(id: number): Promise<Inquiry | null> {
    try {
      const query = `
        SELECT 
          i.*,
          v.title_description as vehicle_title,
          v.price_total_yen as vehicle_price,
          v.model_year_ad as vehicle_year,
          v.mileage_km as vehicle_mileage,
          m.name as manufacturer_name,
          md.name as model_name
        FROM inquiries i
        LEFT JOIN vehicles v ON i.vehicle_id = v.id
        LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
        LEFT JOIN models md ON v.model_id = md.id
        WHERE i.id = $1
      `;

      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      return {
        ...row,
        vehicle: row.vehicle_title ? {
          title_description: row.vehicle_title,
          price_total_yen: row.vehicle_price,
          model_year_ad: row.vehicle_year,
          mileage_km: row.vehicle_mileage,
          manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : undefined,
          model: row.model_name ? { name: row.model_name } : undefined
        } : undefined
      };
    } catch (error) {
      logger.error('Error getting inquiry by ID:', error);
      throw new Error('Failed to get inquiry');
    }
  }

  async updateInquiryStatus(
    id: number, 
    status: string, 
    adminResponse?: string
  ): Promise<Inquiry | null> {
    try {
      const query = `
        UPDATE inquiries 
        SET status = $2, admin_response = $3, responded_at = CASE WHEN $2 != 'new' THEN NOW() ELSE responded_at END
        WHERE id = $1 
        RETURNING *
      `;

      const result = await pool.query(query, [id, status, adminResponse]);
      
      if (result.rows.length === 0) {
        return null;
      }

      logger.info(`Updated inquiry ${id} status to ${status}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating inquiry status:', error);
      throw new Error('Failed to update inquiry status');
    }
  }

  async getInquiryStats() {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM inquiries',
        'SELECT COUNT(*) as new_inquiries FROM inquiries WHERE status = \'new\'',
        'SELECT COUNT(*) as responded FROM inquiries WHERE status IN (\'contacted\', \'quoted\')',
        `SELECT 
           DATE_TRUNC('day', created_at) as date,
           COUNT(*) as count
         FROM inquiries 
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY DATE_TRUNC('day', created_at)
         ORDER BY date DESC
         LIMIT 30`,
        `SELECT 
           customer_country,
           COUNT(*) as count
         FROM inquiries 
         WHERE customer_country IS NOT NULL
         GROUP BY customer_country
         ORDER BY count DESC
         LIMIT 10`
      ];

      const results = await Promise.all(
        queries.map(query => pool.query(query))
      );

      return {
        total: parseInt(results[0].rows[0].total),
        newInquiries: parseInt(results[1].rows[0].new_inquiries),
        responded: parseInt(results[2].rows[0].responded),
        dailyStats: results[3].rows,
        countryStats: results[4].rows
      };
    } catch (error) {
      logger.error('Error getting inquiry stats:', error);
      throw new Error('Failed to get inquiry stats');
    }
  }

  async deleteInquiry(id: number): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM inquiries WHERE id = $1', [id]);
      logger.info(`Deleted inquiry with ID: ${id}`);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting inquiry:', error);
      throw new Error('Failed to delete inquiry');
    }
  }
}