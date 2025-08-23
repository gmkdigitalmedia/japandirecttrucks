// Simple working backend for GPS Trucks Japan
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const compression = require('compression');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const port = process.env.PORT || 8000;

// Keep track of running scraper processes
const runningScrapers = new Map(); // jobId -> { process, startTime }

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gps_trucks_japan',
  user: process.env.DB_USER || 'gp',
  password: process.env.DB_PASSWORD || 'Megumi12',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(compression()); // Enable gzip compression
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Request error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error processing request: ${err.message}`, {
    error: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Serve static images from scraped car_images directory
app.use('/images/scraped', express.static('images/scraped'));

// Image proxy route to serve CarSensor images
app.get('/api/images/proxy', async (req, res) => {
  try {
    const axios = require('axios');
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    // Handle protocol-relative URLs (starting with //)
    let fullImageUrl = imageUrl;
    if (imageUrl.startsWith('//')) {
      fullImageUrl = 'https:' + imageUrl;
    }

    // Validate that the URL is from CarSensor's CDN
    if (!fullImageUrl.includes('carsensor.net')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image source'
      });
    }

    // Fetch image with proper headers to bypass CarSensor protection
    const response = await axios.get(fullImageUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.carsensor.net/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    // Set proper headers for image response
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Content-Length': response.headers['content-length'],
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Pipe the image stream directly to the response
    response.data.pipe(res);

  } catch (error) {
    console.error('Image proxy error:', error);
    
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is healthy!' });
});

// Featured vehicles endpoint
app.get('/api/vehicles/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const query = `
      SELECT DISTINCT ON (v.id)
        v.*,
        m.name as manufacturer_name,
        md.name as model_name,
        vi.local_path as primary_image_path,
        vi.original_url as primary_image_url
      FROM vehicles v
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
      WHERE v.is_featured = TRUE 
        AND v.is_available = TRUE 
      ORDER BY v.id, v.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    const vehicles = result.rows.map(row => ({
      id: row.id,
      title_description: row.title_description,
      price_total_yen: row.price_total_yen,
      price_vehicle_yen: row.price_vehicle_yen,
      model_year_ad: row.model_year_ad,
      mileage_km: row.mileage_km,
      location_prefecture: row.location_prefecture,
      manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : null,
      model: row.model_name ? { name: row.model_name } : null,
      source_url: row.source_url,
      is_featured: row.is_featured,
      is_available: row.is_available,
      created_at: row.created_at,
      primary_image: row.primary_image_url || null
    }));
    
    console.log(`Returning ${vehicles.length} featured vehicles`);
    
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Featured vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get featured vehicles',
      details: error.message
    });
  }
});

// Main vehicles endpoint - GET all vehicles with pagination and filtering
app.get('/api/vehicles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
    const offset = (page - 1) * limit;
    
    // Extract filter parameters
    const { manufacturer, model, q: searchQuery } = req.query;
    
    // Build WHERE conditions
    let whereConditions = ['v.is_available = TRUE'];
    let queryParams = [];
    let paramIndex = 1;
    
    // Add manufacturer filter
    if (manufacturer) {
      whereConditions.push(`m.name ILIKE $${paramIndex}`);
      queryParams.push(manufacturer);
      paramIndex++;
    }
    
    // Add model filter
    if (model) {
      whereConditions.push(`md.name ILIKE $${paramIndex}`);
      queryParams.push(model);
      paramIndex++;
    }
    
    // Add search query filter
    if (searchQuery) {
      whereConditions.push(`(v.title_description ILIKE $${paramIndex} OR m.name ILIKE $${paramIndex} OR md.name ILIKE $${paramIndex})`);
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM vehicles v
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      WHERE ${whereClause}
    `;
    
    const vehiclesQuery = `
      SELECT DISTINCT ON (v.id)
        v.*,
        m.name as manufacturer_name,
        md.name as model_name,
        vi.local_path as primary_image_path,
        vi.original_url as primary_image_url
      FROM vehicles v
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
      WHERE ${whereClause}
      ORDER BY v.id, v.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    // Add pagination parameters
    queryParams.push(limit, offset);
    
    const [countResult, vehiclesResult] = await Promise.all([
      pool.query(countQuery, queryParams.slice(0, -2)), // Count query doesn't need limit/offset
      pool.query(vehiclesQuery, queryParams)
    ]);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    const vehicles = vehiclesResult.rows.map(row => ({
      id: row.id,
      title_description: row.title_description,
      price_vehicle_yen: row.price_vehicle_yen,
      price_total_yen: row.price_total_yen,
      model_year_ad: row.model_year_ad,
      mileage_km: row.mileage_km,
      manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : null,
      model: row.model_name ? { name: row.model_name } : null,
      source_url: row.source_url,
      is_featured: row.is_featured,
      is_available: row.is_available,
      created_at: row.created_at,
      primary_image: row.primary_image_url || null
    }));
    
    // Log for debugging
    if (manufacturer || model || searchQuery) {
      console.log(`Filtered vehicles query: manufacturer="${manufacturer}", model="${model}", search="${searchQuery}", found ${total} results`);
    }
    
    res.json({
      success: true,
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get vehicles',
      details: error.message
    });
  }
});

