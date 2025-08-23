const { Client } = require('pg');
const fetch = require('node-fetch');

// Production database
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'gps_trucks_japan',
  user: 'postgres',
  password: 'postgres'
});

// Google Translate API endpoint
const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=';

async function translateText(text) {
  try {
    const response = await fetch(TRANSLATE_API + encodeURIComponent(text));
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

function cleanupTitle(text) {
  return text
    .replace(/Landcruiser Prado/gi, 'Land Cruiser Prado')
    .replace(/LandcruiserPrado/gi, 'Land Cruiser Prado')
    .replace(/Land CruiserPrado/gi, 'Land Cruiser Prado')
    .replace(/CruiserPrado/gi, 'Cruiser Prado')
    .replace(/Landcruiser/gi, 'Land Cruiser')
    .replace(/hilux surf/gi, 'Hilux Surf')
    .replace(/One owner/gi, 'One Owner')
    .replace(/Backup camera/gi, 'Backup Camera')
    .replace(/inch inch/gi, 'inch')
    .replace(/\s+/g, ' ')
    .trim();
}

async function translateAllTitles() {
  try {
    await client.connect();
    console.log('Connected to PRODUCTION database');

    // Get all vehicles with Japanese characters
    const query = `
      SELECT id, title_description 
      FROM vehicles 
      WHERE title_description ~ '[ぁ-んァ-ヶー一-龯]'
      ORDER BY id
    `;
    
    const result = await client.query(query);
    console.log(`Found ${result.rows.length} titles with Japanese characters to translate`);

    let successCount = 0;
    let errorCount = 0;

    // Process in batches
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows[i];
      
      try {
        // Translate the Japanese text
        const translated = await translateText(row.title_description);
        
        // Clean up the translated text
        const cleaned = cleanupTitle(translated);
        
        // Update the database
        await client.query(
          'UPDATE vehicles SET title_description = $1 WHERE id = $2',
          [cleaned, row.id]
        );
        
        successCount++;
        console.log(`✓ ID ${row.id}: ${cleaned.substring(0, 80)}...`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`✗ ID ${row.id}: Translation failed - ${error.message}`);
        errorCount++;
      }
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
console.log('Starting PRODUCTION title translation...');
translateAllTitles();