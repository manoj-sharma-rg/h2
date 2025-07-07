"""
API endpoints for RGBridge PMS Integration Platform
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
import logging
from fastapi.responses import Response
import os

from app.core.config import settings
from app.core.logging import get_logger
from app.plugins import plugin_registry
from app.plugins.base import MessageType
from app.core.xml_builder import build_avail_notif_xml, build_rate_amount_notif_xml
from app.core.xsd_validator import validate_xml_with_xsd
from app.core.internal_api_client import post_xml_to_internal_api

# Create router
router = APIRouter()

# Setup security
security = HTTPBearer(auto_error=False)

# Get logger
logger = get_logger("api")


async def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None
) -> bool:
    """
    Verify API key for authentication
    
    Args:
        credentials: HTTP authorization credentials
        request: FastAPI request object
        
    Returns:
        True if authentication successful
        
    Raises:
        HTTPException: If authentication fails
    """
    logger.info(f"called verify_api_key")
    # Check if API keys are configured
    if not settings.API_KEYS:
        logger.warning("No API keys configured, skipping authentication")
        return True
    
    # Get API key from header or bearer token
    api_key = None
    if credentials:
        api_key = credentials.credentials
    else:
        api_key = request.headers.get(settings.API_KEY_HEADER)
    
    if not api_key:
        logger.warning("No API key provided")
        raise HTTPException(
            status_code=401,
            detail="API key required"
        )
    
    if api_key not in settings.API_KEYS:
        logger.warning(f"Invalid API key provided: {api_key[:8]}...")
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )
    
    logger.debug("API key authentication successful")
    return True


@router.get("/pms/{pms_code}")
async def pms_endpoint(
    pms_code: str,
    request: Request,
    authenticated: bool = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Generic PMS endpoint for receiving messages
    
    Args:
        pms_code: PMS identifier
        request: FastAPI request object
        authenticated: Authentication verification
        
    Returns:
        Response indicating message received
    """
    logger.info(f"Received message from PMS: {pms_code}")
    
    # Log request details
    logger.debug(f"Request method: {request.method}")
    logger.debug(f"Request headers: {dict(request.headers)}")
    
    # TODO: Implement PMS-specific message processing
    # This will be expanded in Phase 3
    
    return {
        "message": f"Message received from PMS: {pms_code}",
        "status": "received",
        "pms_code": pms_code
    }


@router.post("/pms/{pms_code}")
async def pms_post_endpoint(
    pms_code: str,
    request: Request,
    message_type: str = Query(..., description="Type of message: availability or rate"),
    authenticated: bool = Depends(verify_api_key)
) -> Response:
    """
    Receive PMS message, validate, translate to RGBridge XML, validate, and post to internal API
    """
    logger.info(f"Received POST message from PMS: {pms_code}")
    logger.debug(f"Request method: {request.method}")
    logger.debug(f"Request headers: {dict(request.headers)}")

    # Get translator
    translator_class = plugin_registry.get_translator(pms_code)
    if not translator_class:
        logger.error(f"No translator registered for PMS: {pms_code}")
        raise HTTPException(status_code=404, detail=f"No translator registered for PMS: {pms_code}")
    translator = translator_class(pms_code)
    logger.info(f"translator: {translator}")
    # Parse JSON body
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Invalid JSON payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    logger.info(f"payload: {payload}")

    # Determine message type
    try:
        msg_type = MessageType(message_type.lower())
    except ValueError:
        logger.error(f"Invalid message_type: {message_type}")
        raise HTTPException(status_code=400, detail="Invalid message_type. Use 'availability' or 'rate'.")
    logger.info(f"msg_type: {msg_type}")

    # Validate message
    if not translator.validate_message(payload, msg_type):
        logger.error(f"Validation failed for PMS: {pms_code}, message_type: {message_type}")
        raise HTTPException(status_code=400, detail="Message validation failed.")
    logger.info(f"Validation passed for PMS: {pms_code}, message_type: {message_type}")

    # Translate and build XML
    try:
        if msg_type == MessageType.AVAILABILITY:
            translated = translator.translate_availability(payload)
            hotel_code = translated[0]["HotelCode"] if translated and "HotelCode" in translated[0] else "UNKNOWN"
            xml_string = build_avail_notif_xml(hotel_code, translated)
            xsd_path = os.path.join("schemas", "OTA_HotelAvailNotifRQ.xsd")
        elif msg_type == MessageType.RATE:
            translated = translator.translate_rate(payload)
            hotel_code = translated[0]["HotelCode"] if translated and "HotelCode" in translated[0] else "UNKNOWN"
            xml_string = build_rate_amount_notif_xml(hotel_code, translated)
            xsd_path = os.path.join("schemas", "OTA_HotelRateAmountNotifRQ.xsd")
        else:
            raise HTTPException(status_code=400, detail="Unsupported message_type.")
    except Exception as e:
        logger.error(f"Translation/XML build error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation/XML build error: {e}")
    logger.info(f"xml_string: {xml_string}")

    # Validate XML against XSD
    xsd_error = validate_xml_with_xsd(xml_string, xsd_path)
    if xsd_error:
        logger.error(f"XML validation error: {xsd_error}")
        raise HTTPException(status_code=500, detail=f"XML validation error: {xsd_error}")
    logger.info(f"XML validation passed for PMS: {pms_code}, message_type: {message_type}, starting post to internal API")

    # Forward Authorization header if present
    auth_header = request.headers.get("authorization")
    try:
        internal_response = post_xml_to_internal_api(xml_string, message_type, auth_header=auth_header)
    except Exception as e:
        logger.error(f"Failed to post to internal API: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to post to internal API: {e}")

    return Response(content=internal_response.text, status_code=internal_response.status_code, media_type="application/xml") 