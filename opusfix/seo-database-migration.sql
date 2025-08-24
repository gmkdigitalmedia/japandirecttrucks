-- Database Migration for Enhanced SEO System
-- Run this SQL to update your database structure

-- 1. Add column to track when SEO was last updated
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS seo_updated_at TIMESTAMP;

-- 2. Create index for faster SEO queries
CREATE INDEX IF NOT EXISTS idx_vehicles_seo_metadata 
ON vehicles(is_available, (seo_metadata IS NULL));

CREATE INDEX IF NOT EXISTS idx_vehicles_seo_updated 
ON vehicles(seo_updated_at);

-- 3. Update existing vehicles with SEO to have updated timestamp
UPDATE vehicles 
SET seo_updated_at = NOW() 
WHERE seo_metadata IS NOT NULL 
  AND seo_updated_at IS NULL;

-- 4. Create trigger to automatically generate SEO for new vehicles
CREATE OR REPLACE FUNCTION trigger_generate_seo_notification() 
RETURNS TRIGGER AS $$
BEGIN
  -- Just mark that SEO is needed by leaving seo_metadata NULL
  -- The background service will pick it up
  NEW.seo_updated_at := NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Install trigger on INSERT
DROP TRIGGER IF EXISTS generate_seo_trigger ON vehicles;
CREATE TRIGGER generate_seo_trigger
  AFTER INSERT ON vehicles
  FOR EACH ROW
  WHEN (NEW.is_available = TRUE AND NEW.seo_metadata IS NULL)
  EXECUTE FUNCTION trigger_generate_seo_notification();

-- 6. View to monitor SEO status
CREATE OR REPLACE VIEW seo_status AS
SELECT 
  COUNT(*) FILTER (WHERE is_available = TRUE) as total_vehicles,
  COUNT(*) FILTER (WHERE is_available = TRUE AND seo_metadata IS NOT NULL) as with_seo,
  COUNT(*) FILTER (WHERE is_available = TRUE AND seo_metadata IS NULL) as without_seo,
  COUNT(*) FILTER (WHERE is_available = TRUE AND seo_metadata IS NOT NULL 
                   AND seo_updated_at > NOW() - INTERVAL '1 day') as updated_today,
  COUNT(*) FILTER (WHERE is_available = TRUE AND seo_metadata IS NOT NULL 
                   AND seo_updated_at < NOW() - INTERVAL '30 days') as outdated_seo,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE is_available = TRUE AND seo_metadata IS NOT NULL) / 
    NULLIF(COUNT(*) FILTER (WHERE is_available = TRUE), 0), 
    2
  ) as seo_coverage_percent
FROM vehicles;

-- 7. Function to manually regenerate SEO for a specific vehicle
CREATE OR REPLACE FUNCTION regenerate_vehicle_seo(vehicle_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE vehicles 
  SET seo_metadata = NULL, 
      seo_updated_at = NULL 
  WHERE id = vehicle_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to regenerate SEO for all vehicles (use with caution!)
CREATE OR REPLACE FUNCTION regenerate_all_seo()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE vehicles 
  SET seo_metadata = NULL, 
      seo_updated_at = NULL 
  WHERE is_available = TRUE;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- 9. Check current SEO status
SELECT * FROM seo_status;

-- 10. Show vehicles without SEO (first 10)
SELECT 
  id, 
  title_description,
  created_at,
  seo_metadata IS NOT NULL as has_seo,
  seo_updated_at
FROM vehicles 
WHERE is_available = TRUE 
  AND seo_metadata IS NULL
ORDER BY created_at DESC
LIMIT 10;