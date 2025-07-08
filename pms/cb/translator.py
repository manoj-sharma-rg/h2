from app.plugins.base import BasePMSTranslator, MessageType
from app.plugins.registry import register_translator
from typing import Dict, Any, List
import json
import xml.etree.ElementTree as ET
from datetime import datetime

@register_translator("cb")
class CbPMSTranslator(BasePMSTranslator):
    """
    Translator for cloud beds
    """
    
    def __init__(self, pms_code: str):
        super().__init__(pms_code)
        self.supported_formats = ["json"]
        self.supported_message_types = [MessageType.AVAILABILITY, MessageType.RATE]

    def parse_message(self, message: str) -> Dict[str, Any]:
        """Parse JSON message"""
        try:
            if "json" == "json":
                return json.loads(message)
            elif "json" == "xml":
                root = ET.fromstring(message)
                return self._xml_to_dict(root)
            else:
                # GraphQL or other format
                return json.loads(message)
        except Exception as e:
            raise ValueError(f"Failed to parse JSON message: {e}")
    
    def _xml_to_dict(self, element) -> Dict[str, Any]:
        """Convert XML element to dictionary"""
        result = {}
        for child in element:
            if len(child) == 0:
                result[child.tag] = child.text
            else:
                result[child.tag] = self._xml_to_dict(child)
        return result

    def translate_availability(self, message: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Translate availability message to RGBridge format"""
        mapping = self._mapping.get('availability', {})
        result = []
        
        # Apply custom conversions
        converted_message = self._apply_conversions(message)
        
        # Map fields
        rgbridge_data = {}
        for pms_field, rgbridge_field in mapping.items():
            value = self._get_nested_value(converted_message, pms_field)
            if value is not None:
                rgbridge_data[rgbridge_field] = value
        
        # Set defaults
        if 'HotelCode' not in rgbridge_data:
            rgbridge_data['HotelCode'] = 'UNKNOWN'
        if 'InvCode' not in rgbridge_data:
            rgbridge_data['InvCode'] = 'DEFAULT'
        if 'RatePlanCode' not in rgbridge_data:
            rgbridge_data['RatePlanCode'] = 'DEFAULT'
        
        result.append(rgbridge_data)
        return result

    def translate_rate(self, message: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Translate rate message to RGBridge format"""
        mapping = self._mapping.get('rate', {})
        result = []
        
        # Apply custom conversions
        converted_message = self._apply_conversions(message)
        
        # Map fields
        rgbridge_data = {}
        for pms_field, rgbridge_field in mapping.items():
            value = self._get_nested_value(converted_message, pms_field)
            if value is not None:
                rgbridge_data[rgbridge_field] = value
        
        # Set defaults
        if 'HotelCode' not in rgbridge_data:
            rgbridge_data['HotelCode'] = 'UNKNOWN'
        if 'InvCode' not in rgbridge_data:
            rgbridge_data['InvCode'] = 'DEFAULT'
        if 'RatePlanCode' not in rgbridge_data:
            rgbridge_data['RatePlanCode'] = 'DEFAULT'
        if 'CurrencyCode' not in rgbridge_data:
            rgbridge_data['CurrencyCode'] = 'USD'
        
        result.append(rgbridge_data)
        return result

    def _get_nested_value(self, data: Dict[str, Any], field_path: str) -> Any:
        """Get value from nested dictionary using dot notation"""
        keys = field_path.split('.')
        current = data
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return None
        return current
    
    def _apply_conversions(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply custom value conversions"""
        conversions = self._mapping.get('conversions', {{}})
        result = data.copy()
        
        for field, conversion in conversions.items():
            if field in result:
                try:
                    # Simple lambda evaluation (be careful with this in production)
                    if conversion.startswith('lambda'):
                        # For now, just apply common conversions
                        if 'upper()' in conversion:
                            result[field] = str(result[field]).upper()
                        elif 'lower()' in conversion:
                            result[field] = str(result[field]).lower()
                        elif 'int()' in conversion:
                            result[field] = int(float(result[field]))
                        elif 'float()' in conversion:
                            result[field] = float(result[field])
                except:
                    pass
        
        return result
