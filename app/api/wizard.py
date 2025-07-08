"""
Wizard API endpoints for automated PMS integration
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import json
import yaml
import re
from datetime import datetime
import os
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

router = APIRouter(prefix="/api/v1/wizard")

# RGBridge field mappings for intelligent detection
RGBRIDGE_AVAILABILITY_FIELDS = {
    'hotel_code': 'HotelCode',
    'hotel_id': 'HotelCode',
    'property_id': 'HotelCode',
    'room_type': 'InvCode',
    'inventory_code': 'InvCode',
    'rate_plan': 'RatePlanCode',
    'rate_plan_code': 'RatePlanCode',
    'available': 'Status',
    'availability': 'Status',
    'booking_limit': 'BookingLimit',
    'limit': 'BookingLimit',
    'start_date': 'Start',
    'end_date': 'End',
    'date_from': 'Start',
    'date_to': 'End',
    'check_in': 'Start',
    'check_out': 'End',
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Weds',
    'thursday': 'Thur',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun',
    'min_stay': 'MinLOS',
    'max_stay': 'MaxLOS',
    'min_los': 'MinLOS',
    'max_los': 'MaxLOS',
    'restriction_status': 'RestrictionStatus',
    'status': 'Status'
}

RGBRIDGE_RATE_FIELDS = {
    'hotel_code': 'HotelCode',
    'hotel_id': 'HotelCode',
    'property_id': 'HotelCode',
    'room_type': 'InvCode',
    'inventory_code': 'InvCode',
    'rate_plan': 'RatePlanCode',
    'rate_plan_code': 'RatePlanCode',
    'rate': 'AmountBeforeTax',
    'price': 'AmountBeforeTax',
    'amount': 'AmountBeforeTax',
    'base_rate': 'AmountBeforeTax',
    'total_rate': 'AmountAfterTax',
    'final_price': 'AmountAfterTax',
    'currency': 'CurrencyCode',
    'currency_code': 'CurrencyCode',
    'start_date': 'Start',
    'end_date': 'End',
    'date_from': 'Start',
    'date_to': 'End',
    'check_in': 'Start',
    'check_out': 'End',
    'guests': 'NumberOfGuests',
    'guest_count': 'NumberOfGuests',
    'occupancy': 'NumberOfGuests',
    'cancellation_policy': 'CancelPolicy',
    'cancel_policy': 'CancelPolicy',
    'meal_plan': 'MealPlanCodes',
    'board': 'MealPlanCodes'
}

def extract_fields_from_json(message: str) -> List[str]:
    """Extract field names from JSON message"""
    try:
        data = json.loads(message)
        fields = []
        
        def extract_nested_fields(obj, prefix=''):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    field_name = f"{prefix}.{key}" if prefix else key
                    fields.append(field_name.lower())
                    if isinstance(value, (dict, list)):
                        extract_nested_fields(value, field_name)
            elif isinstance(obj, list) and obj:
                extract_nested_fields(obj[0], prefix)
        
        extract_nested_fields(data)
        return list(set(fields))
    except:
        return []

def extract_fields_from_xml(message: str) -> List[str]:
    """Extract field names from XML message"""
    try:
        # Simple XML field extraction using regex
        fields = re.findall(r'<(\w+)[^>]*>', message)
        return list(set([field.lower() for field in fields]))
    except:
        return []

def intelligent_mapping(fields: List[str], rgbridge_fields: Dict[str, str]) -> Dict[str, str]:
    """Intelligently map PMS fields to RGBridge fields"""
    mappings = {}
    
    for field in fields:
        # Direct match
        if field in rgbridge_fields:
            mappings[field] = rgbridge_fields[field]
            continue
            
        # Partial match
        for rgbridge_key, rgbridge_value in rgbridge_fields.items():
            if rgbridge_key in field or field in rgbridge_key:
                mappings[field] = rgbridge_value
                break
                
        # Fuzzy match for common patterns
        if 'hotel' in field and 'hotel_code' not in mappings:
            mappings[field] = 'HotelCode'
        elif 'room' in field and 'InvCode' not in mappings.values():
            mappings[field] = 'InvCode'
        elif 'rate' in field and 'RatePlanCode' not in mappings.values():
            mappings[field] = 'RatePlanCode'
        elif 'date' in field and 'Start' not in mappings.values():
            mappings[field] = 'Start'
        elif 'price' in field or 'amount' in field:
            mappings[field] = 'AmountBeforeTax'
    
    return mappings

@router.post("/analyze")
async def analyze_message_format(request: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze PMS message format and suggest mappings"""
    try:
        pms_code = request.get('pms_code', '')
        availability_message = request.get('availability_message', '')
        rate_message = request.get('rate_message', '')
        combined_message = request.get('combined_message', '')
        message_format = request.get('message_format', 'json')
        
        # If both are missing, but combined_message is present, try to use it for both
        if not availability_message and not rate_message and combined_message:
            availability_message = combined_message
            rate_message = combined_message
        if not availability_message or not rate_message:
            raise HTTPException(status_code=400, detail="Both availability and rate messages are required (or provide combined_message)")
        
        # Extract fields based on format
        if message_format == 'json':
            availability_fields = extract_fields_from_json(availability_message)
            rate_fields = extract_fields_from_json(rate_message)
        elif message_format == 'xml':
            availability_fields = extract_fields_from_xml(availability_message)
            rate_fields = extract_fields_from_xml(rate_message)
        else:
            # For GraphQL, treat as JSON for now
            availability_fields = extract_fields_from_json(availability_message)
            rate_fields = extract_fields_from_json(rate_message)
        
        # Generate intelligent mappings
        availability_mappings = intelligent_mapping(availability_fields, RGBRIDGE_AVAILABILITY_FIELDS)
        rate_mappings = intelligent_mapping(rate_fields, RGBRIDGE_RATE_FIELDS)
        
        # Find unmapped fields
        all_fields = set(availability_fields + rate_fields)
        mapped_fields = set(availability_mappings.keys()) | set(rate_mappings.keys())
        unmapped_fields = list(all_fields - mapped_fields)
        
        return {
            "availability_mappings": availability_mappings,
            "rate_mappings": rate_mappings,
            "unmapped_fields": unmapped_fields,
            "detected_fields": {
                "availability": availability_fields,
                "rate": rate_fields
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/generate")
async def generate_code(request: Dict[str, Any]) -> Dict[str, Any]:
    """Generate translator code and mapping YAML"""
    try:
        pms_code = request.get('pms_code', '')
        pms_name = request.get('pms_name', '')
        availability_mappings = request.get('availability_mappings', {})
        rate_mappings = request.get('rate_mappings', {})
        custom_conversions = request.get('custom_conversions', {})
        message_format = request.get('message_format', 'json')
        
        if not pms_code or not pms_name:
            raise HTTPException(status_code=400, detail="PMS code and name are required")
        
        # Generate translator code
        translator_code = generate_translator_code(
            pms_code, pms_name, availability_mappings, 
            rate_mappings, custom_conversions, message_format
        )
        
        # Generate mapping YAML
        mapping_yaml = generate_mapping_yaml(
            pms_code, availability_mappings, rate_mappings, custom_conversions
        )
        
        return {
            "translator_code": translator_code,
            "mapping_yaml": mapping_yaml
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code generation failed: {str(e)}")

def generate_translator_code(
    pms_code: str, 
    pms_name: str, 
    availability_mappings: Dict[str, str],
    rate_mappings: Dict[str, str],
    custom_conversions: Dict[str, str],
    message_format: str
) -> str:
    """Generate Python translator code"""
    
    # Import statements
    imports = """from app.plugins.base import BasePMSTranslator, MessageType
from app.plugins.registry import register_translator
from typing import Dict, Any, List
import json
import xml.etree.ElementTree as ET
from datetime import datetime
"""
    
    # Class definition
    class_def = f"""
@register_translator("{pms_code}")
class {pms_code.capitalize()}PMSTranslator(BasePMSTranslator):
    \"\"\"
    Translator for {pms_name}
    \"\"\"
    
    def __init__(self, pms_code: str):
        super().__init__(pms_code)
        self.supported_formats = ["{message_format}"]
        self.supported_message_types = [MessageType.AVAILABILITY, MessageType.RATE]
"""
    
    # Parse method
    parse_method = f"""
    def parse_message(self, message: str) -> Dict[str, Any]:
        \"\"\"Parse {message_format.upper()} message\"\"\"
        try:
            if "{message_format}" == "json":
                return json.loads(message)
            elif "{message_format}" == "xml":
                root = ET.fromstring(message)
                return self._xml_to_dict(root)
            else:
                # GraphQL or other format
                return json.loads(message)
        except Exception as e:
            raise ValueError(f"Failed to parse {message_format.upper()} message: {{e}}")
    
    def _xml_to_dict(self, element) -> Dict[str, Any]:
        \"\"\"Convert XML element to dictionary\"\"\"
        result = {{}}
        for child in element:
            if len(child) == 0:
                result[child.tag] = child.text
            else:
                result[child.tag] = self._xml_to_dict(child)
        return result
"""
    
    # Availability translation
    availability_method = f"""
    def translate_availability(self, message: Dict[str, Any]) -> List[Dict[str, Any]]:
        \"\"\"Translate availability message to RGBridge format\"\"\"
        mapping = self._mapping.get('availability', {{}})
        result = []
        
        # Apply custom conversions
        converted_message = self._apply_conversions(message)
        
        # Map fields
        rgbridge_data = {{}}
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
"""
    
    # Rate translation
    rate_method = f"""
    def translate_rate(self, message: Dict[str, Any]) -> List[Dict[str, Any]]:
        \"\"\"Translate rate message to RGBridge format\"\"\"
        mapping = self._mapping.get('rate', {{}})
        result = []
        
        # Apply custom conversions
        converted_message = self._apply_conversions(message)
        
        # Map fields
        rgbridge_data = {{}}
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
"""
    
    # Utility methods
    utility_methods = """
    def _get_nested_value(self, data: Dict[str, Any], field_path: str) -> Any:
        \"\"\"Get value from nested dictionary using dot notation\"\"\"
        keys = field_path.split('.')
        current = data
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return None
        return current
    
    def _apply_conversions(self, data: Dict[str, Any]) -> Dict[str, Any]:
        \"\"\"Apply custom value conversions\"\"\"
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
"""
    
    return imports + class_def + parse_method + availability_method + rate_method + utility_methods

def generate_mapping_yaml(
    pms_code: str,
    availability_mappings: Dict[str, str],
    rate_mappings: Dict[str, str],
    custom_conversions: Dict[str, str]
) -> str:
    """Generate YAML mapping file"""
    
    mapping_data = {
        'pms_code': pms_code,
        'availability': availability_mappings,
        'rate': rate_mappings,
        'conversions': custom_conversions,
        'metadata': {
            'created_at': datetime.now().isoformat(),
            'version': '1.0'
        }
    }
    
    return yaml.dump(mapping_data, default_flow_style=False, sort_keys=False)

@router.post("/suggest-mapping")
async def suggest_mapping(request: Dict[str, Any]) -> Dict[str, Any]:
    """Suggest a mapping for a PMS field using AI (OpenAI GPT) or fallback heuristic"""
    field = request.get('field')
    sample_message = request.get('sample_message')
    rgbridge_fields = request.get('rgbridge_fields', [])
    type_ = request.get('type', 'availability')
    if not field or not sample_message or not rgbridge_fields:
        raise HTTPException(status_code=400, detail="Missing required parameters")

    # Try OpenAI if available
    if OPENAI_AVAILABLE and os.getenv('OPENAI_API_KEY'):
        openai.api_key = os.getenv('OPENAI_API_KEY')
        prompt = f"""
You are an expert in hotel PMS integrations. Given the following PMS message sample and a list of possible RGBridge fields, suggest the best mapping for the PMS field '{field}'.

Sample message:
{sample_message}

Possible RGBridge fields: {', '.join(rgbridge_fields)}

Return only the best matching RGBridge field name, or 'NONE' if no good match exists.
"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are a helpful assistant for PMS mapping."},
                          {"role": "user", "content": prompt}],
                max_tokens=20,
                temperature=0.0
            )
            suggestion = response.choices[0].message['content'].strip()
            if suggestion.upper() == 'NONE':
                suggestion = None
            return {"suggestion": suggestion, "method": "ai"}
        except Exception as e:
            pass  # fallback to heuristic

    # Fallback: simple heuristic (partial match)
    suggestion = None
    for rgf in rgbridge_fields:
        if field.lower() in rgf.lower() or rgf.lower() in field.lower():
            suggestion = rgf
            break
    return {"suggestion": suggestion, "method": "heuristic"} 