-- GPS Trucks Japan Database Schema
-- Complete schema for Japanese car export platform

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies/Manufacturers
CREATE TABLE manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_path VARCHAR(255),
    country VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle Models
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    manufacturer_id INTEGER REFERENCES manufacturers(id),
    name VARCHAR(100) NOT NULL,
    body_type VARCHAR(50), -- SUV, Sedan, Truck, etc.
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Main Vehicles Table (Based on CarSensor Analysis)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(255) UNIQUE, -- CarSensor ID for updates
    source_url TEXT,
    source_site VARCHAR(50), -- 'carsensor', 'goonet', etc.
    
    -- Identity
    manufacturer_id INTEGER REFERENCES manufacturers(id),
    model_id INTEGER REFERENCES models(id),
    title_description TEXT NOT NULL,
    grade VARCHAR(255), -- '4.7 4WD Multi-less'
    body_style VARCHAR(100), -- 'Cross-country/SUV'
    
    -- Pricing (stored as integers for precision)
    price_vehicle_yen INTEGER NOT NULL,
    price_total_yen INTEGER NOT NULL,
    price_misc_expenses_yen INTEGER GENERATED ALWAYS AS (price_total_yen - price_vehicle_yen) STORED,
    monthly_payment_yen INTEGER,
    
    -- Core Specifications
    model_year_ad INTEGER NOT NULL,
    model_year_era VARCHAR(10), -- 'H18', 'R02'
    mileage_km INTEGER NOT NULL,
    color VARCHAR(100),
    transmission_details VARCHAR(100),
    engine_displacement_cc INTEGER,
    fuel_type VARCHAR(50),
    drive_type VARCHAR(20), -- 4WD, 2WD, AWD
    
    -- Boolean Flags
    has_repair_history BOOLEAN NOT NULL,
    is_one_owner BOOLEAN DEFAULT FALSE,
    has_warranty BOOLEAN NOT NULL,
    is_accident_free BOOLEAN DEFAULT TRUE,
    
    -- Detailed Information
    warranty_details TEXT,
    maintenance_details TEXT,
    shaken_status TEXT, -- Vehicle inspection status
    equipment_details TEXT,
    
    -- Location & Dealer
    dealer_name VARCHAR(512),
    location_prefecture VARCHAR(100),
    location_city VARCHAR(100),
    dealer_phone VARCHAR(50),
    
    -- Status & Management
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    export_status VARCHAR(50) DEFAULT 'available', -- available, reserved, sold, shipped
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_scraped_at TIMESTAMP,
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            title_description || ' ' || 
            COALESCE(grade, '') || ' ' || 
            COALESCE(color, '')
        )
    ) STORED
);

-- Vehicle Images (Self-hosted)
CREATE TABLE vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    original_url TEXT, -- Source URL from scraping
    local_path VARCHAR(512) NOT NULL, -- /images/vehicles/123/image_1.jpg
    filename VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(255),
    file_size INTEGER,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tags/Features
CREATE TABLE vehicle_tags (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    tag_category VARCHAR(50), -- 'feature', 'condition', 'dealer_special'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inquiries/Leads
CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_country VARCHAR(100),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'general', -- general, quote, inspection
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, quoted, closed
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP
);

-- Admin Users
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin', -- admin, moderator, viewer
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Scraper Status and Logs
CREATE TABLE scraper_runs (
    id SERIAL PRIMARY KEY,
    scraper_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- running, completed, failed
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    vehicles_processed INTEGER DEFAULT 0,
    vehicles_added INTEGER DEFAULT 0,
    vehicles_updated INTEGER DEFAULT 0,
    error_message TEXT,
    log_details JSONB
);

-- Create indexes for performance
CREATE INDEX idx_vehicles_search ON vehicles USING GIN(search_vector);
CREATE INDEX idx_vehicles_manufacturer_model ON vehicles(manufacturer_id, model_id);
CREATE INDEX idx_vehicles_price ON vehicles(price_total_yen);
CREATE INDEX idx_vehicles_year_mileage ON vehicles(model_year_ad, mileage_km);
CREATE INDEX idx_vehicles_available ON vehicles(is_available, export_status);
CREATE INDEX idx_vehicles_featured ON vehicles(is_featured, is_available);
CREATE INDEX idx_vehicles_source ON vehicles(source_site, source_id);
CREATE INDEX idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);
CREATE INDEX idx_inquiries_status ON inquiries(status, created_at);
CREATE INDEX idx_inquiries_vehicle ON inquiries(vehicle_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for vehicles table
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial manufacturers
INSERT INTO manufacturers (name, country, is_active) VALUES
('Toyota', 'Japan', TRUE),
('Nissan', 'Japan', TRUE),
('Honda', 'Japan', TRUE),
('Mazda', 'Japan', TRUE),
('Subaru', 'Japan', TRUE),
('Mitsubishi', 'Japan', TRUE),
('Suzuki', 'Japan', TRUE),
('Isuzu', 'Japan', TRUE),
('Lexus', 'Japan', TRUE),
('Infiniti', 'Japan', TRUE),
('Acura', 'Japan', TRUE);

-- Insert popular models (focusing on SUVs and trucks as per spec)
INSERT INTO models (manufacturer_id, name, body_type, is_popular) VALUES
-- Toyota
(1, 'Land Cruiser', 'SUV', TRUE),
(1, 'Land Cruiser Prado', 'SUV', TRUE),
(1, 'Hilux', 'Pickup Truck', TRUE),
(1, 'Hiace', 'Van', TRUE),
(1, 'RAV4', 'SUV', TRUE),
(1, 'Highlander', 'SUV', FALSE),
(1, 'Sequoia', 'SUV', FALSE),
-- Nissan
(2, 'Patrol', 'SUV', TRUE),
(2, 'Navara', 'Pickup Truck', TRUE),
(2, 'X-Trail', 'SUV', FALSE),
(2, 'Pathfinder', 'SUV', FALSE),
-- Honda
(3, 'Pilot', 'SUV', FALSE),
(3, 'Ridgeline', 'Pickup Truck', FALSE),
(3, 'CR-V', 'SUV', FALSE),
-- Mazda
(4, 'CX-5', 'SUV', FALSE),
(4, 'CX-9', 'SUV', FALSE),
(4, 'BT-50', 'Pickup Truck', FALSE);

-- Create admin user (password: admin123 - hashed with bcrypt)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@gpstrucksjapan.com', '$2a$10$8K1p/a0dqbVkp0rXGaMkCOxHq2LY1paOUkr6I8/5OOPQqZGQBJFam', 'Administrator', 'admin');