// Vehicle search endpoint
app.post('/api/vehicles/search', async (req, res) => {
  try {
    console.log('Search request body:', JSON.stringify(req.body));
    console.log('Search request query:', JSON.stringify(req.query));
    console.log('Search request URL:', req.url);
    
    // Parse sort from URL if it's in format "sort=field:order"
    let sortBy = 'created_at';
    let sortOrder = 'DESC';
    
    if (req.query.sort) {
      const [field, order] = req.query.sort.split(':');
      if (field) sortBy = field;
      if (order) sortOrder = order;
    } else if (req.body.sortBy) {
      sortBy = req.body.sortBy;
      sortOrder = req.body.sortOrder || 'DESC';
    }
    
    // Merge body and query params
    const params = { ...req.body, ...req.query };
    const { 
      page = 1, 
      limit = 10,
      manufacturer,
      model,
      query,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      maxMileage
    } = params;
    
    console.log('Sort params:', { sortBy, sortOrder });
    let whereConditions = ['v.is_available = TRUE'];
    let queryParams = [];
    let paramIndex = 1;
    
    // Add manufacturer filter
    if (manufacturer) {
      whereConditions.push(`m.name = $${paramIndex}`);
      queryParams.push(manufacturer);
      paramIndex++;
    }
    
    // Add model filter
    if (model) {
      whereConditions.push(`md.name = $${paramIndex}`);
      queryParams.push(model);
      paramIndex++;
    }
    
    // Add search query filter
    if (query) {
      whereConditions.push(`(v.title_description ILIKE $${paramIndex} OR m.name ILIKE $${paramIndex} OR md.name ILIKE $${paramIndex})`);
      queryParams.push(`%${query}%`);
      paramIndex++;
    }
    
    // Add price filters
    if (minPrice) {
      whereConditions.push(`v.price_total_yen >= $${paramIndex}`);
      queryParams.push(minPrice);
      paramIndex++;
    }
    
    if (maxPrice) {
      whereConditions.push(`v.price_total_yen <= $${paramIndex}`);
      queryParams.push(maxPrice);
      paramIndex++;
    }
    
    // Add year filters
    if (minYear) {
      whereConditions.push(`v.model_year_ad >= $${paramIndex}`);
      queryParams.push(minYear);
      paramIndex++;
    }
    
    if (maxYear) {
      whereConditions.push(`v.model_year_ad <= $${paramIndex}`);
      queryParams.push(maxYear);
      paramIndex++;
    }
    
    // Add mileage filter
    if (maxMileage) {
      whereConditions.push(`v.mileage_km <= $${paramIndex}`);
      queryParams.push(maxMileage);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const searchQuery = `
      WITH sorted_vehicles AS (
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
        WHERE ${whereClause}
        ORDER BY v.${sortBy} ${sortOrder}, v.id
      )
      SELECT * FROM sorted_vehicles
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);
    
    const result = await pool.query(searchQuery, queryParams);
    
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(total / limit);
    
    const vehicles = result.rows.map(row => ({
      id: row.id,
      title_description: row.title_description,
      price_total_yen: row.price_total_yen,
      price_vehicle_yen: row.price_vehicle_yen,
      model_year_ad: row.model_year_ad,
      mileage_km: row.mileage_km,
      location_prefecture: row.location_prefecture,
      manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : null,
      model: row.model_name ? { name: row.model_name } : null,
      source_url: row.source_url,
      is_available: row.is_available,
      created_at: row.created_at,
      primary_image: row.primary_image_url || null
    }));
    
    res.json({
      success: true,
      data: {
        data: vehicles,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search vehicles',
      details: error.message
    });
  }
});

// Manufacturers endpoint
app.get('/api/manufacturers', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.id,
        m.name,
        m.country,
        COUNT(v.id) as vehicle_count
      FROM manufacturers m
      LEFT JOIN vehicles v ON m.id = v.manufacturer_id AND v.is_available = TRUE
      WHERE m.is_active = TRUE
      GROUP BY m.id, m.name, m.country
      HAVING COUNT(v.id) > 0
      ORDER BY COUNT(v.id) DESC, m.name
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Manufacturers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get manufacturers',
      details: error.message
    });
  }
});

// Models for a manufacturer endpoint
app.get('/api/manufacturers/:manufacturerId/models', async (req, res) => {
  try {
    const { manufacturerId } = req.params;
    
    const query = `
      SELECT 
        md.id,
        md.name,
        md.body_type,
        COUNT(v.id) as vehicle_count
      FROM models md
      LEFT JOIN vehicles v ON md.id = v.model_id AND v.is_available = TRUE
      WHERE md.manufacturer_id = $1
      GROUP BY md.id, md.name, md.body_type
      HAVING COUNT(v.id) > 0
      ORDER BY COUNT(v.id) DESC, md.name
    `;
    
    const result = await pool.query(query, [manufacturerId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Models error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get models',
      details: error.message
    });
  }
});

// Vehicles for a specific model endpoint
app.get('/api/models/:modelId/vehicles', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    // First get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM vehicles v
      WHERE v.model_id = $1 AND v.is_available = TRUE
    `;
    const countResult = await pool.query(countQuery, [modelId]);
    const totalCount = parseInt(countResult.rows[0].total);
    
    const query = `
      SELECT DISTINCT ON (v.id)
        v.*,
        m.name as manufacturer_name,
        md.name as model_name,
        vi.original_url as primary_image_url
      FROM vehicles v
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
      WHERE v.model_id = $1 AND v.is_available = TRUE
      ORDER BY v.id, v.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const offset = (page - 1) * limit;
    const result = await pool.query(query, [modelId, limit, offset]);
    
    const vehicles = result.rows.map(row => ({
      id: row.id,
      title_description: row.title_description,
      price_total_yen: row.price_total_yen,
      price_vehicle_yen: row.price_vehicle_yen,
      model_year_ad: row.model_year_ad,
      mileage_km: row.mileage_km,
      location_prefecture: row.location_prefecture,
      manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : null,
      model: row.model_name ? { name: row.model_name } : null,
      source_url: row.source_url,
      is_featured: row.is_featured,
      is_available: row.is_available,
      created_at: row.created_at,
      primary_image: row.primary_image_url || null
    }));
    
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = currentPage < totalPages;
    
    res.json({
      success: true,
      data: vehicles,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        hasMore,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Model vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model vehicles',
      details: error.message
    });
  }
});

// AI Analysis Generation Function
function generateAIAnalysis(vehicle) {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.model_year_ad;
  const avgKmPerYear = 11000; // 11,000 km per year average
  const expectedMileage = vehicleAge * avgKmPerYear;
  
  // Calculate USA price estimate based on vehicle data
  let usaPriceEstimate;
  if (vehicle.model_name && vehicle.model_name.includes('Land Cruiser')) {
    // Land Cruiser pricing in USA
    if (vehicle.model_name.includes('300')) {
      usaPriceEstimate = Math.round(80000 + (2025 - vehicle.model_year_ad) * -3000); // LC300 starts ~$80k
    } else if (vehicle.model_name.includes('200')) {
      usaPriceEstimate = Math.round(64852 + (2025 - vehicle.model_year_ad) * -2500); // LC200 used prices
    } else {
      usaPriceEstimate = Math.round(50000 + (2025 - vehicle.model_year_ad) * -2000); // Prado/other LC
    }
  } else if (vehicle.model_name && vehicle.model_name.includes('Hijet')) {
    usaPriceEstimate = Math.round(25000 + (2025 - vehicle.model_year_ad) * -1500); // Kei trucks
  } else {
    // Generic estimation
    usaPriceEstimate = Math.round(40000 + (2025 - vehicle.model_year_ad) * -2000);
  }
  
  // Ensure minimum price
  usaPriceEstimate = Math.max(usaPriceEstimate, 15000);
  
  const vehiclePriceUSD = Math.round(vehicle.price_total_yen / 150); // Convert to USD
  const savingsAmount = Math.max(0, usaPriceEstimate - vehiclePriceUSD);
  const savingsPercentage = usaPriceEstimate > 0 ? Math.round((savingsAmount / usaPriceEstimate) * 100) : 0;
  
  // Generate confidence score based on various factors
  let confidenceScore = 7; // Base score
  
  // Adjust for mileage
  if (vehicle.mileage_km < expectedMileage * 0.7) confidenceScore += 1; // Low mileage bonus
  if (vehicle.mileage_km > expectedMileage * 1.5) confidenceScore -= 1; // High mileage penalty
  
  // Adjust for age
  if (vehicleAge < 5) confidenceScore += 1; // Newer vehicle bonus
  if (vehicleAge > 15) confidenceScore -= 1; // Older vehicle penalty
  
  // Adjust for savings
  if (savingsPercentage > 30) confidenceScore += 1; // Great deal bonus
  
  // Clamp between 1-10
  confidenceScore = Math.max(1, Math.min(10, confidenceScore));
  
  return {
    value_headline: `Save $${savingsAmount.toLocaleString()} vs USA market`,
    mileage_advantage: vehicle.mileage_km < expectedMileage ? 
      `${Math.round((expectedMileage - vehicle.mileage_km) / 1000)}k km below average` :
      `${Math.round((vehicle.mileage_km - expectedMileage) / 1000)}k km above average`,
    key_benefits: [
      "Japanese maintenance standards",
      "Export documentation included", 
      "Professional inspection",
      savingsPercentage > 20 ? "Exceptional value" : "Competitive pricing"
    ],
    market_comparison: `Compared to similar ${vehicle.model_year_ad} ${vehicle.manufacturer_name || ''} ${vehicle.model_name || ''} in USA market`,
    confidence_score: confidenceScore,
    usa_price_estimate: usaPriceEstimate,
    savings_amount: savingsAmount,
    savings_percentage: savingsPercentage
  };
}

// Stats endpoint - must come before /:id endpoint
app.get('/api/vehicles/stats', async (req, res) => {
  try {
    const queries = [
      'SELECT COUNT(*) as total FROM vehicles',
      'SELECT COUNT(*) as available FROM vehicles WHERE is_available = TRUE',
      'SELECT COUNT(*) as featured FROM vehicles WHERE is_featured = TRUE',
      'SELECT COUNT(*) as inquiries FROM inquiries'
    ];
    
    const results = await Promise.all(
      queries.map(query => pool.query(query))
    );
    
    res.json({
      success: true,
      data: {
        totalVehicles: parseInt(results[0].rows[0].total),
        availableVehicles: parseInt(results[1].rows[0].available),
        featuredVehicles: parseInt(results[2].rows[0].featured),
        totalInquiries: parseInt(results[3].rows[0].inquiries)
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats',
      details: error.message
    });
  }
});

// Individual vehicle endpoint
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        v.*,
        m.name as manufacturer_name,
        md.name as model_name,
        json_agg(
          json_build_object(
            'url', vi.original_url,
            'alt_text', vi.alt_text,
            'is_primary', vi.is_primary
          ) ORDER BY vi.image_order, vi.is_primary DESC
        ) FILTER (WHERE vi.id IS NOT NULL) as images
      FROM vehicles v
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE v.id = $1 AND v.is_available = TRUE
      GROUP BY v.id, m.name, md.name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }
    
    const row = result.rows[0];
    const vehicle = {
      id: row.id,
      title_description: row.title_description,
      price_total_yen: row.price_total_yen,
      price_vehicle_yen: row.price_vehicle_yen,
      model_year_ad: row.model_year_ad,
      mileage_km: row.mileage_km,
      location_prefecture: row.location_prefecture,
      transmission_type: row.transmission_type,
      drivetrain_type: row.drivetrain_type,
      fuel_type: row.fuel_type,
      engine_displacement: row.engine_displacement,
      has_repair_history: row.has_repair_history,
      has_warranty: row.has_warranty,
      dealer_name: row.dealer_name,
      features: row.features,
      detail_specs: row.detail_specs,
      manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : null,
      model: row.model_name ? { name: row.model_name } : null,
      source_url: row.source_url,
      is_featured: row.is_featured,
      is_available: row.is_available,
      created_at: row.created_at,
      images: row.images || [],
      ai_description: row.ai_description
    };
    
    // Generate AI analysis for the vehicle
    vehicle.ai_analysis = generateAIAnalysis({
      ...vehicle,
      manufacturer_name: row.manufacturer_name,
      model_name: row.model_name
    });
    
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Vehicle details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get vehicle details',
      details: error.message
    });
  }
});

// Similar vehicles endpoint
app.get('/api/vehicles/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;
    
    // First get the current vehicle's details
    const currentVehicle = await pool.query(
      'SELECT manufacturer_id, model_id, price_vehicle_yen FROM vehicles WHERE id = $1',
      [id]
    );
    
    if (currentVehicle.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    const { manufacturer_id, model_id, price_vehicle_yen } = currentVehicle.rows[0];
    const priceRange = price_vehicle_yen * 0.3; // 30% price range
    
    const query = `
      SELECT DISTINCT ON (v.id)
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
        AND (
          v.manufacturer_id = $2 
          OR v.model_id = $3
          OR (v.price_vehicle_yen BETWEEN $4 AND $5)
        )
      ORDER BY v.id,
        CASE WHEN v.model_id = $3 THEN 1 ELSE 2 END,
        CASE WHEN v.manufacturer_id = $2 THEN 1 ELSE 2 END,
        ABS(v.price_vehicle_yen - $6),
        v.created_at DESC
      LIMIT $7
    `;
    
    const result = await pool.query(query, [
      id, 
      manufacturer_id, 
      model_id, 
      price_vehicle_yen - priceRange,
      price_vehicle_yen + priceRange,
      price_vehicle_yen,
      limit
    ]);
    
    const vehicles = result.rows.map(row => ({
      id: row.id,
      title_description: row.title_description,
      price_total_yen: row.price_total_yen,
      price_vehicle_yen: row.price_vehicle_yen,
      model_year_ad: row.model_year_ad,
      mileage_km: row.mileage_km,
      location_prefecture: row.location_prefecture,
      manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : null,
      model: row.model_name ? { name: row.model_name } : null,
      source_url: row.source_url,
      is_featured: row.is_featured,
      is_available: row.is_available,
      created_at: row.created_at,
      primary_image: row.primary_image_url || null
    }));
    
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Similar vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get similar vehicles',
      details: error.message
    });
  }
});

// Inquiries endpoint
app.post('/api/inquiries', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      country,
      subject,
      message,
      vehicleInterest,
      type,
      source,
      vehicle_id
    } = req.body;

    // Insert inquiry into database
    const query = `
      INSERT INTO inquiries (
        customer_name, customer_email, customer_phone, customer_country, 
        message, inquiry_type, status, vehicle_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'new', $7
      ) RETURNING id
    `;

    const result = await pool.query(query, [
      name,
      email,
      phone || null,
      country,
      `${subject}: ${message}` || message || null,
      type || 'general',
      vehicle_id || null
    ]);

    const inquiryId = result.rows[0].id;

    console.log(`📧 New inquiry received: ${inquiryId} from ${name} (${email})`);

    res.json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: { id: inquiryId }
    });

  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit inquiry',
      details: error.message
    });
  }
});

// Create inquiries table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    country VARCHAR(100),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    vehicle_interest VARCHAR(255),
    type VARCHAR(50) DEFAULT 'general',
    source VARCHAR(100) DEFAULT 'website',
    vehicle_id INTEGER REFERENCES vehicles(id),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`).then(() => {
  console.log('✅ Inquiries table ready');
}).catch(err => {
  console.error('❌ Error creating inquiries table:', err);
});

// User authentication endpoints
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, country } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await pool.query(`
      INSERT INTO users (name, email, password_hash, phone, country, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, email, phone, country, created_at
    `, [name, email.toLowerCase(), hashedPassword, phone || null, country || null]);

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          created_at: user.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
      details: error.message
    });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, name, email, password_hash, phone, country, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          created_at: user.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login',
      details: error.message
    });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, country, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

