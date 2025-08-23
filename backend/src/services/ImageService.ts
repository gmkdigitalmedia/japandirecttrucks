import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pool from '@/config/database';
import { VehicleImage } from '@/types';
import { logger } from '@/utils/logger';

export class ImageService {
  private uploadDir: string;
  private allowedTypes: string[];
  private maxFileSize: number;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'images', 'vehicles');
    this.allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp').split(',');
    this.maxFileSize = parseInt(process.env.MAX_IMAGE_SIZE || '10485760'); // 10MB default
    
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async addVehicleImages(vehicleId: number, files: Express.Multer.File[]): Promise<VehicleImage[]> {
    try {
      const vehicleDir = path.join(this.uploadDir, vehicleId.toString());
      
      if (!fs.existsSync(vehicleDir)) {
        fs.mkdirSync(vehicleDir, { recursive: true });
      }

      const images: VehicleImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!this.validateFile(file)) {
          logger.warn(`Invalid file skipped: ${file.originalname}`);
          continue;
        }

        const fileExtension = path.extname(file.originalname).toLowerCase();
        const filename = `image_${Date.now()}_${i}${fileExtension}`;
        const filePath = path.join(vehicleDir, filename);
        const localPath = `/images/vehicles/${vehicleId}/${filename}`;

        await this.processAndSaveImage(file.buffer, filePath);

        const imageData = {
          vehicle_id: vehicleId,
          local_path: localPath,
          filename: filename,
          is_primary: i === 0,
          file_size: file.size,
          image_order: i,
          alt_text: `Vehicle image ${i + 1}`
        };

        const query = `
          INSERT INTO vehicle_images (
            vehicle_id, local_path, filename, is_primary, 
            file_size, image_order, alt_text
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;

        const result = await pool.query(query, [
          imageData.vehicle_id,
          imageData.local_path,
          imageData.filename,
          imageData.is_primary,
          imageData.file_size,
          imageData.image_order,
          imageData.alt_text
        ]);

        images.push(result.rows[0]);
      }

      logger.info(`Added ${images.length} images for vehicle ${vehicleId}`);
      return images;
    } catch (error) {
      logger.error('Error adding vehicle images:', error);
      throw new Error('Failed to add vehicle images');
    }
  }

  private validateFile(file: Express.Multer.File): boolean {
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (!this.allowedTypes.includes(fileExtension)) {
      return false;
    }
    
    if (file.size > this.maxFileSize) {
      return false;
    }
    
    return true;
  }

  private async processAndSaveImage(buffer: Buffer, filePath: string): Promise<void> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      let processedImage = image;
      
      if (metadata.width && metadata.width > 1920) {
        processedImage = processedImage.resize(1920, null, { 
          withoutEnlargement: true 
        });
      }
      
      await processedImage
        .jpeg({ quality: 85, progressive: true })
        .toFile(filePath);

      await this.createThumbnail(buffer, filePath);
      await this.createMediumSize(buffer, filePath);
    } catch (error) {
      logger.error('Error processing image:', error);
      throw error;
    }
  }

  private async createThumbnail(buffer: Buffer, originalPath: string): Promise<void> {
    const thumbnailPath = originalPath.replace(/\.(jpg|jpeg|png|webp)$/i, '_thumb.jpg');
    
    await sharp(buffer)
      .resize(300, 200, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
  }

  private async createMediumSize(buffer: Buffer, originalPath: string): Promise<void> {
    const mediumPath = originalPath.replace(/\.(jpg|jpeg|png|webp)$/i, '_medium.jpg');
    
    await sharp(buffer)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);
  }

  async getVehicleImages(vehicleId: number): Promise<VehicleImage[]> {
    try {
      const query = `
        SELECT * FROM vehicle_images 
        WHERE vehicle_id = $1 
        ORDER BY is_primary DESC, image_order ASC
      `;
      
      const result = await pool.query(query, [vehicleId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting vehicle images:', error);
      throw new Error('Failed to get vehicle images');
    }
  }

  async setPrimaryImage(imageId: number, vehicleId: number): Promise<boolean> {
    try {
      await pool.query('BEGIN');
      
      await pool.query(
        'UPDATE vehicle_images SET is_primary = FALSE WHERE vehicle_id = $1',
        [vehicleId]
      );
      
      const result = await pool.query(
        'UPDATE vehicle_images SET is_primary = TRUE WHERE id = $1 AND vehicle_id = $2',
        [imageId, vehicleId]
      );
      
      await pool.query('COMMIT');
      
      logger.info(`Set image ${imageId} as primary for vehicle ${vehicleId}`);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await pool.query('ROLLBACK');
      logger.error('Error setting primary image:', error);
      throw new Error('Failed to set primary image');
    }
  }

  async deleteVehicleImage(imageId: number): Promise<boolean> {
    try {
      const query = 'SELECT * FROM vehicle_images WHERE id = $1';
      const result = await pool.query(query, [imageId]);
      
      if (result.rows.length === 0) {
        return false;
      }

      const image = result.rows[0];
      const vehicleDir = path.join(this.uploadDir, image.vehicle_id.toString());
      const imagePath = path.join(vehicleDir, image.filename);
      
      const thumbnailPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '_thumb.jpg');
      const mediumPath = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '_medium.jpg');

      [imagePath, thumbnailPath, mediumPath].forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      const deleteResult = await pool.query('DELETE FROM vehicle_images WHERE id = $1', [imageId]);
      
      logger.info(`Deleted image ${imageId} and associated files`);
      return (deleteResult.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error('Error deleting vehicle image:', error);
      throw new Error('Failed to delete vehicle image');
    }
  }

  async reorderImages(vehicleId: number, imageOrders: { id: number; order: number }[]): Promise<boolean> {
    try {
      await pool.query('BEGIN');
      
      for (const { id, order } of imageOrders) {
        await pool.query(
          'UPDATE vehicle_images SET image_order = $1 WHERE id = $2 AND vehicle_id = $3',
          [order, id, vehicleId]
        );
      }
      
      await pool.query('COMMIT');
      
      logger.info(`Reordered images for vehicle ${vehicleId}`);
      return true;
    } catch (error) {
      await pool.query('ROLLBACK');
      logger.error('Error reordering images:', error);
      throw new Error('Failed to reorder images');
    }
  }

  async cleanupOrphanedImages(): Promise<void> {
    try {
      const query = `
        SELECT DISTINCT vehicle_id 
        FROM vehicle_images vi 
        WHERE NOT EXISTS (
          SELECT 1 FROM vehicles v WHERE v.id = vi.vehicle_id
        )
      `;
      
      const result = await pool.query(query);
      const orphanedVehicleIds = result.rows.map(row => row.vehicle_id);
      
      for (const vehicleId of orphanedVehicleIds) {
        const vehicleDir = path.join(this.uploadDir, vehicleId.toString());
        
        if (fs.existsSync(vehicleDir)) {
          fs.rmSync(vehicleDir, { recursive: true, force: true });
          logger.info(`Cleaned up orphaned images for vehicle ${vehicleId}`);
        }
      }

      if (orphanedVehicleIds.length > 0) {
        await pool.query(
          'DELETE FROM vehicle_images WHERE vehicle_id = ANY($1)',
          [orphanedVehicleIds]
        );
      }
      
      logger.info(`Cleaned up ${orphanedVehicleIds.length} orphaned image directories`);
    } catch (error) {
      logger.error('Error cleaning up orphaned images:', error);
      throw new Error('Failed to cleanup orphaned images');
    }
  }
}