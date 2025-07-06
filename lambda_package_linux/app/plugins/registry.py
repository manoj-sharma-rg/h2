"""
Plugin registry for PMS translators
"""

from typing import Dict, List, Type, Optional
import logging
from .base import BasePMSTranslator, MessageType

from app.core.logging import get_logger


class PluginRegistry:
    """
    Registry for PMS translator plugins
    
    Handles auto-discovery and registration of PMS translators
    """
    
    def __init__(self):
        """Initialize plugin registry"""
        self._translators: Dict[str, Type[BasePMSTranslator]] = {}
        self.logger = get_logger("plugin_registry")
    
    def register(self, pms_code: str, translator_class: Type[BasePMSTranslator]) -> None:
        """
        Register a PMS translator
        
        Args:
            pms_code: Unique identifier for the PMS
            translator_class: Translator class to register
        """
        if not issubclass(translator_class, BasePMSTranslator):
            raise ValueError(f"Translator class must inherit from BasePMSTranslator")
        
        self._translators[pms_code] = translator_class
        self.logger.info(f"Registered translator for PMS: {pms_code}")
    
    def unregister(self, pms_code: str) -> None:
        """
        Unregister a PMS translator
        
        Args:
            pms_code: PMS identifier to unregister
        """
        if pms_code in self._translators:
            del self._translators[pms_code]
            self.logger.info(f"Unregistered translator for PMS: {pms_code}")
    
    def get_translator(self, pms_code: str) -> Optional[Type[BasePMSTranslator]]:
        """
        Get translator class for a PMS
        
        Args:
            pms_code: PMS identifier
            
        Returns:
            Translator class or None if not found
        """
        return self._translators.get(pms_code)
    
    def create_translator(self, pms_code: str) -> Optional[BasePMSTranslator]:
        """
        Create translator instance for a PMS
        
        Args:
            pms_code: PMS identifier
            
        Returns:
            Translator instance or None if not found
        """
        translator_class = self.get_translator(pms_code)
        if translator_class:
            return translator_class(pms_code)
        return None
    
    def list_translators(self) -> List[str]:
        """
        List all registered PMS codes
        
        Returns:
            List of registered PMS codes
        """
        return list(self._translators.keys())
    
    def get_translator_info(self, pms_code: str) -> Optional[Dict]:
        """
        Get information about a translator
        
        Args:
            pms_code: PMS identifier
            
        Returns:
            Dictionary with translator information or None if not found
        """
        translator_class = self.get_translator(pms_code)
        if not translator_class:
            return None
        
        # Create temporary instance to get info
        temp_instance = translator_class(pms_code)
        
        return {
            "pms_code": pms_code,
            "class_name": translator_class.__name__,
            "supported_formats": temp_instance.supported_formats,
            "supported_message_types": [mt.value for mt in temp_instance.supported_message_types],
            "mapping_file": temp_instance.get_mapping_file()
        }
    
    def is_registered(self, pms_code: str) -> bool:
        """
        Check if a PMS translator is registered
        
        Args:
            pms_code: PMS identifier
            
        Returns:
            True if translator is registered
        """
        return pms_code in self._translators
    
    def __len__(self) -> int:
        """Number of registered translators"""
        return len(self._translators)
    
    def __contains__(self, pms_code: str) -> bool:
        """Check if PMS code is registered"""
        return pms_code in self._translators


def register_translator(pms_code: str):
    """
    Decorator to register a PMS translator
    
    Usage:
        @register_translator("pms1")
        class PMS1Translator(BasePMSTranslator):
            pass
    """
    def decorator(translator_class: Type[BasePMSTranslator]) -> Type[BasePMSTranslator]:
        # Import here to avoid circular imports
        from . import plugin_registry
        plugin_registry.register(pms_code, translator_class)
        return translator_class
    return decorator 