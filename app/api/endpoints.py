"""
API endpoints for RGBridge PMS Integration Platform
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
import logging

from app.core.config import settings
from app.core.logging import get_logger

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
    authenticated: bool = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Generic PMS POST endpoint for receiving messages
    
    Args:
        pms_code: PMS identifier
        request: FastAPI request object
        authenticated: Authentication verification
        
    Returns:
        Response indicating message received
    """
    logger.info(f"Received POST message from PMS: {pms_code}")
    
    # Log request details
    logger.debug(f"Request method: {request.method}")
    logger.debug(f"Request headers: {dict(request.headers)}")
    
    # TODO: Implement PMS-specific message processing
    # This will be expanded in Phase 3
    
    return {
        "message": f"POST message received from PMS: {pms_code}",
        "status": "received",
        "pms_code": pms_code
    }


@router.get("/pms")
async def list_pms_endpoints() -> Dict[str, Any]:
    """
    List available PMS endpoints
    
    Returns:
        List of configured PMS endpoints
    """
    # TODO: Return list of configured PMS endpoints
    # This will be populated from plugin system in Phase 6
    
    return {
        "message": "PMS endpoints",
        "endpoints": [
            # Will be populated from plugin registry
        ]
    } 