const { Client } = require('pg');

// Database connection for development
const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'gps_trucks_japan_local',
  user: 'gp',
  password: 'gp'
});

console.log('Using DEVELOPMENT database for title cleanup');

// Clean up vehicle titles (same logic as backend)
function cleanupTitle(text) {
  return text
    .replace(/Landcruiser Prado/gi, 'Land Cruiser Prado')
    .replace(/LandcruiserPrado/gi, 'Land Cruiser Prado')
    .replace(/Land CruiserPrado/gi, 'Land Cruiser Prado')
    .replace(/CruiserPrado/gi, 'Cruiser Prado')
    .replace(/Landcruiser/gi, 'Land Cruiser')
    .replace(/hilux surf/gi, 'Hilux Surf')
    .replace(/FJ Cruiser/gi, 'FJ Cruiser')
    .replace(/Electric sliding door on both sides/gi, 'Dual Electric Sliding Doors')
    .replace(/Both sides electric/gi, 'Dual Electric')
    .replace(/Both sides power slide/gi, 'Dual Power Sliding')
    .replace(/Rear seat monitor/gi, 'Rear Seat Monitor')
    .replace(/Around view monitor/gi, 'Around View Monitor')
    .replace(/Half leather seat/gi, 'Half Leather Seats')
    .replace(/Sun Roof/gi, 'Sunroof')
    .replace(/Back camera/gi, 'Backup Camera')
    .replace(/Air conditioner/gi, 'Air Conditioning')
    .replace(/Intelligent key/gi, 'Smart Key')
    .replace(/Corner sensor/gi, 'Corner Sensors')
    .replace(/Drive recorder/gi, 'Dash Cam')
    .replace(/One owner car/gi, 'One Owner')
    .replace(/Non smoking/gi, 'Non-Smoking')
    .replace(/Leather winding steering wheel/gi, 'Leather Steering Wheel')
    .replace(/Electric storage mirror/gi, 'Electric Folding Mirrors')
    .replace(/Full flat seat/gi, 'Full Flat Seats')
    .replace(/Cruise control/gi, 'Cruise Control')
    .replace(/inch inch/gi, 'inch')
    .replace(/\s+/g, ' ') // Remove extra spaces
    .trim();
}

async function cleanupTitles() {
  try {
    await client.connect();
    console.log('Connected to development database');

    // Get all vehicles that need cleanup (English text issues)
    const query = `
      SELECT id, title_description 
      FROM vehicles 
      WHERE title_description ILIKE '%CruiserPrado%'
         OR title_description ILIKE '%LandcruiserPrado%'
         OR title_description ILIKE '%Landcruiser Prado%'
         OR title_description ILIKE '%Landcruiser%'
         OR title_description ILIKE '%hilux surf%'
         OR title_description ILIKE '%Back camera%'
         OR title_description ILIKE '%Sun Roof%'
         OR title_description ILIKE '%Air conditioner%'
         OR title_description ILIKE '%One owner car%'
         OR title_description ILIKE '%Non smoking%'
         OR title_description ILIKE '%inch inch%'
      ORDER BY id
    `;
    
    const result = await client.query(query);
    console.log(`Found ${result.rows.length} titles that need cleanup`);

    let successCount = 0;
    let errorCount = 0;

    // Process in batches of 20 (no API rate limits for text cleanup)
    for (let i = 0; i < result.rows.length; i += 20) {
      const batch = result.rows.slice(i, Math.min(i + 20, result.rows.length));
      
      console.log(`Processing batch ${Math.floor(i/20) + 1}/${Math.ceil(result.rows.length/20)}...`);
      
      for (const row of batch) {
        try {
          // Clean up the title
          const cleanedText = cleanupTitle(row.title_description);
          
          // Only update if text actually changed
          if (cleanedText !== row.title_description) {
            // Update the database
            await client.query(
              'UPDATE vehicles SET title_description = $1 WHERE id = $2',
              [cleanedText, row.id]
            );
            
            console.log(`✓ ID ${row.id}: Fixed "${row.title_description.substring(0, 40)}..." → "${cleanedText.substring(0, 40)}..."`);
            successCount++;
          } else {
            console.log(`- ID ${row.id}: No changes needed`);
          }

        } catch (error) {
          console.error(`✗ ID ${row.id}: Cleanup failed - ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\nTitle cleanup complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`No changes needed: ${result.rows.length - successCount - errorCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.end();
  }
}

// Run the cleanup
cleanupTitles();