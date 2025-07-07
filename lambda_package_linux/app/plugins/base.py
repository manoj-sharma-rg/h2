"""
Base class for PMS translators
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from enum import Enum
import logging

from app.core.logging import get_logger
from app.core.mapping_loader import mapping_loader


class MessageType(Enum):
    """Supported message types"""
    AVAILABILITY = "availability"
    RATE = "rate"


class BasePMSTranslator(ABC):
    """
    Base class for PMS translators
    
    All PMS translators must inherit from this class and implement
    the required methods.
    """
    
    def __init__(self, pms_code: str):
        """
        Initialize PMS translator
        
        Args:
            pms_code: Unique identifier for the PMS
        """
        self.pms_code = pms_code
        self.logger = get_logger(f"translator.{pms_code}")
        self._mapping = None
        
    @property
    def mapping(self) -> Dict[str, Any]:
        """
        Load and cache the mapping for this PMS
        """
        if self._mapping is None:
            self._mapping = mapping_loader.load_mapping(self.pms_code)
        return self._mapping
    
    @property
    @abstractmethod
    def supported_formats(self) -> List[str]:
        """
        List of supported message formats (JSON, XML, GraphQL)
        
        Returns:
            List of supported formats
        """
        pass
    
    @property
    @abstractmethod
    def supported_message_types(self) -> List[MessageType]:
        """
        List of supported message types
        
        Returns:
            List of supported message types
        """
        pass
    
    @abstractmethod
    def validate_message(self, message: Any, message_type: MessageType) -> bool:
        """
        Validate incoming PMS message
        
        Args:
            message: PMS message to validate
            message_type: Type of message
            
        Returns:
            True if message is valid
            
        Raises:
            ValueError: If message is invalid
        """
        pass
    
    @abstractmethod
    def translate_availability(self, message: Any) -> Dict[str, Any]:
        """
        Translate availability message to RGBridge format
        
        Args:
            message: PMS availability message
            
        Returns:
            Dictionary with RGBridge availability data
        """
        pass
    
    @abstractmethod
    def translate_rate(self, message: Any) -> Dict[str, Any]:
        """
        Translate rate message to RGBridge format
        
        Args:
            message: PMS rate message
            
        Returns:
            Dictionary with RGBridge rate data
        """
        pass
    
    def get_mapping_file(self) -> str:
        """
        Get the mapping file path for this PMS
        
        Returns:
            Path to the mapping file
        """
        return f"pms/{self.pms_code}/mapping.yaml"
    
    def log_translation(self, message_type: MessageType, success: bool, error: Optional[str] = None):
        """
        Log translation activity
        
        Args:
            message_type: Type of message being translated
            success: Whether translation was successful
            error: Error message if translation failed
        """
        if success:
            self.logger.info(f"Successfully translated {message_type.value} message")
        else:
            self.logger.error(f"Failed to translate {message_type.value} message: {error}")
    
    def __str__(self) -> str:
        return f"{self.__class__.__name__}(pms_code={self.pms_code})"
    
    def __repr__(self) -> str:
        return self.__str__() 