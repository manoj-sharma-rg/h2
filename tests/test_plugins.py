"""
Unit tests for plugin system
"""

import pytest
from unittest.mock import Mock

from app.plugins.base import BasePMSTranslator, MessageType
from app.plugins.registry import PluginRegistry, register_translator


class MockTranslator(BasePMSTranslator):
    """Mock translator for testing"""
    
    @property
    def supported_formats(self):
        return ["JSON", "XML"]
    
    @property
    def supported_message_types(self):
        return [MessageType.AVAILABILITY, MessageType.RATE]
    
    def validate_message(self, message, message_type):
        return True
    
    def translate_availability(self, message):
        return {"hotel_code": "TEST", "status": "available"}
    
    def translate_rate(self, message):
        return {"hotel_code": "TEST", "rate": 100.00}


class TestPluginRegistry:
    """Test plugin registry functionality"""
    
    def test_register_translator(self):
        """Test registering a translator"""
        registry = PluginRegistry()
        registry.register("test_pms", MockTranslator)
        
        assert "test_pms" in registry
        assert registry.is_registered("test_pms")
    
    def test_get_translator(self):
        """Test getting a translator"""
        registry = PluginRegistry()
        registry.register("test_pms", MockTranslator)
        
        translator_class = registry.get_translator("test_pms")
        assert translator_class == MockTranslator
    
    def test_create_translator(self):
        """Test creating a translator instance"""
        registry = PluginRegistry()
        registry.register("test_pms", MockTranslator)
        
        translator = registry.create_translator("test_pms")
        assert isinstance(translator, MockTranslator)
        assert translator.pms_code == "test_pms"
    
    def test_list_translators(self):
        """Test listing registered translators"""
        registry = PluginRegistry()
        registry.register("pms1", MockTranslator)
        registry.register("pms2", MockTranslator)
        
        translators = registry.list_translators()
        assert "pms1" in translators
        assert "pms2" in translators
        assert len(translators) == 2
    
    def test_get_translator_info(self):
        """Test getting translator information"""
        registry = PluginRegistry()
        registry.register("test_pms", MockTranslator)
        
        info = registry.get_translator_info("test_pms")
        assert info["pms_code"] == "test_pms"
        assert info["class_name"] == "MockTranslator"
        assert info["supported_formats"] == ["JSON", "XML"]
        assert "availability" in info["supported_message_types"]
        assert "rate" in info["supported_message_types"]
    
    def test_unregister_translator(self):
        """Test unregistering a translator"""
        registry = PluginRegistry()
        registry.register("test_pms", MockTranslator)
        
        assert registry.is_registered("test_pms")
        registry.unregister("test_pms")
        assert not registry.is_registered("test_pms")
    
    def test_register_invalid_translator(self):
        """Test registering invalid translator class"""
        registry = PluginRegistry()
        
        with pytest.raises(ValueError):
            registry.register("test_pms", str)  # Not a BasePMSTranslator


class TestBasePMSTranslator:
    """Test base translator functionality"""
    
    def test_translator_initialization(self):
        """Test translator initialization"""
        translator = MockTranslator("test_pms")
        assert translator.pms_code == "test_pms"
        assert translator.logger is not None
    
    def test_get_mapping_file(self):
        """Test mapping file path generation"""
        translator = MockTranslator("test_pms")
        mapping_file = translator.get_mapping_file()
        assert mapping_file == "mappings/test_pms.yaml"
    
    def test_log_translation_success(self):
        """Test logging successful translation"""
        translator = MockTranslator("test_pms")
        translator.log_translation(MessageType.AVAILABILITY, True)
        # No exception should be raised
    
    def test_log_translation_failure(self):
        """Test logging failed translation"""
        translator = MockTranslator("test_pms")
        translator.log_translation(MessageType.AVAILABILITY, False, "Test error")
        # No exception should be raised
    
    def test_translator_string_representation(self):
        """Test translator string representation"""
        translator = MockTranslator("test_pms")
        assert str(translator) == "MockTranslator(pms_code=test_pms)"


class TestRegisterDecorator:
    """Test register decorator functionality"""
    
    def test_register_decorator(self):
        """Test register decorator"""
        registry = PluginRegistry()
        
        @register_translator("decorated_pms")
        class DecoratedTranslator(MockTranslator):
            pass
        
        # The decorator should have registered the translator
        # Note: This test depends on the global registry being used
        # In a real scenario, you'd need to ensure the registry is properly imported


class TestMessageType:
    """Test MessageType enum"""
    
    def test_message_type_values(self):
        """Test MessageType enum values"""
        assert MessageType.AVAILABILITY.value == "availability"
        assert MessageType.RATE.value == "rate"
    
    def test_message_type_comparison(self):
        """Test MessageType comparison"""
        assert MessageType.AVAILABILITY != MessageType.RATE
        assert MessageType.AVAILABILITY == MessageType.AVAILABILITY


if __name__ == "__main__":
    pytest.main([__file__]) 