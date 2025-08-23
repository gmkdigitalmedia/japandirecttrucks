import express from 'express';
import axios from 'axios';
import { logger } from '@/utils/logger';

const router = express.Router();

// Image proxy route to serve CarSensor images
router.get('/proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    // Validate that the URL is from CarSensor's CDN
    if (!imageUrl.includes('carsensor.net')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image source'
      });
    }

    // Fetch image with proper headers
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.carsensor.net/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000 // 10 second timeout
    });

    // Set proper headers for image response
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Content-Length': response.headers['content-length'],
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Pipe the image stream directly to the response
    response.data.pipe(res);

  } catch (error) {
    logger.error('Image proxy error:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch image'
    });
  }
});

export default router;