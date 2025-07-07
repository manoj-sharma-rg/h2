"""
Date utility functions for RGBridge PMS Integration Platform
"""

from datetime import datetime, date
from typing import Optional, Union
import re


def parse_date(date_str: str, format_hint: Optional[str] = None) -> Optional[date]:
    """
    Parse date string in various formats
    
    Args:
        date_str: Date string to parse
        format_hint: Optional format hint (e.g., 'iso', 'us', 'eu')
        
    Returns:
        Parsed date or None if parsing fails
    """
    if not date_str:
        return None
    
    # Common date formats
    formats = [
        "%Y-%m-%d",           # ISO format: 2025-11-08
        "%d/%m/%Y",           # EU format: 08/11/2025
        "%m/%d/%Y",           # US format: 11/08/2025
        "%Y-%m-%dT%H:%M:%S",  # ISO datetime: 2025-11-08T10:30:00
        "%Y-%m-%dT%H:%M:%SZ", # ISO datetime with Z: 2025-11-08T10:30:00Z
        "%d-%m-%Y",           # EU with dashes: 08-11-2025
        "%m-%d-%Y",           # US with dashes: 11-08-2025
    ]
    
    # Try parsing with different formats
    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str, fmt)
            return parsed.date()
        except ValueError:
            continue
    
    # Try ISO format with timezone info
    try:
        parsed = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return parsed.date()
    except ValueError:
        pass
    
    return None


def format_date(date_obj: Union[date, datetime], format_type: str = "iso") -> str:
    """
    Format date object to string
    
    Args:
        date_obj: Date or datetime object
        format_type: Format type ('iso', 'us', 'eu')
        
    Returns:
        Formatted date string
    """
    if isinstance(date_obj, datetime):
        date_obj = date_obj.date()
    
    if format_type == "iso":
        return date_obj.strftime("%Y-%m-%d")
    elif format_type == "us":
        return date_obj.strftime("%m/%d/%Y")
    elif format_type == "eu":
        return date_obj.strftime("%d/%m/%Y")
    else:
        return date_obj.strftime("%Y-%m-%d")


def parse_datetime(datetime_str: str) -> Optional[datetime]:
    """
    Parse datetime string in various formats
    
    Args:
        datetime_str: Datetime string to parse
        
    Returns:
        Parsed datetime or None if parsing fails
    """
    if not datetime_str:
        return None
    
    # Common datetime formats
    formats = [
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M:%S",
    ]
    
    # Try parsing with different formats
    for fmt in formats:
        try:
            return datetime.strptime(datetime_str, fmt)
        except ValueError:
            continue
    
    # Try ISO format with timezone info
    try:
        return datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
    except ValueError:
        pass
    
    return None


def format_datetime(datetime_obj: datetime, include_timezone: bool = False) -> str:
    """
    Format datetime object to ISO string
    
    Args:
        datetime_obj: Datetime object
        include_timezone: Whether to include timezone info
        
    Returns:
        Formatted datetime string
    """
    if include_timezone:
        return datetime_obj.isoformat()
    else:
        return datetime_obj.strftime("%Y-%m-%dT%H:%M:%S")


def is_valid_date_range(start_date: date, end_date: date) -> bool:
    """
    Check if date range is valid (start <= end)
    
    Args:
        start_date: Start date
        end_date: End date
        
    Returns:
        True if range is valid
    """
    return start_date <= end_date


def get_date_difference(start_date: date, end_date: date) -> int:
    """
    Get number of days between two dates
    
    Args:
        start_date: Start date
        end_date: End date
        
    Returns:
        Number of days
    """
    return (end_date - start_date).days 