#!/usr/bin/env python3

import asyncio
import os
import sys
import json
from dotenv import load_dotenv
import asyncpg
import openai

# Load environment variables
load_dotenv()

# Configure OpenAI
openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

async def test_single_vehicle():
    """Test AI description generation on just one vehicle"""
    
    try:
        # Connect to database
        conn = await asyncpg.connect(os.getenv('DATABASE_URL'))
        
        # Get one vehicle that needs analysis
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
        WHERE v.ai_description IS NULL 
        OR v.ai_description = ''
        OR NOT (v.ai_description ~ '^[\\s\\n]*\\{.*\\}[\\s\\n]*$')
        ORDER BY v.created_at DESC
        LIMIT 1
        """
        
        result = await conn.fetchrow(query)
        
        if not result:
            print("❌ No vehicles found that need AI analysis")
            return
            
        vehicle = dict(result)
        
        print(f"🚗 Testing vehicle: {vehicle['model_name']} {vehicle['model_year_ad']}")
        print(f"📋 ID: {vehicle['id']}")
        print(f"💴 Price: ¥{vehicle['price_total_yen']:,}")
        print(f"🛣️  Mileage: {vehicle['mileage_km']:,} km")
        print(f"📝 Title: {vehicle.get('title_description', 'No title')[:100]}...")
        print(f"🔍 Current AI Description: {vehicle.get('ai_description', 'None')}")
        print("\n" + "="*80 + "\n")
        
        # Calculate market data (same logic as main script)
        usd_price = int(vehicle['price_total_yen'] / 145)
        
        # Rough USA price estimate (you'd want more sophisticated logic)
        model_name = vehicle['model_name'].lower()
        year = vehicle['model_year_ad']
        
        if 'landcruiser' in model_name or 'land cruiser' in model_name:
            base_price = 85000 if year >= 2020 else 70000 if year >= 2015 else 55000
        elif 'prado' in model_name:
            base_price = 55000 if year >= 2020 else 45000 if year >= 2015 else 35000
        else:
            base_price = 40000 if year >= 2020 else 30000 if year >= 2015 else 20000
            
        usa_avg_price = max(base_price - (2024 - year) * 2000, 15000)
        price_savings = max(0, usa_avg_price - usd_price)
        price_savings_pct = int((price_savings / usa_avg_price) * 100) if usa_avg_price > 0 else 0
        
        usa_avg_mileage = max(12000 * (2024 - year), 50000)
        mileage_diff = vehicle['mileage_km'] - usa_avg_mileage
        mileage_diff_pct = int((mileage_diff / usa_avg_mileage) * 100) if usa_avg_mileage > 0 else 0
        
        print(f"💰 Market Analysis:")
        print(f"   USD Price: ${usd_price:,}")
        print(f"   USA Average: ${usa_avg_price:,}")
        print(f"   Savings: ${price_savings:,} ({price_savings_pct}%)")
        print(f"   Mileage vs USA avg: {mileage_diff_pct}% {'below' if mileage_diff_pct < 0 else 'above'}")
        print("\n" + "="*80 + "\n")
        
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

        print("🤖 Sending to OpenAI...")
        print(f"📤 Prompt length: {len(prompt)} characters")
        
        # Call OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert automotive analyst specializing in Japanese vehicle exports. Write compelling, accurate descriptions for international buyers."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        ai_description = response.choices[0].message.content.strip()
        
        print("✅ AI Description Generated:")
        print("="*80)
        print(ai_description)
        print("="*80)
        print(f"\n📊 Description length: {len(ai_description)} characters")
        
        # Ask if user wants to save it
        save = input("\n💾 Save this description to database? (y/n): ").lower().strip()
        
        if save == 'y':
            # Create JSON structure like the main script
            description_json = {
                "description": ai_description,
                "usa_price_estimate": usa_avg_price,
                "savings_amount": price_savings,
                "savings_percentage": price_savings_pct,
                "generated_at": "2024-01-01T00:00:00Z"
            }
            
            update_query = """
            UPDATE vehicles 
            SET ai_description = $1
            WHERE id = $2
            """
            
            await conn.execute(update_query, json.dumps(description_json), vehicle['id'])
            print("✅ Saved to database!")
        else:
            print("❌ Not saved")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        if 'conn' in locals():
            await conn.close()

if __name__ == "__main__":
    asyncio.run(test_single_vehicle())