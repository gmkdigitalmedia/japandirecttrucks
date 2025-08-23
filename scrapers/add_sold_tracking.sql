-- Add sold tracking fields to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS sold_detected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create an index for faster queries on available vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_available_model 
ON vehicles(is_available, model_id) 
WHERE is_available = TRUE;

-- Optional: Create a view for sold vehicles
CREATE OR REPLACE VIEW recently_sold_vehicles AS
SELECT 
    v.*,
    m.name as manufacturer_name,
    md.name as model_name,
    (SELECT vi.original_url 
     FROM vehicle_images vi 
     WHERE vi.vehicle_id = v.id AND vi.is_primary = TRUE 
     LIMIT 1) as primary_image
FROM vehicles v
LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
LEFT JOIN models md ON v.model_id = md.id
WHERE v.is_available = FALSE 
AND v.sold_detected_at IS NOT NULL
ORDER BY v.sold_detected_at DESC;