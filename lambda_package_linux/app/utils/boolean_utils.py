"""
Boolean utility functions for RGBridge PMS Integration Platform
"""

from typing import Union, Any


def parse_boolean(value: Any) -> bool:
    """
    Parse various boolean representations to Python boolean
    
    Args:
        value: Value to parse as boolean
        
    Returns:
        Boolean value
    """
    if isinstance(value, bool):
        return value
    
    if isinstance(value, str):
        value = value.strip().lower()
        
        # True values
        if value in ['true', 't', 'yes', 'y', '1', 'on', 'enabled', 'active']:
            return True
        
        # False values
        if value in ['false', 'f', 'no', 'n', '0', 'off', 'disabled', 'inactive']:
            return False
        
        # Try to parse as integer
        try:
            return bool(int(value))
        except (ValueError, TypeError):
            pass
    
    elif isinstance(value, (int, float)):
        return bool(value)
    
    # Default to False for unknown values
    return False


def format_boolean(value: bool, format_type: str = "string") -> Union[str, int]:
    """
    Format boolean to various formats
    
    Args:
        value: Boolean value to format
        format_type: Output format ('string', 'int', 'yes_no', 'on_off')
        
    Returns:
        Formatted boolean value
    """
    if format_type == "string":
        return "true" if value else "false"
    elif format_type == "int":
        return 1 if value else 0
    elif format_type == "yes_no":
        return "yes" if value else "no"
    elif format_type == "on_off":
        return "on" if value else "off"
    elif format_type == "enabled":
        return "enabled" if value else "disabled"
    else:
        return "true" if value else "false"


def normalize_boolean(value: Any, default: bool = False) -> bool:
    """
    Normalize any value to boolean with default fallback
    
    Args:
        value: Value to normalize
        default: Default value if parsing fails
        
    Returns:
        Normalized boolean value
    """
    try:
        return parse_boolean(value)
    except (ValueError, TypeError):
        return default


def boolean_to_string(value: bool, true_str: str = "true", false_str: str = "false") -> str:
    """
    Convert boolean to custom string representation
    
    Args:
        value: Boolean value
        true_str: String for True value
        false_str: String for False value
        
    Returns:
        String representation
    """
    return true_str if value else false_str


def string_to_boolean(value: str, true_values: list = None, false_values: list = None) -> bool:
    """
    Convert string to boolean with custom true/false values
    
    Args:
        value: String value to convert
        true_values: List of values considered True
        false_values: List of values considered False
        
    Returns:
        Boolean value
    """
    if not isinstance(value, str):
        return False
    
    value = value.strip().lower()
    
    # Default true/false values
    if true_values is None:
        true_values = ['true', 't', 'yes', 'y', '1', 'on', 'enabled', 'active']
    if false_values is None:
        false_values = ['false', 'f', 'no', 'n', '0', 'off', 'disabled', 'inactive']
    
    if value in true_values:
        return True
    elif value in false_values:
        return False
    else:
        # Try to parse as integer
        try:
            return bool(int(value))
        except (ValueError, TypeError):
            return False


def is_truthy(value: Any) -> bool:
    """
    Check if value is truthy (similar to Python's bool() but more permissive)
    
    Args:
        value: Value to check
        
    Returns:
        True if value is truthy
    """
    if isinstance(value, bool):
        return value
    
    if isinstance(value, str):
        return value.strip().lower() not in ['false', 'f', 'no', 'n', '0', 'off', 'disabled', 'inactive', '']
    
    if isinstance(value, (int, float)):
        return value != 0
    
    if value is None:
        return False
    
    # For other types, check if they're empty
    try:
        return len(value) > 0
    except (TypeError, AttributeError):
        return True


def is_falsy(value: Any) -> bool:
    """
    Check if value is falsy
    
    Args:
        value: Value to check
        
    Returns:
        True if value is falsy
    """
    return not is_truthy(value)


def safe_boolean_conversion(value: Any, default: bool = False) -> bool:
    """
    Safely convert value to boolean with error handling
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
        
    Returns:
        Boolean value
    """
    try:
        return parse_boolean(value)
    except Exception:
        return default 