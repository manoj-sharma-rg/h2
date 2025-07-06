"""
Cloudbeds PMS Translator
"""

from typing import Any, Dict, List
from app.plugins.base import BasePMSTranslator, MessageType
from app.plugins.registry import register_translator

@register_translator("cloudbeds")
class CloudbedsPMSTranslator(BasePMSTranslator):
    @property
    def supported_formats(self) -> List[str]:
        return ["JSON"]

    @property
    def supported_message_types(self) -> List[MessageType]:
        return [MessageType.AVAILABILITY, MessageType.RATE]

    def validate_message(self, message: Any, message_type: MessageType) -> bool:
        # Basic validation: check required fields
        if not isinstance(message, dict):
            return False
        if "Inventory" not in message or not isinstance(message["Inventory"], list):
            return False
        return True

    def translate_availability(self, message: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Translate Cloudbeds ARIUpdate to RGBridge availability format (one per inventory item)
        """
        mapping = self.mapping["availability"]
        results = []
        for inv in message.get("Inventory", []):
            # RestrictionStatus logic
            restriction_status = None
            if inv.get("close") is True:
                restriction_status = {"Status": "Close"}
            elif inv.get("closearr") is True:
                restriction_status = {"Status": "ClosedOnArrival"}
            elif inv.get("closedep") is True:
                restriction_status = {"Status": "ClosedOnDeparture"}
            # Only include RestrictionStatus if set
            result = {
                "HotelCode": message.get(mapping["HotelCode"]),
                "Start": inv.get("start_date"),
                "End": inv.get("end_date"),
                "InvCode": inv.get("ota_room_id"),
                "RatePlanCode": inv.get("ota_rate_id"),
                "BookingLimit": inv.get("units"),
                "CurrencyCode": message.get(mapping["CurrencyCode"]),
                "MinLOS": inv.get("min_los"),
                "MaxLOS": inv.get("max_los"),
                "MinAdvancedBookingOffset": inv.get("min_advanced_offset"),
                "MaxAdvancedBookingOffset": inv.get("max_advanced_offset"),
                "NumAdultsIncluded": inv.get("num_adults_included"),
                "NumChildrenIncluded": inv.get("num_children_included"),
            }
            if restriction_status:
                result["RestrictionStatus"] = restriction_status
            results.append(result)
        return results

    def translate_rate(self, message: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Translate Cloudbeds ARIUpdate to RGBridge rate format (one per inventory item)
        """
        mapping = self.mapping["rate"]
        results = []
        for inv in message.get("Inventory", []):
            result = {
                "HotelCode": message.get(mapping["HotelCode"]),
                "Start": inv.get("start_date"),
                "End": inv.get("end_date"),
                "InvCode": inv.get("ota_room_id"),
                "RatePlanCode": inv.get("ota_rate_id"),
                "CurrencyCode": message.get(mapping["CurrencyCode"]),
                "BaseRate": inv.get("rate"),
                "RdefSingle": inv.get("rdef_single"),
                "Adult3": inv.get("adult_3"),
                "Child3": inv.get("child_3"),
            }
            results.append(result)
        return results 