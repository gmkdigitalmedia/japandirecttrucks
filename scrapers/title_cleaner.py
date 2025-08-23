#!/usr/bin/env python3
"""
Title Cleaner Module for GPS Trucks Japan

This module provides functions to clean and standardize vehicle titles
scraped from Japanese car websites. It handles common naming issues
and inconsistencies to ensure uniform data quality.

Usage:
    from title_cleaner import clean_title
    
    # Clean a single title
    cleaned = clean_title("Toyota Land CruiserPrado 2.7 TX")
    # Output: "Toyota Land Cruiser Prado 2.7 TX"
"""

import re
import requests
import time
import urllib.parse

def translate_japanese_text(text):
    """
    Translate Japanese text to English using Google Translate API.
    """
    if not text or not isinstance(text, str):
        return text
    
    # Check if text contains Japanese characters
    if not re.search(r'[ぁ-んァ-ヶー一-龯]', text):
        return text
    
    try:
        # Google Translate API endpoint (free)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q={urllib.parse.quote(text)}"
        
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data and data[0] and data[0][0] and data[0][0][0]:
                return data[0][0][0]
        
        # If translation fails, return original
        return text
        
    except Exception as e:
        print(f"Translation failed for '{text[:30]}...': {e}")
        return text

def clean_title(title):
    """
    Clean and standardize a vehicle title.
    
    Args:
        title (str): Raw vehicle title from scraper
        
    Returns:
        str: Cleaned and standardized title
    """
    if not title or not isinstance(title, str):
        return title
    
    # First translate any Japanese text
    cleaned = translate_japanese_text(title)
    
    # Add small delay to avoid rate limiting
    time.sleep(0.1)
    
    # Fix Land Cruiser variants (order matters!)
    cleaned = re.sub(r'Land Cruiser Prado', 'Landcruiser Prado', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'LandcruiserPrado', 'Landcruiser Prado', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'Land CruiserPrado', 'Landcruiser Prado', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'CruiserPrado', 'cruiser Prado', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'Land Cruiser', 'Landcruiser', cleaned, flags=re.IGNORECASE)
    
    # Fix other common model names
    cleaned = re.sub(r'hilux surf', 'Hilux Surf', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'FJ Cruiser', 'FJ Cruiser', cleaned, flags=re.IGNORECASE)
    
    # Fix common features and descriptions
    replacements = [
        (r'Electric sliding door on both sides', 'Dual Electric Sliding Doors'),
        (r'Both sides electric', 'Dual Electric'),
        (r'Both sides power slide', 'Dual Power Sliding'),
        (r'Rear seat monitor', 'Rear Seat Monitor'),
        (r'Around view monitor', 'Around View Monitor'),
        (r'Half leather seat', 'Half Leather Seats'),
        (r'Sun Roof', 'Sunroof'),
        (r'Back camera', 'Backup Camera'),
        (r'Air conditioner', 'Air Conditioning'),
        (r'Intelligent key', 'Smart Key'),
        (r'Corner sensor', 'Corner Sensors'),
        (r'Drive recorder', 'Dash Cam'),
        (r'One owner car', 'One Owner'),
        (r'Non smoking', 'Non-Smoking'),
        (r'Leather winding steering wheel', 'Leather Steering Wheel'),
        (r'Electric storage mirror', 'Electric Folding Mirrors'),
        (r'Full flat seat', 'Full Flat Seats'),
        (r'Cruise control', 'Cruise Control'),
        (r'inch inch', 'inch'),
    ]
    
    for pattern, replacement in replacements:
        cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)
    
    # Clean up extra whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned


def batch_clean_titles(titles):
    """
    Clean multiple titles at once.
    
    Args:
        titles (list): List of title strings to clean
        
    Returns:
        list: List of cleaned titles
    """
    return [clean_title(title) for title in titles]


# Test the function if run directly
if __name__ == "__main__":
    test_titles = [
        "Toyota Land CruiserPrado 2.7 TX 4WD",
        "Toyota LandcruiserPrado 2.7 TX Lパッケージ",
        "Toyota Landcruiser 200 4.6 ZX",
        "Honda hilux surf 2.7",
        "Nissan Electric sliding door on both sides",
        "Toyota Back camera Sun Roof One owner car"
    ]
    
    print("Title Cleaner Test:")
    print("=" * 50)
    
    for original in test_titles:
        cleaned = clean_title(original)
        print(f"Original: {original}")
        print(f"Cleaned:  {cleaned}")
        print("-" * 50)