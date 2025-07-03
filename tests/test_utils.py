"""
Unit tests for utility modules
"""

import pytest
from datetime import date, datetime
from decimal import Decimal

from app.utils.date_utils import parse_date, format_date, parse_datetime, format_datetime
from app.utils.currency_utils import (
    is_valid_currency_code, format_currency, parse_currency_amount,
    normalize_currency_code, round_currency
)
from app.utils.los_utils import (
    convert_los_to_binary_pattern, parse_los_pattern, format_los_pattern,
    validate_los_pattern, get_available_days
)
from app.utils.boolean_utils import (
    parse_boolean, format_boolean, normalize_boolean, is_truthy, is_falsy
)


class TestDateUtils:
    """Test date utility functions"""
    
    def test_parse_date_iso(self):
        """Test parsing ISO date format"""
        result = parse_date("2025-11-08")
        assert result == date(2025, 11, 8)
    
    def test_parse_date_us(self):
        """Test parsing US date format"""
        result = parse_date("11/08/2025")
        assert result == date(2025, 11, 8)
    
    def test_parse_date_eu(self):
        """Test parsing EU date format"""
        result = parse_date("08/11/2025")
        assert result == date(2025, 11, 8)
    
    def test_parse_date_invalid(self):
        """Test parsing invalid date"""
        result = parse_date("invalid-date")
        assert result is None
    
    def test_format_date_iso(self):
        """Test formatting date to ISO"""
        result = format_date(date(2025, 11, 8), "iso")
        assert result == "2025-11-08"
    
    def test_format_date_us(self):
        """Test formatting date to US format"""
        result = format_date(date(2025, 11, 8), "us")
        assert result == "11/08/2025"


class TestCurrencyUtils:
    """Test currency utility functions"""
    
    def test_is_valid_currency_code(self):
        """Test currency code validation"""
        assert is_valid_currency_code("USD") is True
        assert is_valid_currency_code("EUR") is True
        assert is_valid_currency_code("INVALID") is False
        assert is_valid_currency_code("") is False
    
    def test_format_currency_usd(self):
        """Test USD currency formatting"""
        result = format_currency(1234.56, "USD")
        assert result == "1,234.56"
    
    def test_format_currency_with_symbol(self):
        """Test currency formatting with symbol"""
        result = format_currency(1234.56, "USD", include_symbol=True)
        assert result == "$1,234.56"
    
    def test_parse_currency_amount(self):
        """Test currency amount parsing"""
        result = parse_currency_amount("1,234.56")
        assert result == Decimal("1234.56")
    
    def test_normalize_currency_code(self):
        """Test currency code normalization"""
        assert normalize_currency_code("usd") == "USD"
        assert normalize_currency_code("invalid") == "USD"


class TestLOSUtils:
    """Test Length of Stay utility functions"""
    
    def test_convert_los_to_binary_pattern(self):
        """Test LOS pattern conversion to binary"""
        result = convert_los_to_binary_pattern("10001111")
        assert result == "10001111"
    
    def test_convert_los_boolean_list(self):
        """Test LOS pattern conversion from boolean list"""
        result = convert_los_to_binary_pattern([True, False, False, False, True, True, True])
        assert result == "10001111"
    
    def test_parse_los_pattern(self):
        """Test LOS pattern parsing"""
        result = parse_los_pattern("10001111")
        expected = {
            'Mon': True, 'Tue': False, 'Wed': False, 'Thu': False,
            'Fri': True, 'Sat': True, 'Sun': True
        }
        assert result == expected
    
    def test_format_los_pattern_binary(self):
        """Test LOS pattern formatting to binary"""
        los_data = {'Mon': True, 'Tue': False, 'Wed': False, 'Thu': False,
                   'Fri': True, 'Sat': True, 'Sun': True}
        result = format_los_pattern(los_data, "binary")
        assert result == "10001111"
    
    def test_validate_los_pattern(self):
        """Test LOS pattern validation"""
        assert validate_los_pattern("10001111") is True
        assert validate_los_pattern("invalid") is False


class TestBooleanUtils:
    """Test boolean utility functions"""
    
    def test_parse_boolean_string(self):
        """Test boolean parsing from string"""
        assert parse_boolean("true") is True
        assert parse_boolean("false") is False
        assert parse_boolean("yes") is True
        assert parse_boolean("no") is False
        assert parse_boolean("1") is True
        assert parse_boolean("0") is False
    
    def test_parse_boolean_integer(self):
        """Test boolean parsing from integer"""
        assert parse_boolean(1) is True
        assert parse_boolean(0) is False
    
    def test_format_boolean(self):
        """Test boolean formatting"""
        assert format_boolean(True, "string") == "true"
        assert format_boolean(False, "string") == "false"
        assert format_boolean(True, "int") == 1
        assert format_boolean(False, "int") == 0
    
    def test_normalize_boolean(self):
        """Test boolean normalization"""
        assert normalize_boolean("true") is True
        assert normalize_boolean("invalid", default=True) is True
    
    def test_is_truthy(self):
        """Test truthy value checking"""
        assert is_truthy("true") is True
        assert is_truthy("false") is False
        assert is_truthy(1) is True
        assert is_truthy(0) is False
        assert is_truthy("") is False
    
    def test_is_falsy(self):
        """Test falsy value checking"""
        assert is_falsy("false") is True
        assert is_falsy("true") is False
        assert is_falsy(0) is True
        assert is_falsy(1) is False
        assert is_falsy("") is True


if __name__ == "__main__":
    pytest.main([__file__]) 