#!/usr/bin/env python3
"""
Real AI Vehicle Analyzer - REMOTE VERSION for Google Cloud VM
Generates genuine AI descriptions and market analysis for each vehicle
Monitors remote database for new vehicles and automatically processes them
"""

import asyncio
import asyncpg
import json
import time
from openai import OpenAI
from datetime import datetime
from typing import Dict, List, Optional

# Configuration - REMOTE DATABASE ON GOOGLE CLOUD VM
DATABASE_URL = "postgresql://gp:Megumi12@34.29.174.102:5432/gps_trucks_japan"
OPENAI_API_KEY = "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"

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

class RealAIAnalyzer:
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
    
    def calculate_usa_market_price(self, model_name: str, year: int) -> int:
        """Calculate realistic USA market price"""
        base_prices = {
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
            'Pajero': 45000,
            'Megacruiser': 180000,
            'Delica Star Wagon': 28000,
            'HiJet': 38000,
            'Triton': 45000,
            'HR-V': 32000,
            'Elysium': 38000,
            'Cayenne': 85000,
            'STI': 50000,
            'Sambar Open Deck': 25000,
            'Exiga': 22000,
        }
        
        # Find base price
        base_price = 55000
        if model_name in base_prices:
            base_price = base_prices[model_name]
        else:
            model_lower = model_name.lower()
            for model, price in base_prices.items():
                if model.lower() in model_lower or model_lower in model.lower():
                    base_price = price
                    break
        
        # Apply depreciation
        current_year = datetime.now().year
        age = max(0, current_year - year)
        
        if age <= 3:
            depreciation_factor = max(0.75, 1 - (age * 0.05))
        elif age <= 10:
            depreciation_factor = max(0.40, 0.85 - ((age - 3) * 0.06))
        else:
            depreciation_factor = max(0.30, 0.43 - ((age - 10) * 0.02))
        
        return int(base_price * depreciation_factor)
    
    def convert_yen_to_usd(self, yen: int) -> int:
        """Convert yen to USD"""
        return int(yen / 145)
    
    async def get_vehicle_details(self, vehicle_id: int) -> Optional[Dict]:
        """Get full vehicle details for AI analysis"""
        query = """
        SELECT 
            v.id,
            v.source_id,
            v.title_description,
            v.price_total_yen,
            v.price_vehicle_yen,
            v.price_misc_expenses_yen,
            v.model_year_ad,
            v.mileage_km,
            v.color,
            v.fuel_type,
            v.transmission_details,
            v.drive_type,
            v.engine_displacement_cc,
            v.grade,
            v.equipment_details,
            v.maintenance_details,
            v.warranty_details,
            v.is_accident_free,
            v.is_one_owner,
            v.has_repair_history,
            v.shaken_status,
            v.dealer_name,
            v.location_prefecture,
            m.name as model_name,
            mf.name as manufacturer_name
        FROM vehicles v
        JOIN models m ON v.model_id = m.id
        JOIN manufacturers mf ON v.manufacturer_id = mf.id
        WHERE v.id = $1
        """
        
        result = await self.conn.fetchrow(query, vehicle_id)
        return dict(result) if result else None
    
    def create_ai_prompt(self, vehicle: Dict) -> str:
        """Create detailed prompt for AI analysis"""
        
        # Calculate market data
        usd_price = self.convert_yen_to_usd(vehicle['price_total_yen'])
        usa_market_price = self.calculate_usa_market_price(vehicle['model_name'], vehicle['model_year_ad'])
        savings = max(0, usa_market_price - usd_price)
        savings_pct = int((savings / usa_market_price) * 100) if usa_market_price > 0 else 0
        
        prompt = f"""Analyze this Japanese vehicle for export and write a compelling, accurate description for potential buyers:

VEHICLE DETAILS:
- Make/Model: {vehicle['manufacturer_name']} {vehicle['model_name']}
- Year: {vehicle['model_year_ad']}
- Title: {vehicle['title_description']}
- Mileage: {vehicle['mileage_km']:,} km
- Color: {vehicle.get('color', 'Not specified')}
- Fuel: {vehicle.get('fuel_type', 'Not specified')}
- Transmission: {vehicle.get('transmission_details', 'Not specified')}
- Drive: {vehicle.get('drive_type', 'Not specified')}
- Engine: {vehicle.get('engine_displacement_cc', 'Not specified')}cc
- Grade/Trim: {vehicle.get('grade', 'Not specified')}
- Equipment: {vehicle.get('equipment_details', 'Not specified')}
- Accident Free: {vehicle.get('is_accident_free', 'Unknown')}
- One Owner: {vehicle.get('is_one_owner', 'Unknown')}
- Dealer: {vehicle.get('dealer_name', 'Not specified')}
- Location: {vehicle.get('location_prefecture', 'Not specified')}

PRICING ANALYSIS:
- Japan Price: ${usd_price:,}
- USA Market Average: ${usa_market_price:,}
- Potential Savings: ${savings:,} ({savings_pct}%)

Write a compelling 150-250 word description that:
1. Highlights specific features mentioned in the title/equipment
2. Discusses the vehicle's condition and history based on available data
3. Explains the value proposition vs USA market
4. Mentions Japanese quality/maintenance standards
5. Includes export/shipping assistance
6. Uses engaging, sales-oriented language
7. Is factually accurate based on the provided information

Write in paragraph form, not bullet points. Focus on what makes THIS specific vehicle special."""

        return prompt
    
    async def get_ai_description(self, vehicle: Dict) -> str:
        """Get AI-generated description from OpenAI"""
        try:
            prompt = self.create_ai_prompt(vehicle)
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert automotive analyst specializing in Japanese vehicle exports. Write compelling, accurate vehicle descriptions for international buyers."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            description = response.choices[0].message.content.strip()
            return description
            
        except Exception as e:
            print(f"❌ OpenAI API error: {e}")
            # Fallback to basic description
            return f"This {vehicle['model_year_ad']} {vehicle['manufacturer_name']} {vehicle['model_name']} offers excellent value for export. Contact us for detailed specifications and shipping assistance."
    
    async def get_vehicles_needing_analysis(self, limit: int = 10) -> List[Dict]:
        """Get vehicles that need AI analysis"""
        query = """
        SELECT id
        FROM vehicles 
        WHERE ai_description IS NULL 
        OR ai_description = ''
        OR (ai_description ~ '^[\\s\\n]*\\{.*\\}[\\s\\n]*$')
        ORDER BY created_at DESC
        LIMIT $1
        """
        
        rows = await self.conn.fetch(query, limit)
        return [row['id'] for row in rows]
    
    async def save_ai_description(self, vehicle_id: int, description: str):
        """Save AI description to database"""
        try:
            await self.conn.execute("""
                UPDATE vehicles 
                SET ai_description = $1
                WHERE id = $2
            """, description, vehicle_id)
            return True
        except Exception as e:
            print(f"❌ Error saving description for vehicle {vehicle_id}: {e}")
            return False
    
    async def process_vehicle(self, vehicle_id: int) -> bool:
        """Process a single vehicle with real AI analysis"""
        try:
            # Get vehicle details
            vehicle = await self.get_vehicle_details(vehicle_id)
            if not vehicle:
                print(f"❌ Vehicle {vehicle_id} not found")
                return False
            
            print(f"🤖 Analyzing: {vehicle['manufacturer_name']} {vehicle['model_name']} ({vehicle['model_year_ad']})")
            
            # Get AI description
            description = await self.get_ai_description(vehicle)
            
            # Save to database
            if await self.save_ai_description(vehicle_id, description):
                # Calculate savings for display
                usd_price = self.convert_yen_to_usd(vehicle['price_total_yen'])
                usa_price = self.calculate_usa_market_price(vehicle['model_name'], vehicle['model_year_ad'])
                savings = max(0, usa_price - usd_price)
                savings_pct = int((savings / usa_price) * 100) if usa_price > 0 else 0
                
                print(f"✅ ID {vehicle_id}: ${savings:,} savings ({savings_pct}%) | {description[:60]}...")
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ Error processing vehicle {vehicle_id}: {e}")
            return False
    
    async def run_continuous(self, batch_size: int = 5, sleep_interval: int = 30):
        """Run continuous AI analysis"""
        self.is_running = True
        print(f"🤖 Starting Real AI Analysis with OpenAI GPT-4")
        print(f"📊 Batch size: {batch_size} vehicles")
        print(f"⏱️  Check interval: {sleep_interval} seconds")
        
        total_processed = 0
        
        try:
            while self.is_running:
                start_time = time.time()
                
                # Get vehicles needing analysis
                vehicle_ids = await self.get_vehicles_needing_analysis(batch_size)
                
                if vehicle_ids:
                    print(f"🔍 Found {len(vehicle_ids)} vehicles needing analysis")
                    
                    processed = 0
                    for vehicle_id in vehicle_ids:
                        if await self.process_vehicle(vehicle_id):
                            processed += 1
                            total_processed += 1
                        
                        # Rate limiting for API
                        await asyncio.sleep(2)  # 2 seconds between API calls
                    
                    elapsed = time.time() - start_time
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Processed {processed}/{len(vehicle_ids)} vehicles in {elapsed:.1f}s | Total: {total_processed}")
                else:
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] No vehicles need analysis")
                
                # Sleep between batches
                await asyncio.sleep(sleep_interval)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping AI analysis...")
            self.is_running = False
        except Exception as e:
            print(f"❌ Error in continuous analysis: {e}")
            raise

async def main():
    analyzer = RealAIAnalyzer()
    
    try:
        await analyzer.connect()
        await analyzer.run_continuous(batch_size=5, sleep_interval=60)
    finally:
        await analyzer.disconnect()

if __name__ == "__main__":
    asyncio.run(main())