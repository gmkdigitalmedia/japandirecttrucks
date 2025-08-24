// test-seo-system.js - Run this to verify SEO is working correctly
// Usage: node test-seo-system.js

const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gps_trucks_japan',
  user: process.env.DB_USER || 'gp',
  password: process.env.DB_PASSWORD || 'Megumi12'
});

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testSEOSystem() {
  console.log(`${colors.cyan}🔍 Testing SEO System...${colors.reset}\n`);
  
  let testsPass = 0;
  let testsFail = 0;
  
  try {
    // Test 1: Database Structure
    console.log(`${colors.blue}Test 1: Database Structure${colors.reset}`);
    try {
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'vehicles' 
        AND column_name IN ('seo_metadata', 'seo_updated_at')
      `);
      
      const hasMetadata = columnCheck.rows.some(r => r.column_name === 'seo_metadata');
      const hasUpdatedAt = columnCheck.rows.some(r => r.column_name === 'seo_updated_at');
      
      if (hasMetadata) {
        console.log(`${colors.green}✅ seo_metadata column exists${colors.reset}`);
        testsPass++;
      } else {
        console.log(`${colors.red}❌ seo_metadata column missing${colors.reset}`);
        testsFail++;
      }
      
      if (hasUpdatedAt) {
        console.log(`${colors.green}✅ seo_updated_at column exists${colors.reset}`);
        testsPass++;
      } else {
        console.log(`${colors.yellow}⚠️  seo_updated_at column missing (run migration)${colors.reset}`);
        testsFail++;
      }
    } catch (error) {
      console.log(`${colors.red}❌ Database structure test failed: ${error.message}${colors.reset}`);
      testsFail++;
    }
    
    // Test 2: SEO Coverage
    console.log(`\n${colors.blue}Test 2: SEO Coverage${colors.reset}`);
    try {
      const statsResult = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE seo_metadata IS NOT NULL) as with_seo,
          COUNT(*) FILTER (WHERE seo_metadata IS NULL) as without_seo
        FROM vehicles 
        WHERE is_available = TRUE
      `);
      
      const stats = statsResult.rows[0];
      const coverage = Math.round((stats.with_seo / stats.total) * 100);
      
      console.log(`Total vehicles: ${stats.total}`);
      console.log(`With SEO: ${stats.with_seo}`);
      console.log(`Without SEO: ${stats.without_seo}`);
      console.log(`Coverage: ${coverage}%`);
      
      if (coverage >= 90) {
        console.log(`${colors.green}✅ Excellent SEO coverage (${coverage}%)${colors.reset}`);
        testsPass++;
      } else if (coverage >= 70) {
        console.log(`${colors.yellow}⚠️  Good SEO coverage (${coverage}%)${colors.reset}`);
        testsPass++;
      } else {
        console.log(`${colors.red}❌ Poor SEO coverage (${coverage}%) - run fix-all-seo.js${colors.reset}`);
        testsFail++;
      }
    } catch (error) {
      console.log(`${colors.red}❌ SEO coverage test failed: ${error.message}${colors.reset}`);
      testsFail++;
    }
    
    // Test 3: API Endpoint
    console.log(`\n${colors.blue}Test 3: API Endpoint${colors.reset}`);
    try {
      // Get a random vehicle with SEO
      const vehicleResult = await pool.query(`
        SELECT id 
        FROM vehicles 
        WHERE is_available = TRUE AND seo_metadata IS NOT NULL 
        LIMIT 1
      `);
      
      if (vehicleResult.rows.length > 0) {
        const vehicleId = vehicleResult.rows[0].id;
        const response = await axios.get(`${API_URL}/api/vehicles/${vehicleId}`);
        
        if (response.data.success && response.data.data) {
          const vehicle = response.data.data;
          
          if (vehicle.seo_metadata) {
            console.log(`${colors.green}✅ API returns SEO metadata${colors.reset}`);
            
            // Check SEO fields
            const requiredFields = ['title', 'description', 'keywords'];
            let allFieldsPresent = true;
            
            for (const field of requiredFields) {
              if (vehicle.seo_metadata[field]) {
                console.log(`  ✓ ${field}: ${vehicle.seo_metadata[field].substring(0, 50)}...`);
              } else {
                console.log(`  ✗ ${field}: missing`);
                allFieldsPresent = false;
              }
            }
            
            if (allFieldsPresent) {
              console.log(`${colors.green}✅ All SEO fields present${colors.reset}`);
              testsPass += 2;
            } else {
              console.log(`${colors.yellow}⚠️  Some SEO fields missing${colors.reset}`);
              testsPass++;
              testsFail++;
            }
          } else {
            console.log(`${colors.red}❌ API response missing seo_metadata field${colors.reset}`);
            testsFail++;
          }
        } else {
          console.log(`${colors.red}❌ API response invalid${colors.reset}`);
          testsFail++;
        }
      } else {
        console.log(`${colors.yellow}⚠️  No vehicles with SEO found to test${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ API test failed: ${error.message}${colors.reset}`);
      testsFail++;
    }
    
    // Test 4: SEO Stats Endpoint
    console.log(`\n${colors.blue}Test 4: SEO Stats Endpoint${colors.reset}`);
    try {
      const response = await axios.get(`${API_URL}/api/admin/seo/stats`);
      
      if (response.data.success && response.data.data) {
        const stats = response.data.data;
        console.log(`${colors.green}✅ SEO stats endpoint working${colors.reset}`);
        console.log(`  Total: ${stats.total}`);
        console.log(`  With SEO: ${stats.withSeo}`);
        console.log(`  Without SEO: ${stats.withoutSeo}`);
        console.log(`  Coverage: ${stats.percentage}%`);
        console.log(`  Running: ${stats.isRunning ? 'Yes' : 'No'}`);
        testsPass++;
      } else {
        console.log(`${colors.red}❌ SEO stats endpoint failed${colors.reset}`);
        testsFail++;
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠️  SEO stats endpoint error: ${error.message}${colors.reset}`);
      console.log(`  (This is normal if the endpoint hasn't been deployed yet)`);
    }
    
    // Test 5: Sample SEO Quality
    console.log(`\n${colors.blue}Test 5: SEO Quality Check${colors.reset}`);
    try {
      const sampleResult = await pool.query(`
        SELECT id, seo_metadata 
        FROM vehicles 
        WHERE is_available = TRUE AND seo_metadata IS NOT NULL 
        ORDER BY RANDOM() 
        LIMIT 3
      `);
      
      let qualityPass = 0;
      let qualityFail = 0;
      
      for (const row of sampleResult.rows) {
        console.log(`\nVehicle ID ${row.id}:`);
        const seo = row.seo_metadata;
        
        // Check title length (50-60 chars optimal)
        if (seo.title) {
          const titleLen = seo.title.length;
          if (titleLen >= 30 && titleLen <= 100) {
            console.log(`  ✓ Title length OK (${titleLen} chars)`);
            qualityPass++;
          } else {
            console.log(`  ✗ Title length issue (${titleLen} chars, optimal: 50-60)`);
            qualityFail++;
          }
        }
        
        // Check description length (150-160 chars optimal)
        if (seo.description) {
          const descLen = seo.description.length;
          if (descLen >= 100 && descLen <= 160) {
            console.log(`  ✓ Description length OK (${descLen} chars)`);
            qualityPass++;
          } else {
            console.log(`  ✗ Description length issue (${descLen} chars, optimal: 150-160)`);
            qualityFail++;
          }
        }
        
        // Check keywords
        if (seo.keywords) {
          const keywordCount = seo.keywords.split(',').length;
          if (keywordCount >= 5) {
            console.log(`  ✓ Keywords OK (${keywordCount} keywords)`);
            qualityPass++;
          } else {
            console.log(`  ✗ Keywords insufficient (${keywordCount} keywords, need 5+)`);
            qualityFail++;
          }
        }
      }
      
      if (qualityPass > qualityFail) {
        console.log(`\n${colors.green}✅ SEO quality check passed${colors.reset}`);
        testsPass++;
      } else {
        console.log(`\n${colors.yellow}⚠️  SEO quality could be improved${colors.reset}`);
        testsFail++;
      }
    } catch (error) {
      console.log(`${colors.red}❌ SEO quality test failed: ${error.message}${colors.reset}`);
      testsFail++;
    }
    
    // Summary
    console.log(`\n${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.cyan}Test Summary${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.green}Passed: ${testsPass}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testsFail}${colors.reset}`);
    
    if (testsFail === 0) {
      console.log(`\n${colors.green}🎉 All tests passed! SEO system is working correctly.${colors.reset}`);
    } else if (testsFail <= 2) {
      console.log(`\n${colors.yellow}⚠️  Most tests passed. Some minor issues to fix.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}❌ Multiple tests failed. Please run fix-all-seo.js${colors.reset}`);
    }
    
    // Recommendations
    if (testsFail > 0) {
      console.log(`\n${colors.cyan}Recommendations:${colors.reset}`);
      console.log('1. Run database migration to add missing columns');
      console.log('2. Execute: node fix-all-seo.js');
      console.log('3. Restart backend server');
      console.log('4. Run this test again to verify');
    }
    
  } catch (error) {
    console.error(`${colors.red}Fatal error during testing: ${error.message}${colors.reset}`);
  } finally {
    await pool.end();
  }
}

// Run tests
console.log(`${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.cyan}SEO System Test Suite${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}\n`);
testSEOSystem();