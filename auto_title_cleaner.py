#!/usr/bin/env python3
"""
Auto Title Cleaner - Background Process
Monitors database for vehicles with Japanese text and automatically cleans them
Runs continuously in background without interfering with scrapers
"""

import time
import psycopg2
import requests
import urllib.parse
import re
from datetime import datetime

# Database connection
DATABASE_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'gps_trucks_japan',
    'user': 'gp',
    'password': 'Megumi12'
}

def translate_japanese_text(text):
    """Translate Japanese text to English"""
    if not text or not isinstance(text, str):
        return text
    
    # Check if text contains Japanese characters
    if not re.search(r'[ぁ-んァ-ヶー一-龯]', text):
        return text
    
    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q={urllib.parse.quote(text)}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data and data[0] and data[0][0] and data[0][0][0]:
                return data[0][0][0]
        return text
    except Exception as e:
        print(f"Translation failed: {e}")
        return text

def clean_title(title):
    """Clean and standardize title"""
    if not title:
        return title
    
    # First translate Japanese text
    cleaned = translate_japanese_text(title)
    
    # Fix naming issues
    cleaned = re.sub(r'Land Cruiser Prado', 'Landcruiser Prado', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'LandcruiserPrado', 'Landcruiser Prado', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'Land CruiserPrado', 'Landcruiser Prado', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'CruiserPrado', 'cruiser Prado', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'Land Cruiser', 'Landcruiser', cleaned, flags=re.IGNORECASE)
    
    # Clean up common issues
    cleaned = re.sub(r'hilux surf', 'Hilux Surf', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'inch inch', 'inch', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned

def process_dirty_titles():
    """Find and clean titles with Japanese text or naming issues"""
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cursor = conn.cursor()
        
        # Find vehicles that need cleaning
        query = """
        SELECT id, title_description 
        FROM vehicles 
        WHERE title_description ~ '[ぁ-んァ-ヶー一-龯]'
           OR title_description ILIKE '%Land Cruiser%'
           OR title_description ILIKE '%CruiserPrado%'
           OR title_description ILIKE '%LandcruiserPrado%'
        ORDER BY id ASC
        LIMIT 1000
        """
        
        cursor.execute(query)
        dirty_vehicles = cursor.fetchall()
        
        if not dirty_vehicles:
            return 0
        
        print(f"[{datetime.now()}] Found {len(dirty_vehicles)} titles to clean")
        
        cleaned_count = 0
        for vehicle_id, title in dirty_vehicles:
            try:
                cleaned_title = clean_title(title)
                
                if cleaned_title != title:
                    # Update the title
                    cursor.execute(
                        "UPDATE vehicles SET title_description = %s WHERE id = %s",
                        (cleaned_title, vehicle_id)
                    )
                    
                    print(f"✓ ID {vehicle_id}: {title[:50]}... → {cleaned_title[:50]}...")
                    cleaned_count += 1
                    
                    # Small delay to avoid overwhelming translation API
                    time.sleep(0.2)
                    
            except Exception as e:
                print(f"✗ Failed to clean ID {vehicle_id}: {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        if cleaned_count > 0:
            print(f"[{datetime.now()}] Cleaned {cleaned_count} titles")
        
        return cleaned_count
        
    except Exception as e:
        print(f"Database error: {e}")
        return 0

def main():
    """Main loop - runs continuously in background"""
    print("🚗 Auto Title Cleaner started")
    print("Monitoring database for titles that need cleaning...")
    
    while True:
        try:
            cleaned = process_dirty_titles()
            
            # Wait longer if no work to do, shorter if actively cleaning
            sleep_time = 60 if cleaned == 0 else 5
            time.sleep(sleep_time)
            
        except KeyboardInterrupt:
            print("\n🛑 Auto Title Cleaner stopped")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")
            time.sleep(60)  # Wait a minute before retrying

if __name__ == "__main__":
    main()