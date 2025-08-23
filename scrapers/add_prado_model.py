#!/usr/bin/env python3
import asyncio
import asyncpg

async def add_prado_model():
    try:
        conn = await asyncpg.connect('postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan')
        
        # Check if Prado model already exists
        existing = await conn.fetchrow('SELECT id FROM models WHERE name = $1', 'Prado')
        
        if existing:
            print(f'Prado model already exists with ID: {existing["id"]}')
            model_id = existing["id"]
        else:
            # Insert Prado model (manufacturer_id = 1 for Toyota)
            model_id = await conn.fetchval('''
                INSERT INTO models (manufacturer_id, name, created_at, updated_at)
                VALUES (1, 'Prado', NOW(), NOW())
                RETURNING id
            ''')
            print(f'Created Prado model with ID: {model_id}')
        
        # Update the scraper file with the correct model_id
        print(f'Update scraper_toyota_prado.py to use model_id = {model_id}')
        
        await conn.close()
        
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    asyncio.run(add_prado_model())