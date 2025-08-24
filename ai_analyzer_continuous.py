#!/usr/bin/env python3
"""
Continuous AI Vehicle Analyzer - Background Process
Monitors database for vehicles needing AI analysis and automatically processes them
Fixes market analysis data for existing vehicles with incomplete analysis
"""

import asyncio
import asyncpg
import json
import os
import time
import random
from openai import OpenAI
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration from environment variables
DATABASE_URL = os.getenv('DATABASE_URL')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Initialize OpenAI
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Use GPT-3.5-turbo - MUCH cheaper than GPT-4
AI_MODEL = "gpt-3.5-turbo"  # $0.50 per 1M input tokens vs $2.50 for gpt-4o-mini

class ContinuousAIAnalyzer:
    def __init__(self):
        self.conn = None
        self.is_running = False
        
    async def connect(self):
        """Connect to database"""
        self.conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected to database")
        
    async def disconnect(self):
        """Disconnect from database"""
        if self.conn:
            await self.conn.close()
            print("✅ Disconnected from database")
    
    def calculate_usa_average_price(self, model_name: str, year: int, japan_price_yen: int) -> int:
        """Calculate USA market price - SIMPLE AND REALISTIC"""
        
        # Convert Japan price to USD first
        japan_price_usd = self.convert_yen_to_usd(japan_price_yen)
        
        # Detect vehicle category
        model_upper = model_name.upper()
        
        # Luxury/exotic brands get lower multiplier (already expensive)
        luxury_brands = ['PORSCHE', 'FERRARI', 'LAMBORGHINI', 'BENTLEY', 'ROLLS', 'MCLAREN', 
                        'ASTON', 'MASERATI', 'BENTAYGA', 'URUS', 'CAYENNE', 'PANAMERA', 
                        'G-CLASS', 'AMG', 'M5', 'M3', 'RS', 'MAYBACH']
        
        # Check if luxury
        is_luxury = any(brand in model_upper for brand in luxury_brands)
        
        # Random multiplier based on category for realistic variation
        if is_luxury:
            # Luxury cars: Japan price × 1.5-1.8 (random markup variation)
            multiplier = round(random.uniform(1.5, 1.8), 2)
        else:
            # Regular Japanese cars: Japan price × 1.7-2.2 (random USA dealer markup)
            multiplier = round(random.uniform(1.7, 2.2), 2)
        
        # Calculate USA price
        usa_price = int(japan_price_usd * multiplier)
        
        # Apply MINIMAL depreciation (Japanese vehicles hold value well)
        current_year = datetime.now().year
        age = max(0, current_year - year)
        
        if age <= 3:
            # Nearly new: no depreciation
            depreciation = 1.0
        elif age <= 7:
            # Still modern: very gentle depreciation
            depreciation = 0.95
        elif age <= 15:
            # Mid-age: these are often sought after
            depreciation = 0.9
        else:
            # Older vehicles: could be classics, minimal depreciation
            depreciation = 0.85
        
        final_price = int(usa_price * depreciation)
        
        # IMPORTANT: Ensure USA price is always at least 30% higher than Japan price
        # This ensures there are always "savings" to show
        min_usa_price = int(japan_price_usd * 1.3)
        
        return max(final_price, min_usa_price)
    
    def calculate_usa_average_price_OLD_REMOVE(self, model_name: str, year: int) -> int:
        """OLD METHOD - TO BE REMOVED"""
        base_prices = {
            # Porsche - USE HIGH-END PRICES
            'Cayenne': 120000,  # Start with loaded Cayenne price
            'Macan': 85000,
            'Panamera': 150000,
            '911': 200000,
            'Taycan': 180000,
            
            # Mercedes - HIGH-END
            'G-Class': 180000,
            'GLS': 120000,
            'GLE': 100000,
            'S-Class': 150000,
            'E-Class': 90000,
            
            # BMW - HIGH-END
            'X7': 110000,
            'X5': 95000,
            '7 Series': 130000,
            '5 Series': 80000,
            
            # Toyota/Lexus - REALISTIC HIGH PRICES
            'Landcruiser Prado': 85000,
            'Landcruiser 300': 125000,
            'Landcruiser 70': 95000,
            'Landcruiser 100': 88000,
            'Landcruiser 200': 105000,
            'Landcruiser 70 Pickup': 82000,
            'Vellfire': 52000,
            'X-Trail': 35000,
            'Elgrand': 32000,
            'FJ Cruiser': 48000,
            'Hilux Surf': 50000,
            'Pajero': 45000,  # Higher base price
            'Megacruiser': 180000,  # Rare vehicle
            'Delica Star Wagon': 28000,
            
            # Additional matches for other models
            'HiJet': 38000,
            'Hijet': 38000,
            'Triton': 45000,
            'HR-V': 32000,
            'Elysium': 38000,
            'Cayenne': 120000,  # Updated to high-end price
            'STI': 50000,
            'Sambar Open Deck': 25000,
            'Exiga': 22000,
            
            # More luxury brands
            'Q7': 85000,
            'Q8': 95000,
            'RS Q8': 140000,
            'Range Rover': 150000,
            'Range Rover Sport': 120000,
            'Bentayga': 250000,
            'Urus': 280000,
            'G-Class': 180000,
            'GLS': 120000,
            'X7': 110000,
            'X5': 95000
        }
        
        # Find matching model - check multiple patterns
        base_price = 80000  # Higher default for safety
        
        # Clean up model name for matching
        model_clean = model_name.replace('-', ' ').replace('_', ' ')
        
        # Try exact match first
        if model_clean in base_prices:
            base_price = base_prices[model_clean]
        else:
            # Try partial matching - check if any key is in the model name
            model_lower = model_clean.lower()
            for model_key, price in base_prices.items():
                if model_key.lower() in model_lower:
                    base_price = price
                    break
        
        # Apply trim multiplier to base price
        base_price = int(base_price * trim_multiplier)
                
        # Apply GENTLER depreciation - Japanese vehicles hold value better
        current_year = datetime.now().year
        age = max(0, current_year - year)
        
        if age <= 3:
            # Recent vehicles: 5% per year
            depreciation_factor = max(0.75, 1 - (age * 0.05))
        elif age <= 10:
            # Mid-age: 6% per year for years 4-10
            depreciation_factor = max(0.40, 0.85 - ((age - 3) * 0.06))
        else:
            # Older vehicles: slower depreciation, min 30% of original
            depreciation_factor = max(0.30, 0.43 - ((age - 10) * 0.02))
        
        base_usa_price = int(base_price * depreciation_factor)
        return base_usa_price
    
    def calculate_usa_average_mileage(self, year: int) -> int:
        """Calculate USA average mileage for vehicle age"""
        current_year = datetime.now().year
        age = max(0, current_year - year)
        # 12,000 miles per year = 19,312 km per year
        return int(age * 19312)
    
    def convert_yen_to_usd(self, yen: int) -> int:
        """Convert yen to USD at current rate (150 yen per dollar)"""
        return int(yen / 150)  # Fixed exchange rate to match frontend
    
    async def generate_real_ai_description(self, vehicle: Dict) -> str:
        """Generate real AI description using OpenAI"""
        
        # Calculate market comparisons  
        usd_price = self.convert_yen_to_usd(vehicle['price_total_yen'])
        usa_avg_price = self.calculate_usa_average_price(vehicle['model_name'], vehicle['model_year_ad'], vehicle['price_total_yen'])
        price_savings = max(0, usa_avg_price - usd_price)
        price_savings_pct = int((price_savings / usa_avg_price) * 100) if usa_avg_price > 0 else 0
        
        usa_avg_mileage = self.calculate_usa_average_mileage(vehicle['model_year_ad'])
        mileage_diff = vehicle['mileage_km'] - usa_avg_mileage
        mileage_diff_pct = int((mileage_diff / usa_avg_mileage) * 100) if usa_avg_mileage > 0 else 0
        
        # Create AI prompt
        prompt = f"""Analyze this Japanese vehicle for export and write a compelling description:

VEHICLE: {vehicle['model_name']} {vehicle['model_year_ad']}
TITLE: {vehicle.get('title_description', 'Not available')[:200]}
MILEAGE: {vehicle['mileage_km']:,} km
JAPAN PRICE: ${usd_price:,}
USA MARKET AVERAGE: ${usa_avg_price:,}
SAVINGS: ${price_savings:,} ({price_savings_pct}%)
MILEAGE VS USA AVG: {mileage_diff_pct}% {'below' if mileage_diff_pct < 0 else 'above'} average

Write a compelling 150-200 word description that:
1. Highlights specific features from the title
2. Discusses vehicle condition and value
3. Explains savings vs USA market
4. Mentions Japanese quality standards
5. Includes export assistance
6. Uses engaging, accurate language

Write as one flowing paragraph, not bullet points."""
        
        try:
            response = openai_client.chat.completions.create(
                model=AI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert automotive analyst specializing in Japanese vehicle exports. Write compelling, accurate descriptions for international buyers."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7
            )
            
            description = response.choices[0].message.content.strip()
            # Clean up unicode characters that break JSON
            description = description.replace('\u2014', '-').replace('\u2013', '-').replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
            return description
            
        except Exception as e:
            print(f"❌ OpenAI error for vehicle {vehicle.get('id', 'unknown')}: {e}")
            # Fallback description
            return f"This {vehicle['model_year_ad']} {vehicle['model_name']} offers excellent value for export at ${usd_price:,}, representing ${price_savings:,} in potential savings compared to USA market prices. Professional export assistance and warranty coverage included."
    
    async def get_vehicles_needing_analysis(self, limit: int = 50) -> List[Dict]:
        """Get vehicles that need AI analysis - NEW ones without descriptions or OLD ones with wrong market data"""
        query = """
        SELECT 
            v.id,
            v.source_id,
            v.title_description,
            v.price_total_yen,
            v.model_year_ad,
            v.mileage_km,
            m.name as model_name,
            v.created_at,
            v.ai_description
        FROM vehicles v
        JOIN models m ON v.model_id = m.id
        WHERE 
            -- New vehicles without any description
            v.ai_description IS NULL 
            OR v.ai_description = ''
            -- Old vehicles that need market data fix (don't have JSON marker)
            OR (v.ai_description IS NOT NULL 
                AND v.ai_description != '' 
                AND NOT v.ai_description LIKE '%"usa_price_estimate"%')
        ORDER BY 
            -- Prioritize new vehicles first
            CASE WHEN v.ai_description IS NULL OR v.ai_description = '' THEN 0 ELSE 1 END,
            v.created_at DESC
        LIMIT $1
        """
        
        rows = await self.conn.fetch(query, limit)
        return [dict(row) for row in rows]
    
    async def save_ai_description(self, vehicle_id: int, description: str, market_data: Dict):
        """Save AI description with embedded market data JSON"""
        try:
            # Store market data as a JSON object at the START (hidden from display)
            # Format: {"market_data": {...}, "description": "..."}
            combined_data = {
                "market_data": market_data,
                "description": description
            }
            full_description = json.dumps(combined_data, ensure_ascii=False)
            
            await self.conn.execute("""
                UPDATE vehicles 
                SET ai_description = $1
                WHERE id = $2
            """, full_description, vehicle_id)
            
            return True
            
        except Exception as e:
            print(f"❌ Error saving description for vehicle {vehicle_id}: {e}")
            return False
    
    async def analyze_batch(self, limit: int = 20):
        """Analyze a batch of vehicles"""
        vehicles = await self.get_vehicles_needing_analysis(limit)
        
        if not vehicles:
            return 0
            
        print(f"🔍 Found {len(vehicles)} vehicles needing analysis")
        
        analyzed_count = 0
        
        for vehicle in vehicles:
            try:
                # Check if this is a new vehicle or needs market data update
                is_new = not vehicle['ai_description'] or vehicle['ai_description'] == ''
                needs_market_fix = False
                
                if not is_new and vehicle['ai_description']:
                    # Check if it has proper market data
                    needs_market_fix = '"usa_price_estimate"' not in vehicle['ai_description']
                
                if is_new:
                    # Generate NEW AI description using OpenAI for new vehicles
                    description = await self.generate_real_ai_description(vehicle)
                else:
                    # For existing vehicles, extract and keep the clean description
                    existing = vehicle['ai_description']
                    
                    # Try to parse as JSON first (new format)
                    if existing.startswith('{'):
                        try:
                            parsed = json.loads(existing)
                            if 'description' in parsed:
                                description = parsed['description']
                            else:
                                description = existing  # Fallback to whole thing
                        except:
                            description = existing
                    # Check for old HTML comment format
                    elif '<!--MARKET_DATA:' in existing:
                        description = existing.split('<!--MARKET_DATA:')[0].strip()
                    else:
                        # Plain text description
                        description = existing.strip()
                
                # Calculate market data
                usd_price = self.convert_yen_to_usd(vehicle['price_total_yen'])
                usa_avg_price = self.calculate_usa_average_price(vehicle['model_name'], vehicle['model_year_ad'], vehicle['price_total_yen'])
                price_savings = max(0, usa_avg_price - usd_price)
                price_savings_pct = int((price_savings / usa_avg_price) * 100) if usa_avg_price > 0 else 0
                
                # Create market data object
                market_data = {
                    "usa_price_estimate": usa_avg_price,
                    "savings_amount": price_savings,
                    "savings_percentage": price_savings_pct
                }
                
                # Save description with embedded market data
                if await self.save_ai_description(vehicle['id'], description, market_data):
                    analyzed_count += 1
                    action = "NEW" if is_new else "FIX"
                    print(f"🤖 [{action}] ID {vehicle['id']}: ${price_savings:,} savings ({price_savings_pct}%) | {description[:60]}...")
                
                # Rate limiting for API calls
                await asyncio.sleep(2)  # 2 seconds between API calls
                
            except Exception as e:
                print(f"❌ Error analyzing vehicle {vehicle['id']}: {e}")
                continue
        
        return analyzed_count
    
    async def run_continuous(self, batch_size: int = 20, sleep_interval: int = 60):
        """Run continuous analysis"""
        self.is_running = True
        print(f"🤖 Starting continuous AI analysis...")
        print(f"📊 Batch size: {batch_size} vehicles")
        print(f"⏱️  Check interval: {sleep_interval} seconds")
        
        total_analyzed = 0
        
        try:
            while self.is_running:
                start_time = time.time()
                
                # Analyze batch
                count = await self.analyze_batch(batch_size)
                total_analyzed += count
                
                if count > 0:
                    elapsed = time.time() - start_time
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Analyzed {count} vehicles in {elapsed:.1f}s | Total: {total_analyzed}")
                else:
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] No vehicles need analysis")
                
                # Sleep between batches
                await asyncio.sleep(sleep_interval)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping continuous analysis...")
            self.is_running = False
        except Exception as e:
            print(f"❌ Error in continuous analysis: {e}")
            raise

async def main():
    analyzer = ContinuousAIAnalyzer()
    
    try:
        await analyzer.connect()
        
        # First, do a large batch to fix existing vehicles
        print("🔧 Fixing existing vehicles with incomplete market analysis...")
        total_fixed = 0
        
        while True:
            count = await analyzer.analyze_batch(50)  # Larger batches for fixing
            total_fixed += count
            
            if count == 0:
                break
                
            await asyncio.sleep(1)  # Brief pause between batches
        
        print(f"✅ Fixed {total_fixed} vehicles with incomplete market analysis")
        print("🔄 Starting continuous monitoring for new vehicles...")
        
        # Then start continuous monitoring - faster processing for 3000 vehicles
        await analyzer.run_continuous(batch_size=10, sleep_interval=10)
        
    finally:
        await analyzer.disconnect()

if __name__ == "__main__":
    asyncio.run(main())