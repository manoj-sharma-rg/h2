"""
Currency utility functions for RGBridge PMS Integration Platform
"""

from typing import Optional, Union
import re
from decimal import Decimal, ROUND_HALF_UP


# Common currency codes
CURRENCY_CODES = {
    "USD": "US Dollar",
    "EUR": "Euro",
    "GBP": "British Pound",
    "CAD": "Canadian Dollar",
    "AUD": "Australian Dollar",
    "JPY": "Japanese Yen",
    "CHF": "Swiss Franc",
    "CNY": "Chinese Yuan",
    "INR": "Indian Rupee",
    "BRL": "Brazilian Real",
    "MXN": "Mexican Peso",
    "SGD": "Singapore Dollar",
    "HKD": "Hong Kong Dollar",
    "KRW": "South Korean Won",
    "SEK": "Swedish Krona",
    "NOK": "Norwegian Krone",
    "DKK": "Danish Krone",
    "PLN": "Polish Zloty",
    "CZK": "Czech Koruna",
    "HUF": "Hungarian Forint",
}


def is_valid_currency_code(currency_code: str) -> bool:
    """
    Check if currency code is valid
    
    Args:
        currency_code: Currency code to validate
        
    Returns:
        True if currency code is valid
    """
    if not currency_code:
        return False
    
    return currency_code.upper() in CURRENCY_CODES


def get_currency_name(currency_code: str) -> Optional[str]:
    """
    Get currency name from code
    
    Args:
        currency_code: Currency code
        
    Returns:
        Currency name or None if not found
    """
    return CURRENCY_CODES.get(currency_code.upper())


def format_currency(amount: Union[float, Decimal, str], currency_code: str = "USD", 
                   include_symbol: bool = False) -> str:
    """
    Format currency amount
    
    Args:
        amount: Amount to format
        currency_code: Currency code
        include_symbol: Whether to include currency symbol
        
    Returns:
        Formatted currency string
    """
    if not is_valid_currency_code(currency_code):
        currency_code = "USD"
    
    # Convert to Decimal for precise formatting
    if isinstance(amount, str):
        try:
            amount = Decimal(amount)
        except (ValueError, TypeError):
            amount = Decimal('0')
    elif isinstance(amount, float):
        amount = Decimal(str(amount))
    elif isinstance(amount, Decimal):
        pass
    else:
        amount = Decimal('0')
    
    # Round to 2 decimal places
    amount = amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    # Format based on currency
    if currency_code == "USD":
        if include_symbol:
            return f"${amount:,.2f}"
        else:
            return f"{amount:,.2f}"
    elif currency_code == "EUR":
        if include_symbol:
            return f"€{amount:,.2f}"
        else:
            return f"{amount:,.2f}"
    elif currency_code == "GBP":
        if include_symbol:
            return f"£{amount:,.2f}"
        else:
            return f"{amount:,.2f}"
    else:
        # Generic format
        return f"{amount:,.2f} {currency_code}"


def parse_currency_amount(amount_str: str) -> Optional[Decimal]:
    """
    Parse currency amount string to Decimal
    
    Args:
        amount_str: Amount string to parse
        
    Returns:
        Parsed amount as Decimal or None if parsing fails
    """
    if not amount_str:
        return None
    
    # Remove currency symbols and extra spaces
    cleaned = re.sub(r'[^\d.,-]', '', amount_str.strip())
    
    # Handle different decimal separators
    if ',' in cleaned and '.' in cleaned:
        # Format like 1,234.56 or 1.234,56
        if cleaned.rfind(',') > cleaned.rfind('.'):
            # European format: 1.234,56
            cleaned = cleaned.replace('.', '').replace(',', '.')
        else:
            # US format: 1,234.56
            cleaned = cleaned.replace(',', '')
    elif ',' in cleaned:
        # Check if comma is decimal separator
        parts = cleaned.split(',')
        if len(parts) == 2 and len(parts[1]) <= 2:
            # Likely decimal separator
            cleaned = cleaned.replace(',', '.')
        else:
            # Likely thousands separator
            cleaned = cleaned.replace(',', '')
    
    try:
        return Decimal(cleaned)
    except (ValueError, TypeError):
        return None


def normalize_currency_code(currency_code: str) -> str:
    """
    Normalize currency code to uppercase
    
    Args:
        currency_code: Currency code to normalize
        
    Returns:
        Normalized currency code
    """
    if not currency_code:
        return "USD"
    
    normalized = currency_code.upper().strip()
    return normalized if is_valid_currency_code(normalized) else "USD"


def get_currency_precision(currency_code: str) -> int:
    """
    Get decimal precision for currency
    
    Args:
        currency_code: Currency code
        
    Returns:
        Number of decimal places
    """
    # Most currencies use 2 decimal places
    # Some like JPY typically use 0
    if currency_code.upper() in ["JPY", "KRW"]:
        return 0
    else:
        return 2


def round_currency(amount: Union[float, Decimal], currency_code: str = "USD") -> Decimal:
    """
    Round amount to appropriate precision for currency
    
    Args:
        amount: Amount to round
        currency_code: Currency code
        
    Returns:
        Rounded amount
    """
    if isinstance(amount, float):
        amount = Decimal(str(amount))
    elif isinstance(amount, str):
        amount = Decimal(amount)
    elif not isinstance(amount, Decimal):
        amount = Decimal('0')
    
    precision = get_currency_precision(currency_code)
    decimal_places = Decimal('0.' + '0' * precision)
    
    return amount.quantize(decimal_places, rounding=ROUND_HALF_UP) 