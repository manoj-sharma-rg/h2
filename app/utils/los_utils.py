"""
Length of Stay (LOS) utility functions for RGBridge PMS Integration Platform
"""

from typing import List, Dict, Optional, Union
import re


def convert_los_to_binary_pattern(los_pattern: Union[str, List[bool], List[int]]) -> str:
    """
    Convert LOS pattern to RGBridge binary format (e.g., "10001111")
    
    Args:
        los_pattern: LOS pattern in various formats
        
    Returns:
        Binary pattern string
    """
    if isinstance(los_pattern, str):
        # Handle string formats
        if re.match(r'^[01]+$', los_pattern):
            # Already binary
            return los_pattern
        elif re.match(r'^[TFtf]+$', los_pattern):
            # True/False format
            return ''.join('1' if c.upper() == 'T' else '0' for c in los_pattern)
        elif re.match(r'^[YNyn]+$', los_pattern):
            # Yes/No format
            return ''.join('1' if c.upper() == 'Y' else '0' for c in los_pattern)
        else:
            # Try to parse as comma-separated or space-separated
            pattern = re.sub(r'[^\d\s,]', '', los_pattern)
            parts = re.split(r'[\s,]+', pattern)
            if len(parts) >= 7:
                return ''.join('1' if int(p) > 0 else '0' for p in parts[:7])
    
    elif isinstance(los_pattern, list):
        # Handle list formats
        if all(isinstance(x, bool) for x in los_pattern):
            # Boolean list
            return ''.join('1' if x else '0' for x in los_pattern[:7])
        elif all(isinstance(x, int) for x in los_pattern):
            # Integer list
            return ''.join('1' if x > 0 else '0' for x in los_pattern[:7])
    
    # Default pattern (all days available)
    return "1111111"


def convert_binary_pattern_to_los(binary_pattern: str) -> Dict[str, bool]:
    """
    Convert binary pattern to day-by-day LOS dictionary
    
    Args:
        binary_pattern: Binary pattern string (e.g., "10001111")
        
    Returns:
        Dictionary with day availability
    """
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    # Ensure pattern is 7 characters
    pattern = binary_pattern[:7].ljust(7, '0')
    
    result = {}
    for i, day in enumerate(days):
        result[day] = pattern[i] == '1'
    
    return result


def parse_los_pattern(los_pattern: Union[str, List, Dict]) -> Dict[str, bool]:
    """
    Parse LOS pattern from various formats to day dictionary
    
    Args:
        los_pattern: LOS pattern in various formats
        
    Returns:
        Dictionary with day availability
    """
    if isinstance(los_pattern, dict):
        # Already in day format
        return los_pattern
    
    # Convert to binary first
    binary = convert_los_to_binary_pattern(los_pattern)
    
    # Convert to day format
    return convert_binary_pattern_to_los(binary)


def format_los_pattern(los_data: Union[str, List, Dict], format_type: str = "binary") -> str:
    """
    Format LOS pattern to specified format
    
    Args:
        los_data: LOS data in any format
        format_type: Output format ('binary', 'days', 'list')
        
    Returns:
        Formatted LOS pattern
    """
    # Parse to day dictionary first
    days_dict = parse_los_pattern(los_data)
    
    if format_type == "binary":
        return ''.join('1' if days_dict[day] else '0' for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    elif format_type == "days":
        return ', '.join(day for day, available in days_dict.items() if available)
    elif format_type == "list":
        return [days_dict[day] for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']]
    else:
        return str(days_dict)


def validate_los_pattern(los_pattern: Union[str, List, Dict]) -> bool:
    """
    Validate LOS pattern format
    
    Args:
        los_pattern: LOS pattern to validate
        
    Returns:
        True if pattern is valid
    """
    try:
        parse_los_pattern(los_pattern)
        return True
    except (ValueError, TypeError):
        return False


def get_available_days(los_pattern: Union[str, List, Dict]) -> List[str]:
    """
    Get list of available days from LOS pattern
    
    Args:
        los_pattern: LOS pattern
        
    Returns:
        List of available day names
    """
    days_dict = parse_los_pattern(los_pattern)
    return [day for day, available in days_dict.items() if available]


def get_unavailable_days(los_pattern: Union[str, List, Dict]) -> List[str]:
    """
    Get list of unavailable days from LOS pattern
    
    Args:
        los_pattern: LOS pattern
        
    Returns:
        List of unavailable day names
    """
    days_dict = parse_los_pattern(los_pattern)
    return [day for day, available in days_dict.items() if not available]


def is_day_available(los_pattern: Union[str, List, Dict], day: str) -> bool:
    """
    Check if specific day is available
    
    Args:
        los_pattern: LOS pattern
        day: Day name (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
        
    Returns:
        True if day is available
    """
    days_dict = parse_los_pattern(los_pattern)
    return days_dict.get(day, False)


def create_los_pattern(available_days: List[str]) -> str:
    """
    Create binary LOS pattern from list of available days
    
    Args:
        available_days: List of available day names
        
    Returns:
        Binary pattern string
    """
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    pattern = []
    
    for day in days:
        pattern.append('1' if day in available_days else '0')
    
    return ''.join(pattern) 