// User favorites endpoints
// Add vehicle to favorites
app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id } = req.body;
    const userId = req.user.userId;

    if (!vehicle_id) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle ID is required'
      });
    }

    // Check if already favorited
    const existing = await pool.query(
      'SELECT id FROM user_favorites WHERE user_id = $1 AND vehicle_id = $2',
      [userId, vehicle_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle already in favorites'
      });
    }

    // Add to favorites
    await pool.query(
      'INSERT INTO user_favorites (user_id, vehicle_id, created_at) VALUES ($1, $2, NOW())',
      [userId, vehicle_id]
    );

    res.json({
      success: true,
      message: 'Vehicle added to favorites'
    });

  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add favorite'
    });
  }
});

// Remove vehicle from favorites
app.delete('/api/favorites/:vehicleId', authenticateToken, async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const userId = req.user.userId;

    await pool.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND vehicle_id = $2',
      [userId, vehicleId]
    );

    res.json({
      success: true,
      message: 'Vehicle removed from favorites'
    });

  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove favorite'
    });
  }
});

// Get user favorites
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const query = `
      SELECT DISTINCT ON (v.id)
        v.*,
        m.name as manufacturer_name,
        md.name as model_name,
        vi.local_path as primary_image_path,
        vi.original_url as primary_image_url,
        uf.created_at as favorited_at
      FROM user_favorites uf
      JOIN vehicles v ON uf.vehicle_id = v.id
      LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
      LEFT JOIN models md ON v.model_id = md.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
      WHERE uf.user_id = $1
      ORDER BY v.id, uf.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    const favorites = result.rows.map(row => ({
      id: row.id,
      title_description: row.title_description,
      price_total_yen: row.price_total_yen,
      price_vehicle_yen: row.price_vehicle_yen,
      model_year_ad: row.model_year_ad,
      mileage_km: row.mileage_km,
      location_prefecture: row.location_prefecture,
      manufacturer: row.manufacturer_name ? { name: row.manufacturer_name } : null,
      model: row.model_name ? { name: row.model_name } : null,
      source_url: row.source_url,
      is_featured: row.is_featured,
      is_available: row.is_available,
      created_at: row.created_at,
      favorited_at: row.favorited_at,
      primary_image: row.primary_image_url || null
    }));

    res.json({
      success: true,
      data: favorites
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get favorites'
    });
  }
});

// Admin endpoint to get all inquiries
app.get('/api/admin/inquiries', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        i.*,
        v.title_description as vehicle_title
      FROM inquiries i
      LEFT JOIN vehicles v ON i.vehicle_id = v.id
      ORDER BY i.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) FROM inquiries';
    
    const [result, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery)
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        inquiries: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inquiries'
    });
  }
});

// Create users table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`).then(() => {
  console.log('✅ Users table ready');
}).catch(err => {
  console.error('❌ Error creating users table:', err);
});

