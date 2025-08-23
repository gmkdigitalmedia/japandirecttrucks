const { translate } = require('@vitalets/google-translate-api');
const { Client } = require('pg');

// Database connection - dynamically determine which database to use
const isDevelopment = process.argv.includes('--dev');
const client = new Client({
  host: 'localhost',
  port: isDevelopment ? 5433 : 5432,
  database: isDevelopment ? 'gps_trucks_japan_local' : 'gps_trucks_japan',
  user: isDevelopment ? 'gp' : 'postgres',
  password: isDevelopment ? 'gp' : 'postgres'
});

console.log(`Using ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} database`);

async function translateTitles() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Get all vehicles that need cleanup (Japanese characters OR problematic text)
    const query = `
      SELECT id, title_description 
      FROM vehicles 
      WHERE title_description ~ '[ぁ-んァ-ヶー]'
         OR title_description ILIKE '%CruiserPrado%'
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
    console.log(`Found ${result.rows.length} titles that need translation/cleanup`);

    let successCount = 0;
    let errorCount = 0;

    // Process in batches of 10
    for (let i = 0; i < result.rows.length; i += 10) {
      const batch = result.rows.slice(i, Math.min(i + 10, result.rows.length));
      
      console.log(`Processing batch ${Math.floor(i/10) + 1}/${Math.ceil(result.rows.length/10)}...`);
      
      for (const row of batch) {
        try {
          let cleanedText;
          
          // Check if translation is needed (contains Japanese characters)
          const hasJapanese = /[ぁ-んァ-ヶー]/.test(row.title_description);
          
          if (hasJapanese) {
            // Translate the title
            const translated = await translate(row.title_description, {from: 'ja', to: 'en'});
            cleanedText = translated.text;
            console.log(`🌐 Translated: ${row.title_description.substring(0, 50)}...`);
          } else {
            // English text, just needs cleanup
            cleanedText = row.title_description;
            console.log(`🔧 Cleaning: ${row.title_description.substring(0, 50)}...`);
          }
          
          // Fix common translation issues
          cleanedText = cleanedText
            .replace(/Land Cruiser Prado/gi, 'Landcruiser Prado')
            .replace(/LandcruiserPrado/gi, 'Landcruiser Prado')
            .replace(/Land CruiserPrado/gi, 'Landcruiser Prado')
            .replace(/CruiserPrado/gi, 'cruiser Prado')
            .replace(/Land Cruiser/gi, 'Landcruiser')
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
            .replace(/  +/g, ' ') // Remove extra spaces
            .trim();

          // Update the database
          await client.query(
            'UPDATE vehicles SET title_description = $1 WHERE id = $2',
            [cleanedText, row.id]
          );

          console.log(`✓ ID ${row.id}: ${cleanedText.substring(0, 80)}...`);
          successCount++;

        } catch (error) {
          console.error(`✗ ID ${row.id}: Translation failed - ${error.message}`);
          errorCount++;
        }
      }

      // Small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\nTranslation complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.end();
  }
}

// Run the translation
translateTitles();