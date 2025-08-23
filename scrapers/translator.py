"""
Simple Japanese to English translator for vehicle data
"""

import re

class VehicleTranslator:
    """Translates Japanese vehicle terms to English"""
    
    def __init__(self):
        # Japanese car manufacturers to English
        self.manufacturers = {
            'トヨタ': 'Toyota',
            'ニッサン': 'Nissan', 
            '日産': 'Nissan',
            'ホンダ': 'Honda',
            'マツダ': 'Mazda',
            'スバル': 'Subaru',
            '三菱': 'Mitsubishi',
            'スズキ': 'Suzuki',
            'いすゞ': 'Isuzu',
            'レクサス': 'Lexus',
            'インフィニティ': 'Infiniti',
            'アキュラ': 'Acura'
        }
        
        # Model names
        self.models = {
            'ランドクルーザー70': 'Land Cruiser 70',
            'ランドクルーザー': 'Land Cruiser',
            'プラド': 'Prado',
            'ハイラックス': 'Hilux',
            'ハイエース': 'Hiace',
            'パトロール': 'Patrol',
            'エルグランド': 'Elgrand',
            'パジェロ': 'Pajero',
            'デリカ': 'Delica'
        }
        
        # Technical terms
        self.technical_terms = {
            'ディーゼルターボ': 'Diesel Turbo',
            'ディーゼル': 'Diesel',
            'ガソリン': 'Gasoline',
            'ハイブリッド': 'Hybrid',
            '4WD': '4WD',
            '2WD': '2WD',
            'AWD': 'AWD',
            'マニュアル': 'Manual',
            'オートマ': 'Automatic',
            'CVT': 'CVT',
            'ナビ': 'Navigation',
            'バックカメラ': 'Backup Camera',
            'Bカメラ': 'Backup Camera',
            'ETC': 'ETC',
            'LED': 'LED',
            'エアコン': 'Air Conditioning',
            'パワステ': 'Power Steering',
            'ABS': 'ABS',
            'エアバッグ': 'Airbag',
            'キーレス': 'Keyless',
            'アルミホイール': 'Alloy Wheels',
            'サンルーフ': 'Sunroof',
            '電動': 'Electric',
            'デフロック': 'Diff Lock',
            '前後': 'Front/Rear',
            '純正': 'OEM',
            '社外': 'Aftermarket',
            '禁煙車': 'Non-Smoking',
            'ワンオーナー': 'One Owner',
            '修復歴なし': 'No Accident History',
            '車検': 'Inspection',
            '整備': 'Maintenance',
            '保証': 'Warranty',
            'フルセグTV': 'Full Segment TV',
            'フルセグ': 'Full Segment TV',
            'フロアマット': 'Floor Mats',
            'シートカバー': 'Seat Covers',
            '背面タイヤ': 'Rear Spare Tire',
            'パワーステアリング': 'Power Steering',
            'パワーウィンドウ': 'Power Windows',
            'セキュリティー': 'Security System',
            'ボンネットバグガード': 'Hood Bug Guard',
            'バックモニター': 'Backup Monitor',
            'セーフティセンス': 'Safety Sense',
            'クルーズコントロール': 'Cruise Control',
            'タイプC端子': 'Type-C Port',
            'ドライブレコーダー': 'Drive Recorder',
            'ティックハイビーム': 'Automatic High Beam',
            'ダウンヒルアシスト': 'Downhill Assist',
            'インチAW': 'inch Alloy Wheels',
            'インチ': 'inch',
            'クラシックカスタム': 'Classic Custom',
            '再販': 'Re-release',
            'カスタム': 'Custom'
        }
    
    def translate_text(self, japanese_text: str) -> str:
        """Translate Japanese vehicle text to English"""
        if not japanese_text:
            return ""
        
        text = japanese_text
        
        # Replace manufacturers
        for jp, en in self.manufacturers.items():
            text = text.replace(jp, en)
        
        # Replace models
        for jp, en in self.models.items():
            text = text.replace(jp, en)
        
        # Replace technical terms
        for jp, en in self.technical_terms.items():
            text = text.replace(jp, en)
        
        # Clean up extra spaces
        text = re.sub(r'\s+', ' ', text.strip())
        
        return text
    
    def get_english_manufacturer(self, japanese_name: str) -> str:
        """Get English manufacturer name"""
        return self.manufacturers.get(japanese_name, japanese_name)
    
    def get_english_model(self, japanese_name: str) -> str:
        """Get English model name"""
        translated = japanese_name
        for jp, en in self.models.items():
            translated = translated.replace(jp, en)
        return translated