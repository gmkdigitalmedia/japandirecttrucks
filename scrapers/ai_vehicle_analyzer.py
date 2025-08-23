#!/usr/bin/env python3
"""
AI Vehicle Analyzer - Generates competitive advantage analysis for vehicles
This script analyzes each vehicle and generates AI-powered value propositions
comparing against USA market prices and mileage averages.
"""

import asyncio
import asyncpg
import json
from datetime import datetime
from typing import Dict, List, Optional
import argparse

# Database configuration
DATABASE_URL = "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"

class VehicleAnalyzer:
    def __init__(self):
        self.conn = None
        
    async def connect(self):
        """Connect to database"""
        self.conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected to database")
        
    async def disconnect(self):
        """Disconnect from database"""
        if self.conn:
            await self.conn.close()
            print("✅ Disconnected from database")
    
    def calculate_usa_average_price(self, model_name: str, year: int) -> int:
        """Calculate estimated USA market price for comparison"""
        base_prices = {
            'Land Cruiser 200': 85000,
            'Land Cruiser 300': 95000, 
            'Land Cruiser 70': 75000,
            'Prado': 65000,
            'Hijet': 25000,
            'Hilux': 45000,
        }
        
        # Find matching model
        base_price = 50000  # Default
        for model, price in base_prices.items():
            if model.lower() in model_name.lower():
                base_price = price
                break
                
        # Apply depreciation (10% per year, minimum 30% of original value)
        current_year = datetime.now().year
        age = current_year - year
        depreciation_factor = max(0.3, 1 - (age * 0.1))
        
        return int(base_price * depreciation_factor)
    
    def calculate_usa_average_mileage(self, year: int) -> int:
        """Calculate USA average mileage for vehicle age"""
        current_year = datetime.now().year
        age = current_year - year
        # 12,000 miles per year = 19,312 km per year
        return int(age * 19312)
    
    def convert_yen_to_usd(self, yen: int) -> int:
        """Convert yen to USD at 150 yen per dollar"""
        return int(yen / 150)
    
    def generate_analysis_prompt(self, vehicle: Dict) -> str:
        """Generate prompt for AI analysis of vehicle value proposition"""
        
        # Calculate comparisons
        usd_price = self.convert_yen_to_usd(vehicle['price_total_yen'])
        usa_avg_price = self.calculate_usa_average_price(vehicle['model_name'], vehicle['model_year_ad'])
        usa_avg_mileage = self.calculate_usa_average_mileage(vehicle['model_year_ad'])
        
        price_savings = usa_avg_price - usd_price
        price_savings_pct = int((price_savings / usa_avg_price) * 100) if usa_avg_price > 0 else 0
        
        mileage_diff = vehicle['mileage_km'] - usa_avg_mileage
        mileage_diff_pct = int((mileage_diff / usa_avg_mileage) * 100) if usa_avg_mileage > 0 else 0
        
        vehicle_miles = int(vehicle['mileage_km'] * 0.621371)
        usa_avg_miles = int(usa_avg_mileage * 0.621371)
        
        prompt = f"""Analyze this Japanese vehicle export opportunity and create a compelling value proposition:

VEHICLE DETAILS:
- Model: {vehicle['title_description'][:100]}
- Year: {vehicle['model_year_ad']}
- Mileage: {vehicle['mileage_km']:,} km ({vehicle_miles:,} miles)
- Japan Price: ${usd_price:,}

USA MARKET COMPARISON:
- Estimated USA Price: ${usa_avg_price:,}
- Your Savings: ${price_savings:,} ({price_savings_pct}%)
- USA Average Mileage: {usa_avg_mileage:,} km ({usa_avg_miles:,} miles)
- Mileage Difference: {mileage_diff:,} km ({mileage_diff_pct}% {'below' if mileage_diff < 0 else 'above'} average)

Generate a JSON response with:
1. "value_headline" - Catchy 5-8 word headline emphasizing savings/value
2. "mileage_advantage" - 3-4 word description of mileage condition
3. "key_benefits" - Array of 3 specific benefits (each 8-12 words)
4. "market_comparison" - 1 sentence comparing to USA market
5. "confidence_score" - 1-10 rating of this deal quality

Focus on Japanese vehicle quality, maintenance standards, and specific savings."""

        return prompt
    
    async def get_vehicles_needing_analysis(self, limit: int = 50) -> List[Dict]:
        """Get vehicles that need AI analysis"""
        query = """
        SELECT 
            v.id,
            v.source_id,
            v.title_description,
            v.price_total_yen,
            v.model_year_ad,
            v.mileage_km,
            m.name as model_name,
            v.created_at
        FROM vehicles v
        JOIN models m ON v.model_id = m.id
        WHERE v.ai_analysis IS NULL
        ORDER BY v.created_at DESC
        LIMIT $1
        """
        
        rows = await self.conn.fetch(query, limit)
        return [dict(row) for row in rows]
    
    async def save_ai_analysis(self, vehicle_id: int, analysis: Dict):
        """Save AI analysis to vehicle record"""
        try:
            # First check if ai_analysis column exists
            column_exists = await self.conn.fetchval("""
                SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = 'vehicles' AND column_name = 'ai_analysis'
            """)
            
            if column_exists == 0:
                # Add the column if it doesn't exist
                await self.conn.execute("""
                    ALTER TABLE vehicles 
                    ADD COLUMN ai_analysis JSONB,
                    ADD COLUMN ai_analyzed_at TIMESTAMP
                """)
                print("✅ Added ai_analysis columns to vehicles table")
            
            # Update the vehicle with analysis
            await self.conn.execute("""
                UPDATE vehicles 
                SET ai_analysis = $1, ai_analyzed_at = NOW()
                WHERE id = $2
            """, json.dumps(analysis), vehicle_id)
            
            print(f"✅ Saved AI analysis for vehicle {vehicle_id}")
            
        except Exception as e:
            print(f"❌ Error saving analysis for vehicle {vehicle_id}: {e}")
    
    def generate_mock_analysis(self, vehicle: Dict) -> Dict:
        """Generate mock AI analysis until Claude API is integrated"""
        
        usd_price = self.convert_yen_to_usd(vehicle['price_total_yen'])
        usa_avg_price = self.calculate_usa_average_price(vehicle['model_name'], vehicle['model_year_ad'])
        price_savings = usa_avg_price - usd_price
        price_savings_pct = int((price_savings / usa_avg_price) * 100) if usa_avg_price > 0 else 0
        
        usa_avg_mileage = self.calculate_usa_average_mileage(vehicle['model_year_ad'])
        mileage_diff_pct = int(((vehicle['mileage_km'] - usa_avg_mileage) / usa_avg_mileage) * 100) if usa_avg_mileage > 0 else 0
        
        # Generate appropriate headlines based on savings
        if price_savings_pct > 40:
            value_headline = "EXCEPTIONAL DEAL - Major Savings"
            confidence_score = 9
        elif price_savings_pct > 25:
            value_headline = "EXCELLENT VALUE - Significant Savings"  
            confidence_score = 8
        elif price_savings_pct > 10:
            value_headline = "GOOD DEAL - Solid Savings"
            confidence_score = 7
        else:
            value_headline = "FAIR PRICE - Some Savings"
            confidence_score = 6
            
        # Mileage advantage
        if mileage_diff_pct < -30:
            mileage_advantage = "VERY LOW MILEAGE"
        elif mileage_diff_pct < -10:
            mileage_advantage = "BELOW AVERAGE MILEAGE"
        elif mileage_diff_pct < 20:
            mileage_advantage = "REASONABLE MILEAGE"
        else:
            mileage_advantage = "HIGH MILEAGE"
        
        analysis = {
            "value_headline": value_headline,
            "mileage_advantage": mileage_advantage,
            "key_benefits": [
                "Superior Japanese maintenance and service records",
                f"Save ${price_savings:,} compared to USA market prices",
                "Road-tested vehicle with warranty coverage included"
            ],
            "market_comparison": f"This vehicle offers {price_savings_pct}% savings over comparable USA market vehicles with {abs(mileage_diff_pct)}% {'lower' if mileage_diff_pct < 0 else 'higher'} mileage.",
            "confidence_score": confidence_score,
            "analysis_date": datetime.now().isoformat(),
            "usa_price_estimate": usa_avg_price,
            "savings_amount": price_savings,
            "savings_percentage": price_savings_pct
        }
        
        return analysis
    
    async def analyze_vehicles(self, limit: int = 50, mock_mode: bool = True):
        """Main analysis function"""
        print(f"🤖 Starting AI analysis for up to {limit} vehicles...")
        print(f"Mode: {'Mock Analysis' if mock_mode else 'Claude API'}")
        
        vehicles = await self.get_vehicles_needing_analysis(limit)
        print(f"📊 Found {len(vehicles)} vehicles needing analysis")
        
        if not vehicles:
            print("✅ All vehicles already have AI analysis!")
            return
        
        analyzed_count = 0
        
        for vehicle in vehicles:
            try:
                print(f"\n🔍 Analyzing: {vehicle['title_description'][:60]}...")
                print(f"   Year: {vehicle['model_year_ad']} | Price: ¥{vehicle['price_total_yen']:,} | Mileage: {vehicle['mileage_km']:,}km")
                
                if mock_mode:
                    # Generate mock analysis
                    analysis = self.generate_mock_analysis(vehicle)
                    print(f"   💡 {analysis['value_headline']}")
                    print(f"   📏 {analysis['mileage_advantage']}")
                    print(f"   🎯 Confidence: {analysis['confidence_score']}/10")
                else:
                    # TODO: Integrate with Claude API
                    prompt = self.generate_analysis_prompt(vehicle)
                    print(f"   📝 Generated prompt for Claude API")
                    print(f"   🔄 [Would call Claude API here]")
                    continue
                
                # Save analysis to database
                await self.save_ai_analysis(vehicle['id'], analysis)
                analyzed_count += 1
                
                # Rate limiting
                await asyncio.sleep(0.1)
                
            except Exception as e:
                print(f"❌ Error analyzing vehicle {vehicle['id']}: {e}")
                continue
        
        print(f"\n🎉 Analysis complete!")
        print(f"✅ Successfully analyzed {analyzed_count} vehicles")
        print(f"📊 AI analysis data saved to database")

async def main():
    parser = argparse.ArgumentParser(description='AI Vehicle Analyzer')
    parser.add_argument('--limit', type=int, default=50, help='Number of vehicles to analyze')
    parser.add_argument('--claude-api', action='store_true', help='Use Claude API (not implemented yet)')
    args = parser.parse_args()
    
    analyzer = VehicleAnalyzer()
    
    try:
        await analyzer.connect()
        await analyzer.analyze_vehicles(
            limit=args.limit,
            mock_mode=not args.claude_api
        )
    finally:
        await analyzer.disconnect()

if __name__ == "__main__":
    asyncio.run(main())