// Create user_favorites table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, vehicle_id)
  )
`).then(() => {
  console.log('✅ User favorites table ready');
}).catch(err => {
  console.error('❌ Error creating user_favorites table:', err);
});

// Admin makes and models management endpoints
app.get('/api/admin/makes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM manufacturers ORDER BY name');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get makes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get makes'
    });
  }
});

app.post('/api/admin/makes', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Make name is required'
      });
    }
    
    // Check if make already exists
    const existing = await pool.query(
      'SELECT id FROM manufacturers WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Make already exists'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO manufacturers (name) VALUES ($1) RETURNING *',
      [name]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add make error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add make'
    });
  }
});

app.delete('/api/admin/makes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if make has associated models
    const models = await pool.query(
      'SELECT COUNT(*) FROM models WHERE manufacturer_id = $1',
      [id]
    );
    
    if (parseInt(models.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete make with associated models'
      });
    }
    
    await pool.query('DELETE FROM manufacturers WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Make deleted successfully'
    });
  } catch (error) {
    console.error('Delete make error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete make'
    });
  }
});

app.get('/api/admin/models', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, man.name as manufacturer_name 
      FROM models m
      JOIN manufacturers man ON m.manufacturer_id = man.id
      ORDER BY man.name, m.name
    `);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get models'
    });
  }
});

