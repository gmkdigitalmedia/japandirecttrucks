#!/usr/bin/env python3
"""
Simple Flask API server for vehicle data
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import asyncpg
import asyncio
import requests

app = Flask(__name__)
CORS(app)

DATABASE_URL = "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"

def get_db_connection():
    """Get database connection synchronously"""
    import psycopg2
    import psycopg2.extras
    return psycopg2.connect(
        "host=localhost dbname=gps_trucks_japan user=gp password=Megumi12",
        cursor_factory=psycopg2.extras.RealDictCursor
    )

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'success': True,
        'message': 'GPS Trucks API is healthy'
    })

@app.route('/api/vehicles/featured', methods=['GET'])
def featured_vehicles():
    """Get featured vehicles with images"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query for vehicles with primary images
        query = """
        SELECT 
          v.id, v.title_description, v.price_vehicle_yen, v.price_total_yen,
          v.model_year_ad, v.mileage_km, v.location_prefecture,
          m.name as manufacturer_name,
          md.name as model_name,
          vi.original_url as primary_image_url
        FROM vehicles v
        LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
        LEFT JOIN models md ON v.model_id = md.id
        LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
        WHERE v.is_available = TRUE AND v.is_featured = TRUE
        ORDER BY v.created_at DESC
        LIMIT 8
        """
        
        cur.execute(query)
        rows = cur.fetchall()
        
        vehicles = []
        for row in rows:
            vehicle = {
                'id': row['id'],
                'title_description': row['title_description'],
                'price_vehicle_yen': row['price_vehicle_yen'],
                'price_total_yen': row['price_total_yen'],
                'model_year_ad': row['model_year_ad'],
                'mileage_km': row['mileage_km'],
                'location_prefecture': row['location_prefecture'],
                'manufacturer': {'name': row['manufacturer_name']} if row['manufacturer_name'] else None,
                'model': {'name': row['model_name']} if row['model_name'] else None,
                'primary_image': f"/api/images/proxy?url={row['primary_image_url']}" if row['primary_image_url'] else None
            }
            vehicles.append(vehicle)
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': vehicles
        })
        
    except Exception as e:
        print(f"Error in featured_vehicles: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/vehicles/<int:vehicle_id>', methods=['GET'])
def get_vehicle_detail(vehicle_id):
    """Get vehicle by ID with all images"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get vehicle details
        vehicle_query = """
        SELECT 
          v.*,
          m.name as manufacturer_name,
          md.name as model_name
        FROM vehicles v
        LEFT JOIN manufacturers m ON v.manufacturer_id = m.id
        LEFT JOIN models md ON v.model_id = md.id
        WHERE v.id = %s
        """
        
        cur.execute(vehicle_query, (vehicle_id,))
        vehicle_row = cur.fetchone()
        
        if not vehicle_row:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Vehicle not found'
            }), 404
        
        # Get all images for this vehicle
        images_query = """
        SELECT original_url, is_primary, image_order, alt_text
        FROM vehicle_images 
        WHERE vehicle_id = %s 
        ORDER BY is_primary DESC, image_order ASC
        """
        cur.execute(images_query, (vehicle_id,))
        image_rows = cur.fetchall()
        
        conn.close()
        
        # Build vehicle object
        vehicle = dict(vehicle_row)
        vehicle['manufacturer'] = {'name': vehicle['manufacturer_name']} if vehicle['manufacturer_name'] else None
        vehicle['model'] = {'name': vehicle['model_name']} if vehicle['model_name'] else None
        
        # Add images with proxy URLs
        images = []
        for img in image_rows:
            if img['original_url']:
                images.append({
                    'url': f"/api/images/proxy?url={img['original_url']}",
                    'is_primary': img['is_primary'],
                    'image_order': img['image_order'],
                    'alt_text': img['alt_text']
                })
        
        vehicle['images'] = images
        
        return jsonify({
            'success': True,
            'data': vehicle
        })
        
    except Exception as e:
        print(f"Error in get_vehicle_detail: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/images/proxy', methods=['GET'])
def image_proxy():
    """Proxy images from CarSensor"""
    from urllib.parse import unquote
    from flask import Response
    
    image_url = request.args.get('url')
    if not image_url:
        return jsonify({'error': 'URL required'}), 400
    
    image_url = unquote(image_url)
    
    if 'carsensor.net' not in image_url:
        return jsonify({'error': 'Invalid source'}), 400
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.carsensor.net/',
            'Accept': 'image/*'
        }
        
        response = requests.get(image_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return Response(
                response.content,
                content_type=response.headers.get('content-type', 'image/jpeg'),
                headers={
                    'Cache-Control': 'public, max-age=86400',
                    'Access-Control-Allow-Origin': '*'
                }
            )
        else:
            return jsonify({'error': 'Image not found'}), 404
                    
    except Exception as e:
        print(f"Error in image_proxy: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting GPS Trucks Flask API on port 8000...")
    app.run(host='localhost', port=8000, debug=False)