"""
Internal API client for posting RGBridge XML
"""

import httpx
from app.core.config import settings
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
import logging

logger = logging.getLogger("rgbridge.internal_api")

@retry(
    stop=stop_after_attempt(settings.INTERNAL_API_RETRY_ATTEMPTS),
    wait=wait_fixed(settings.INTERNAL_API_RETRY_DELAY),
    retry=retry_if_exception_type(httpx.RequestError)
)
def post_xml_to_internal_api(xml_string: str, message_type: str) -> httpx.Response:
    """
    Post XML to the internal API endpoint with retries
    """
    url = settings.INTERNAL_API_URL.rstrip("/") + f"/{message_type}"
    headers = {
        "Content-Type": "application/xml"
    }
    logger.info(f"Posting XML to internal API: {url}")
    try:
        with httpx.Client(timeout=settings.INTERNAL_API_TIMEOUT) as client:
            response = client.post(url, content=xml_string.encode("utf-8"), headers=headers)
            response.raise_for_status()
            logger.info(f"Internal API response: {response.status_code}")
            return response
    except httpx.RequestError as e:
        logger.error(f"Request error posting to internal API: {e}")
        raise
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error posting to internal API: {e.response.status_code} {e.response.text}")
        raise 