app.post('/api/admin/models', async (req, res) => {
  try {
    const { name, manufacturer_id } = req.body;
    
    if (!name || !manufacturer_id) {
      return res.status(400).json({
        success: false,
        error: 'Model name and manufacturer are required'
      });
    }
    
    // Check if model already exists for this manufacturer
    const existing = await pool.query(
      'SELECT id FROM models WHERE LOWER(name) = LOWER($1) AND manufacturer_id = $2',
      [name, manufacturer_id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Model already exists for this manufacturer'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO models (name, manufacturer_id) VALUES ($1, $2) RETURNING *',
      [name, manufacturer_id]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add model error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add model'
    });
  }
});

app.delete('/api/admin/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if model has associated vehicles
    const vehicles = await pool.query(
      'SELECT COUNT(*) FROM vehicles WHERE model_id = $1',
      [id]
    );
    
    if (parseInt(vehicles.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete model with associated vehicles'
      });
    }
    
    await pool.query('DELETE FROM models WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete model'
    });
  }
});

// Admin vehicle management endpoints
app.delete('/api/admin/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle'
    });
  }
});

app.post('/api/admin/vehicles/add-single', async (req, res) => {
  try {
    const { url, manufacturer_id, model_id, model_name } = req.body;
    
    // Basic validation
    if (!url || !manufacturer_id) {
      return res.status(400).json({
        success: false,
        error: 'URL and manufacturer are required'
      });
    }
    
    // Either model_id or model_name must be provided
    if (!model_id && !model_name) {
      return res.status(400).json({
        success: false,
        error: 'Either select a model or provide a custom model name'
      });
    }
    
    // Check if vehicle already exists
    const existing = await pool.query(
      'SELECT id FROM vehicles WHERE url = $1',
      [url]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle with this URL already exists'
      });
    }
    
    // If custom model name provided, create it first
    let finalModelId = model_id;
    if (model_name && !model_id) {
      try {
        // Check if model already exists
        const existingModel = await pool.query(
          'SELECT id FROM models WHERE LOWER(name) = LOWER($1) AND manufacturer_id = $2',
          [model_name, manufacturer_id]
        );
        
        if (existingModel.rows.length > 0) {
          finalModelId = existingModel.rows[0].id;
        } else {
          // Create new model
          const newModel = await pool.query(
            'INSERT INTO models (name, manufacturer_id) VALUES ($1, $2) RETURNING id',
            [model_name, manufacturer_id]
          );
          finalModelId = newModel.rows[0].id;
          console.log(`Created new model: ${model_name} with ID ${finalModelId}`);
        }
      } catch (error) {
        console.error('Error creating model:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create model'
        });
      }
    }
    
    // Use the single vehicle scraper to fetch and add this vehicle
    const { spawn } = require('child_process');
    const path = require('path');
    
    const scraperPath = path.join(process.cwd(), 'scrapers', 'scraper_single_vehicle.py');
    logger.info(`Starting single vehicle scraper for URL: ${url}`);
    
    const scraperProcess = spawn('python3', [
      scraperPath,
      url,
      manufacturer_id.toString(),
      finalModelId.toString()
    ], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    let output = '';
    let error = '';
    
    scraperProcess.stdout.on('data', (data) => {
      output += data.toString();
      logger.info(`Single vehicle scraper stdout: ${data.toString().trim()}`);
    });
    
    scraperProcess.stderr.on('data', (data) => {
      error += data.toString();
      logger.error(`Single vehicle scraper stderr: ${data.toString().trim()}`);
    });
    
    scraperProcess.on('close', async (code) => {
      logger.info(`Single vehicle scraper finished with code: ${code}`);
      
      if (code === 0) {
        // Success - check if vehicle was added
        const newVehicle = await pool.query(
          'SELECT id FROM vehicles WHERE url = $1',
          [url]
        );
        
        if (newVehicle.rows.length > 0) {
          logger.info(`Vehicle successfully added with ID: ${newVehicle.rows[0].id}`);
          res.json({
            success: true,
            data: {
              id: newVehicle.rows[0].id
            }
          });
        } else {
          logger.error('Scraper completed but no vehicle found in database');
          res.status(500).json({
            success: false,
            error: 'Failed to add vehicle - scraper did not save data'
          });
        }
      } else {
        logger.error('Single vehicle scraper failed:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to scrape vehicle data: ' + (error || 'Unknown error')
        });
      }
    });
    
    scraperProcess.on('error', (err) => {
      logger.error('Failed to start single vehicle scraper:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to start scraper process'
      });
    });
    
  } catch (error) {
    console.error('Add single vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add vehicle'
    });
  }
});

