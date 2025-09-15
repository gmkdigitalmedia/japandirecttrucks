#!/usr/bin/env python3
"""
Check scraped data in REMOTE database on Google Cloud VM
"""

import asyncio
import asyncpg

async def check_database():
    """Check what data we have in remote database"""

    conn = await asyncpg.connect("postgresql://gp:Megumi12@34.29.174.102:5432/gps_trucks_japan")
    
    try:
        # Count vehicles
        vehicle_count = await conn.fetchval("SELECT COUNT(*) FROM vehicles")
        print(f"🚗 Total vehicles in database: {vehicle_count}")
        
        # Count images
        image_count = await conn.fetchval("SELECT COUNT(*) FROM vehicle_images")
        print(f"📸 Total images in database: {image_count}")
        
        # Sample vehicles
        vehicles = await conn.fetch("""
            SELECT v.id, v.title_description, v.price_vehicle_yen, 
                   m.name as manufacturer, mo.name as model,
                   (SELECT COUNT(*) FROM vehicle_images WHERE vehicle_id = v.id) as image_count
            FROM vehicles v
            LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
            LEFT JOIN models mo ON v.model_id = mo.id
            ORDER BY v.created_at DESC
            LIMIT 5
        """)
        
        print(f"\n📊 Recent vehicles:")
        for i, v in enumerate(vehicles, 1):
            print(f"   {i}. {v['manufacturer']} {v['model']}")
            print(f"      Title: {v['title_description'][:60]}...")
            print(f"      Price: ¥{v['price_vehicle_yen']:,}")
            print(f"      Images: {v['image_count']}")
            print()
        
        # Check manufacturers
        manufacturers = await conn.fetch("SELECT name, COUNT(*) as count FROM manufacturers m JOIN vehicles v ON m.id = v.manufacturer_id GROUP BY name")
        print(f"🏭 Manufacturers:")
        for m in manufacturers:
            print(f"   {m['name']}: {m['count']} vehicles")
        
        print(f"\n🌐 To view in web browser, go to:")
        print(f"   Frontend: http://localhost:3000")
        print(f"   Admin: http://localhost:3001")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_database())