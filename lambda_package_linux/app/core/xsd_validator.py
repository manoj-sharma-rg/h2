"""
XSD validator utility for RGBridge XML
"""

from lxml import etree
from typing import Optional


def validate_xml_with_xsd(xml_string: str, xsd_path: str) -> Optional[str]:
    """
    Validate XML string against XSD file.
    Returns None if valid, or error message if invalid.
    """
    try:
        xml_doc = etree.fromstring(xml_string.encode("utf-8"))
        with open(xsd_path, "rb") as f:
            xsd_doc = etree.parse(f)
        schema = etree.XMLSchema(xsd_doc)
        schema.assertValid(xml_doc)
        return None
    except Exception as e:
        return str(e) 