// Scraper job management endpoints
app.get('/api/admin/scraper-jobs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sj.*,
        m.name as manufacturer_name,
        mo.name as model_name
      FROM scraper_jobs sj
      JOIN manufacturers m ON sj.manufacturer_id = m.id
      JOIN models mo ON sj.model_id = mo.id
      ORDER BY sj.created_at DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get scraper jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scraper jobs'
    });
  }
});

app.post('/api/admin/scraper-jobs', async (req, res) => {
  try {
    const { search_url, manufacturer_id, model_id, model_name } = req.body;
    
    if (!search_url || !manufacturer_id) {
      return res.status(400).json({
        success: false,
        error: 'Search URL and manufacturer are required'
      });
    }
    
    if (!model_id && !model_name) {
      return res.status(400).json({
        success: false,
        error: 'Either select a model or provide a custom model name'
      });
    }
    
    // Get manufacturer name for the robust scraper
    const manufacturerResult = await pool.query(
      'SELECT name FROM manufacturers WHERE id = $1',
      [manufacturer_id]
    );
    
    if (manufacturerResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid manufacturer ID'
      });
    }
    
    const manufacturerName = manufacturerResult.rows[0].name;
    let finalModelName = model_name;
    let finalModelId = model_id;
    
    // If model_id provided, get the model name
    if (model_id && !model_name) {
      const modelResult = await pool.query(
        'SELECT name FROM models WHERE id = $1 AND manufacturer_id = $2',
        [model_id, manufacturer_id]
      );
      
      if (modelResult.rows.length > 0) {
        finalModelName = modelResult.rows[0].name;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid model ID for the given manufacturer'
        });
      }
    }
    
    // If custom model name provided, the robust scraper will create it automatically
    if (model_name && !model_id) {
      // Check if model already exists (for job record)
      const existingModel = await pool.query(
        'SELECT id FROM models WHERE LOWER(name) = LOWER($1) AND manufacturer_id = $2',
        [model_name, manufacturer_id]
      );
      
      if (existingModel.rows.length > 0) {
        finalModelId = existingModel.rows[0].id;
      }
      // If not exists, set to null - the scraper will create it and we'll update later
    }
    
    // Insert job record
    const result = await pool.query(`
      INSERT INTO scraper_jobs (
        search_url, manufacturer_id, model_id, status, created_at
      ) VALUES (
        $1, $2, $3, 'pending', NOW()
      ) RETURNING id
    `, [search_url, manufacturer_id, finalModelId]);
    
    const jobId = result.rows[0].id;
    
    // Start the scraper in background
    const { spawn } = require('child_process');
    const path = require('path');
    
    // Use the proven working pattern (like Hijet scraper)
    const scraperPath = path.join(process.cwd(), 'scrapers', 'scraper_working_pattern.py');
    logger.info(`Starting robust scraper job ${jobId} with path: ${scraperPath}`);
    logger.info(`Parameters: ${manufacturerName}, ${finalModelName}`);
    
    const scraperProcess = spawn('python3', [
      scraperPath,
      search_url,
      manufacturer_id.toString(),
      finalModelId.toString(),
      jobId.toString()  
    ], {
      detached: false,  // Changed to false for better error handling
      stdio: ['ignore', 'pipe', 'pipe'],  // Capture stdout and stderr
      cwd: process.cwd()
    });
    
    // Track the process
    runningScrapers.set(jobId, {
      process: scraperProcess,
      startTime: new Date(),
      manufacturer_id,
      model_id: finalModelId,
      manufacturer_name: manufacturerName,
      model_name: finalModelName
    });
    
    // Update job with PID and running status
    await pool.query(
      'UPDATE scraper_jobs SET status = $1 WHERE id = $2',
      ['running', jobId]
    );
    
    // Log process start
    logger.info(`Scraper process started with PID: ${scraperProcess.pid} for job ${jobId}`);
    
    // Handle process output
    scraperProcess.stdout.on('data', (data) => {
      logger.info(`Scraper ${jobId} stdout: ${data.toString().trim()}`);
    });
    
    scraperProcess.stderr.on('data', (data) => {
      logger.error(`Scraper ${jobId} stderr: ${data.toString().trim()}`);
    });
    
    // Handle process exit
    scraperProcess.on('close', async (code) => {
      logger.info(`Scraper job ${jobId} finished with code: ${code}`);
      
      // Remove from running scrapers
      runningScrapers.delete(jobId);
      
      if (code !== 0) {
        try {
          await pool.query(
            'UPDATE scraper_jobs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3',
            ['failed', `Process exited with code ${code}`, jobId]
          );
        } catch (err) {
          logger.error(`Failed to update job ${jobId} status:`, err);
        }
      }
    });
    
    scraperProcess.on('error', async (error) => {
      logger.error(`Failed to start scraper process for job ${jobId}:`, error);
      
      // Remove from running scrapers
      runningScrapers.delete(jobId);
      
      try {
        await pool.query(
          'UPDATE scraper_jobs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3',
          ['failed', `Failed to start process: ${error.message}`, jobId]
        );
      } catch (err) {
        logger.error(`Failed to update job ${jobId} status:`, err);
      }
    });
    
    // Don't unref so we can track the process
    // scraperProcess.unref();
    
    res.json({
      success: true,
      data: { id: jobId, pid: scraperProcess.pid }
    });
  } catch (error) {
    logger.error('Create scraper job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create scraper job'
    });
  }
});

