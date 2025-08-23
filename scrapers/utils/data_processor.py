"""
Data Processor
Processes and validates scraped vehicle data before database insertion
"""

import re
from typing import Dict, Optional, Any
from datetime import datetime
from loguru import logger


class DataProcessor:
    """Processes and validates scraped vehicle data"""
    
    def __init__(self):
        # Manufacturer mapping for common variations
        self.manufacturer_mapping = {
            'toyota': 'Toyota',
            'nissan': 'Nissan', 
            'honda': 'Honda',
            'mazda': 'Mazda',
            'subaru': 'Subaru',
            'mitsubishi': 'Mitsubishi',
            'suzuki': 'Suzuki',
            'isuzu': 'Isuzu',
            'lexus': 'Lexus',
            'infiniti': 'Infiniti',
            'acura': 'Acura',
            'daihatsu': 'Daihatsu',
            'hino': 'Hino',
            'ud': 'UD Trucks',
            'fuso': 'Mitsubishi Fuso'
        }
        
        # Common body type mappings
        self.body_type_mapping = {
            'suv': 'SUV',
            'pickup': 'Pickup Truck',
            'truck': 'Truck',
            'van': 'Van',
            'wagon': 'Station Wagon',
            'sedan': 'Sedan',
            'hatchback': 'Hatchback',
            'coupe': 'Coupe',
            'convertible': 'Convertible'
        }
        
        # Fuel type standardization
        self.fuel_type_mapping = {
            'gasoline': 'Gasoline',
            'petrol': 'Gasoline',
            'diesel': 'Diesel',
            'hybrid': 'Hybrid',
            'electric': 'Electric',
            'lpg': 'LPG',
            'cng': 'CNG'
        }
    
    def process_vehicle_data(self, raw_data: Dict, source_site: str) -> Dict:
        """Process and validate raw vehicle data"""
        try:
            processed_data = {
                'source_id': raw_data.get('source_id'),
                'source_url': raw_data.get('source_url'),
                'source_site': source_site,
                'title_description': self._clean_title(raw_data.get('title_description', '')),
                'grade': self._extract_grade(raw_data.get('title_description', '')),
                'body_style': self._normalize_body_style(raw_data.get('body_style')),
                'price_vehicle_yen': self._validate_price(raw_data.get('price_vehicle_yen')),
                'price_total_yen': self._validate_price(raw_data.get('price_total_yen')),
                'monthly_payment_yen': self._validate_price(raw_data.get('monthly_payment_yen')),
                'model_year_ad': self._validate_year(raw_data.get('model_year_ad')),
                'model_year_era': self._convert_to_era(raw_data.get('model_year_ad')),
                'mileage_km': self._validate_mileage(raw_data.get('mileage_km')),
                'color': self._normalize_color(raw_data.get('color')),
                'transmission_details': self._normalize_transmission(raw_data.get('transmission_details')),
                'engine_displacement_cc': self._validate_engine_displacement(raw_data.get('engine_displacement_cc')),
                'fuel_type': self._normalize_fuel_type(raw_data.get('fuel_type')),
                'drive_type': self._normalize_drive_type(raw_data.get('drive_type')),
                'has_repair_history': bool(raw_data.get('has_repair_history', False)),
                'is_one_owner': bool(raw_data.get('is_one_owner', False)),
                'has_warranty': bool(raw_data.get('has_warranty', False)),
                'is_accident_free': not bool(raw_data.get('has_repair_history', False)),
                'warranty_details': self._clean_text(raw_data.get('warranty_details')),
                'maintenance_details': self._clean_text(raw_data.get('maintenance_details')),
                'shaken_status': self._clean_text(raw_data.get('shaken_status')),
                'equipment_details': self._clean_text(raw_data.get('equipment_details')),
                'dealer_name': self._clean_text(raw_data.get('dealer_name')),
                'location_prefecture': self._normalize_prefecture(raw_data.get('location_prefecture')),
                'location_city': self._clean_text(raw_data.get('location_city')),
                'dealer_phone': self._normalize_phone(raw_data.get('dealer_phone')),
                'is_available': bool(raw_data.get('is_available', True)),
                'is_featured': bool(raw_data.get('is_featured', False)),
                'export_status': raw_data.get('export_status', 'available')
            }
            
            # Extract manufacturer and model from title
            manufacturer, model = self._extract_manufacturer_model(processed_data['title_description'])
            processed_data['manufacturer_name'] = manufacturer
            processed_data['model_name'] = model
            
            # Ensure required fields are present
            if not self._validate_required_fields(processed_data):
                logger.warning(f"Vehicle data missing required fields: {processed_data.get('source_id')}")
                return None
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error processing vehicle data: {e}")
            return None
    
    def _clean_title(self, title: str) -> str:
        """Clean and normalize vehicle title"""
        if not title:
            return ""
        
        # Remove extra whitespace and normalize
        title = re.sub(r'\s+', ' ', title.strip())
        
        # Remove common prefixes/suffixes
        title = re.sub(r'^(中古車|Used Car|車両)\s*', '', title, flags=re.IGNORECASE)
        title = re.sub(r'\s*(中古車|Used Car|車両)$', '', title, flags=re.IGNORECASE)
        
        return title
    
    def _extract_grade(self, title: str) -> Optional[str]:
        """Extract grade/trim from title"""
        if not title:
            return None
        
        # Look for common grade patterns
        grade_patterns = [
            r'([A-Z]{1,3}[-\s]?[A-Z0-9]{1,3}(?:\s+[A-Z]{1,3})?)',  # Like "4WD", "2.0i", "RS"
            r'(グレード[：:]\s*([^　\s]+))',  # Japanese grade format
            r'([0-9]\.[0-9][LTli]?)',  # Engine displacement as grade
        ]
        
        for pattern in grade_patterns:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    def _extract_manufacturer_model(self, title: str) -> tuple[Optional[str], Optional[str]]:
        """Extract manufacturer and model from title"""
        if not title:
            return None, None
        
        title_lower = title.lower()
        
        # Check against known manufacturers
        for key, manufacturer in self.manufacturer_mapping.items():
            if key in title_lower:
                # Extract potential model name (next 1-2 words after manufacturer)
                pattern = rf'{re.escape(key)}\s+([A-Za-z0-9\-\s]+?)(?:\s|$)'
                match = re.search(pattern, title, re.IGNORECASE)
                if match:
                    model_text = match.group(1).strip()
                    # Take first 2 words as model name
                    model_words = model_text.split()[:2]
                    model = ' '.join(model_words)
                    return manufacturer, model
                else:
                    return manufacturer, None
        
        return None, None
    
    def _normalize_body_style(self, body_style: str) -> Optional[str]:
        """Normalize body style"""
        if not body_style:
            return None
        
        body_style_lower = body_style.lower()
        for key, normalized in self.body_type_mapping.items():
            if key in body_style_lower:
                return normalized
        
        return body_style.title()
    
    def _normalize_fuel_type(self, fuel_type: str) -> Optional[str]:
        """Normalize fuel type"""
        if not fuel_type:
            return None
        
        fuel_type_lower = fuel_type.lower()
        for key, normalized in self.fuel_type_mapping.items():
            if key in fuel_type_lower:
                return normalized
        
        return fuel_type.title()
    
    def _normalize_drive_type(self, drive_type: str) -> Optional[str]:
        """Normalize drive type"""
        if not drive_type:
            return None
        
        drive_type_lower = drive_type.lower()
        
        if '4wd' in drive_type_lower or 'awd' in drive_type_lower or '四駆' in drive_type_lower:
            return '4WD'
        elif '2wd' in drive_type_lower or 'ff' in drive_type_lower or 'fr' in drive_type_lower:
            return '2WD'
        
        return drive_type
    
    def _normalize_transmission(self, transmission: str) -> Optional[str]:
        """Normalize transmission details"""
        if not transmission:
            return None
        
        transmission_lower = transmission.lower()
        
        if 'at' in transmission_lower or 'automatic' in transmission_lower or 'オートマ' in transmission_lower:
            return 'Automatic'
        elif 'mt' in transmission_lower or 'manual' in transmission_lower or 'マニュアル' in transmission_lower:
            return 'Manual'
        elif 'cvt' in transmission_lower:
            return 'CVT'
        
        return transmission
    
    def _normalize_color(self, color: str) -> Optional[str]:
        """Normalize color name"""
        if not color:
            return None
        
        # Basic color normalization
        color_mapping = {
            'white': 'White',
            'black': 'Black',
            'silver': 'Silver',
            'gray': 'Gray',
            'grey': 'Gray',
            'red': 'Red',
            'blue': 'Blue',
            'green': 'Green',
            'yellow': 'Yellow',
            'brown': 'Brown',
            'gold': 'Gold',
            'pearl': 'Pearl White'
        }
        
        color_lower = color.lower()
        for key, normalized in color_mapping.items():
            if key in color_lower:
                return normalized
        
        return color.title()
    
    def _normalize_prefecture(self, prefecture: str) -> Optional[str]:
        """Normalize Japanese prefecture name"""
        if not prefecture:
            return None
        
        # Ensure it ends with the proper suffix
        if not any(prefecture.endswith(suffix) for suffix in ['県', '府', '都', '道']):
            # Try to add appropriate suffix based on common prefectures
            if prefecture in ['東京', 'Tokyo']:
                return '東京都'
            elif prefecture in ['大阪', 'Osaka']:
                return '大阪府'
            elif prefecture in ['京都', 'Kyoto']:
                return '京都府'
            elif prefecture in ['北海道', 'Hokkaido']:
                return '北海道'
            else:
                return f"{prefecture}県"
        
        return prefecture
    
    def _normalize_phone(self, phone: str) -> Optional[str]:
        """Normalize phone number"""
        if not phone:
            return None
        
        # Remove non-digit characters except hyphens
        phone = re.sub(r'[^\d\-]', '', phone)
        return phone if phone else None
    
    def _validate_price(self, price: Any) -> Optional[int]:
        """Validate and convert price to integer yen"""
        if price is None:
            return None
        
        try:
            price_int = int(price)
            # Reasonable price range (100,000 to 50,000,000 yen)
            if 100000 <= price_int <= 50000000:
                return price_int
        except (ValueError, TypeError):
            pass
        
        return None
    
    def _validate_year(self, year: Any) -> Optional[int]:
        """Validate model year"""
        if year is None:
            return None
        
        try:
            year_int = int(year)
            current_year = datetime.now().year
            # Reasonable year range
            if 1980 <= year_int <= current_year + 1:
                return year_int
        except (ValueError, TypeError):
            pass
        
        return None
    
    def _validate_mileage(self, mileage: Any) -> Optional[int]:
        """Validate mileage in kilometers"""
        if mileage is None:
            return None
        
        try:
            mileage_int = int(mileage)
            # Reasonable mileage range (0 to 1,000,000 km)
            if 0 <= mileage_int <= 1000000:
                return mileage_int
        except (ValueError, TypeError):
            pass
        
        return None
    
    def _validate_engine_displacement(self, displacement: Any) -> Optional[int]:
        """Validate engine displacement in CC"""
        if displacement is None:
            return None
        
        try:
            displacement_int = int(displacement)
            # Reasonable displacement range (50cc to 10000cc)
            if 50 <= displacement_int <= 10000:
                return displacement_int
        except (ValueError, TypeError):
            pass
        
        return None
    
    def _convert_to_era(self, year: int) -> Optional[str]:
        """Convert AD year to Japanese era"""
        if not year:
            return None
        
        # Simplified era conversion
        if year >= 2019:
            era_year = year - 2018
            return f"R{era_year:02d}"  # Reiwa
        elif year >= 1989:
            era_year = year - 1988
            return f"H{era_year:02d}"  # Heisei
        elif year >= 1926:
            era_year = year - 1925
            return f"S{era_year:02d}"  # Showa
        
        return None
    
    def _clean_text(self, text: str) -> Optional[str]:
        """Clean and normalize text content"""
        if not text:
            return None
        
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text.strip())
        return text if text else None
    
    def _validate_required_fields(self, data: Dict) -> bool:
        """Validate that required fields are present"""
        required_fields = [
            'source_id',
            'source_site',
            'title_description',
            'price_vehicle_yen',
            'price_total_yen',
            'model_year_ad',
            'mileage_km'
        ]
        
        for field in required_fields:
            if not data.get(field):
                logger.debug(f"Missing required field: {field}")
                return False
        
        return True