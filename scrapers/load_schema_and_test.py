#!/usr/bin/env python3
"""
Load schema and test WSL PostgreSQL connection
"""

import asyncio
import asyncpg

async def load_schema():
    """Load the database schema"""
    print("🔧 Loading database schema...")
    
    try:
        # Read schema file
        schema_path = "/mnt/c/Users/ibm/Documents/GPSTrucksJapan/database/schema.sql"
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Connect and create schema
        conn = await asyncpg.connect(
            "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"
        )
        
        await conn.execute(schema_sql)
        await conn.close()
        
        print("✅ Schema loaded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Schema loading failed: {e}")
        return False

async def test_connection():
    """Test the database connection"""
    print("🔍 Testing database connection...")
    
    try:
        conn = await asyncpg.connect(
            "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"
        )
        
        # Test queries
        version = await conn.fetchrow("SELECT version()")
        db_name = await conn.fetchrow("SELECT current_database()")
        table_count = await conn.fetchrow("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
        
        # Test a specific table
        vehicles_table = await conn.fetchrow("SELECT COUNT(*) FROM vehicles")
        
        await conn.close()
        
        print(f"✅ DATABASE CONNECTION WORKING!")
        print(f"   Database: {db_name['current_database']}")
        print(f"   Version: {version['version'][:50]}...")
        print(f"   Tables: {table_count['count']} tables")
        print(f"   Vehicles table: {vehicles_table['count']} vehicles")
        
        # Update .env file
        with open('.env', 'w') as f:
            f.write("DATABASE_URL=postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan\n")
            f.write("SCRAPER_DEBUG=true\n")
            f.write("SCRAPER_HEADLESS=true\n")
        
        print("📝 Updated .env file")
        return True
        
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

async def main():
    print("🚛 Loading Schema and Testing Connection")
    print("=" * 45)
    
    # Load schema
    if not await load_schema():
        return
    
    # Test connection
    if await test_connection():
        print(f"\n🎉 DATABASE IS READY FOR SCRAPING!")
        print(f"Now run: python3 test_scraper.py")
    else:
        print(f"\n❌ Setup failed")

if __name__ == "__main__":
    asyncio.run(main())