// Cancel scraper job endpoint
app.post('/api/admin/scraper-jobs/:id/cancel', async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    // Check if job exists and is running
    const job = await pool.query(
      'SELECT * FROM scraper_jobs WHERE id = $1',
      [jobId]
    );
    
    if (job.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    if (job.rows[0].status !== 'running' && job.rows[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Job is not running or pending'
      });
    }
    
    // Kill the process if it's running
    const runningJob = runningScrapers.get(jobId);
    if (runningJob && runningJob.process) {
      try {
        runningJob.process.kill('SIGTERM');
        logger.info(`Killed scraper process for job ${jobId}`);
      } catch (killError) {
        logger.error(`Error killing process for job ${jobId}:`, killError);
      }
      runningScrapers.delete(jobId);
    }
    
    // Update job status to cancelled
    await pool.query(
      'UPDATE scraper_jobs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3',
      ['cancelled', 'Job cancelled by user', jobId]
    );
    
    logger.info(`Scraper job ${jobId} cancelled by user`);
    
    res.json({
      success: true,
      message: 'Job cancelled successfully'
    });
    
  } catch (error) {
    logger.error('Cancel scraper job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel job'
    });
  }
});

// Create scraper_jobs table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS scraper_jobs (
    id SERIAL PRIMARY KEY,
    search_url TEXT NOT NULL,
    manufacturer_id INTEGER REFERENCES manufacturers(id),
    model_id INTEGER REFERENCES models(id),
    status VARCHAR(50) DEFAULT 'pending',
    total_found INTEGER DEFAULT 0,
    total_added INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
  )
`).then(() => {
  console.log('✅ Scraper jobs table ready');
}).catch(err => {
  console.error('❌ Error creating scraper_jobs table:', err);
});

// Start server
app.listen(port, () => {
  console.log(`🚗 Japan Direct Trucks Backend running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🚙 Featured vehicles: http://localhost:${port}/api/vehicles/featured`);
});

// Test database connection on startup
pool.query('SELECT NOW() as current_time, COUNT(*) as vehicle_count FROM vehicles', (err, result) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully!');
    console.log(`📊 Found ${result.rows[0].vehicle_count} vehicles in database`);
    console.log(`🕐 Server time: ${result.rows[0].current_time}`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});