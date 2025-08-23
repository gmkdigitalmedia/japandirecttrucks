#!/usr/bin/env python3
"""
Automated script to scrape all Toyota Land Cruiser 70 vehicles from CarSensor
Runs completely automatically and saves to database with full image galleries
"""

import subprocess
import time
import asyncio
import asyncpg
from datetime import datetime

async def check_progress():
    """Check current scraping progress"""
    try:
        conn = await asyncpg.connect('postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan')
        
        total_vehicles = await conn.fetchval('SELECT COUNT(*) FROM vehicles')
        vehicles_with_images = await conn.fetchval('SELECT COUNT(DISTINCT vehicle_id) FROM vehicle_images')
        total_images = await conn.fetchval('SELECT COUNT(*) FROM vehicle_images')
        
        print(f"\n📊 Current Progress at {datetime.now().strftime('%H:%M:%S')}:")
        print(f"  Total vehicles: {total_vehicles}")
        print(f"  Vehicles with images: {vehicles_with_images}")
        print(f"  Total images: {total_images}")
        
        if vehicles_with_images > 0:
            avg_images = total_images // vehicles_with_images
            print(f"  Average images per vehicle: {avg_images}")
        
        await conn.close()
        return total_vehicles
        
    except Exception as e:
        print(f"Error checking progress: {e}")
        return 0

def main():
    print("=" * 60)
    print("🚗 TOYOTA LAND CRUISER 70 FULL SCRAPER")
    print("=" * 60)
    print("This script will automatically collect all ~88 vehicles")
    print("Each vehicle will have 20-50+ gallery images")
    print("All Japanese text will be translated to English")
    print("=" * 60)
    
    # Check initial status
    initial_count = asyncio.run(check_progress())
    
    print(f"\n🚀 Starting scraper...")
    print("This will take approximately 2-3 hours to complete")
    print("The scraper will:")
    print("  ✓ Navigate through all 3 pages automatically")
    print("  ✓ Collect full image galleries for each vehicle")
    print("  ✓ Translate Japanese text to English")
    print("  ✓ Save immediately to database")
    print("  ✓ Continue from where it left off if interrupted")
    
    # Start the scraper
    print("\n📍 Starting scraper process...")
    process = subprocess.Popen(
        ['python3', 'test_scraper.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
        bufsize=1
    )
    
    # Monitor progress
    print("\n📈 Monitoring progress (updates every 2 minutes)...")
    last_count = initial_count
    no_progress_count = 0
    
    try:
        while True:
            # Wait 2 minutes between checks
            time.sleep(120)
            
            # Check if process is still running
            if process.poll() is not None:
                print("\n⚠️  Scraper process ended")
                stdout, stderr = process.communicate()
                if stderr:
                    print(f"Errors: {stderr[-500:]}")  # Last 500 chars of errors
                break
            
            # Check progress
            current_count = asyncio.run(check_progress())
            
            if current_count > last_count:
                print(f"\n✅ Progress: Added {current_count - last_count} new vehicles")
                last_count = current_count
                no_progress_count = 0
            else:
                no_progress_count += 1
                if no_progress_count > 5:  # No progress for 10 minutes
                    print("\n⚠️  No progress for 10 minutes, checking scraper status...")
            
            # Check if we've reached the target
            if current_count >= 88:
                print("\n🎉 SUCCESS! All vehicles collected!")
                process.terminate()
                break
                
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        process.terminate()
        
    # Final status
    print("\n" + "=" * 60)
    final_count = asyncio.run(check_progress())
    print(f"\n📊 Final Results:")
    print(f"  Started with: {initial_count} vehicles")
    print(f"  Ended with: {final_count} vehicles")
    print(f"  Added: {final_count - initial_count} vehicles")
    
    if final_count >= 88:
        print("\n✅ All Toyota Land Cruiser 70 vehicles successfully collected!")
    else:
        print(f"\n⚠️  Collection incomplete. {88 - final_count} vehicles remaining.")
        print("Run this script again to continue from where it left off.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()