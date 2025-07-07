"""
Logging configuration for RGBridge PMS Integration Platform
"""

import logging
import sys
from typing import Optional
from app.core.config import settings


def setup_logging(
    log_level: Optional[str] = None,
    log_format: Optional[str] = None
) -> None:
    """
    Setup application logging
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Log message format
    """
    # Use settings if not provided
    log_level = log_level or settings.LOG_LEVEL
    log_format = log_format or settings.LOG_FORMAT
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("app.log")
        ]
    )
    
    # Set specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    
    # Create logger for this application
    logger = logging.getLogger("rgbridge")
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Log startup message
    logger.info(f"Logging initialized with level: {log_level}")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name
    
    Args:
        name: Logger name
        
    Returns:
        Logger instance
    """
    return logging.getLogger(f"rgbridge.{name}") 