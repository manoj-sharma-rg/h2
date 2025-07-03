"""
XML builder utility for RGBridge OTA_HotelAvailNotifRQ
"""

from lxml import etree
from datetime import datetime
from typing import List, Dict, Any

NAMESPACE = "http://www.opentravel.org/OTA/2003/05"
NSMAP = {None: NAMESPACE}


def build_avail_notif_xml(
    hotel_code: str,
    avail_status_messages: List[Dict[str, Any]],
    timestamp: str = None,
    target: str = "Production",
    version: str = "1",
    echo_token: str = None
) -> str:
    """
    Build OTA_HotelAvailNotifRQ XML from data
    """
    if not timestamp:
        timestamp = datetime.utcnow().isoformat()
    if not echo_token:
        echo_token = str(int(datetime.utcnow().timestamp()))

    root = etree.Element(
        "OTA_HotelAvailNotifRQ",
        nsmap=NSMAP,
        TimeStamp=timestamp,
        Target=target,
        Version=version,
        EchoToken=echo_token
    )
    avail_status_messages_el = etree.SubElement(root, "AvailStatusMessages", HotelCode=hotel_code)

    for msg in avail_status_messages:
        attrs = {}
        if msg.get("BookingLimit") is not None:
            attrs["BookingLimit"] = str(msg["BookingLimit"])
            attrs["BookingLimitMessageType"] = "SetLimit"
        avail_status_msg_el = etree.SubElement(avail_status_messages_el, "AvailStatusMessage", **attrs)

        # StatusApplicationControl
        sac = msg.get("StatusApplicationControl")
        if sac:
            sac_attrs = {k: str(v).lower() if isinstance(v, bool) else str(v) for k, v in sac.items() if v is not None}
            etree.SubElement(avail_status_msg_el, "StatusApplicationControl", **sac_attrs)
        else:
            # Flat fields
            sac_attrs = {}
            for k in ["Start", "End", "InvCode", "RatePlanCode", "Mon", "Tue", "Weds", "Thur", "Fri", "Sat", "Sun"]:
                if msg.get(k) is not None:
                    val = msg[k]
                    if isinstance(val, bool):
                        val = str(val).lower()
                    sac_attrs[k] = str(val)
            if sac_attrs:
                etree.SubElement(avail_status_msg_el, "StatusApplicationControl", **sac_attrs)

        # LengthsOfStay
        if msg.get("LengthsOfStay"):
            lengths_el = etree.SubElement(avail_status_msg_el, "LengthsOfStay")
            for los in msg["LengthsOfStay"]:
                los_attrs = {k: str(v) for k, v in los.items() if k != "LOS_Pattern" and v is not None}
                los_el = etree.SubElement(lengths_el, "LengthOfStay", **los_attrs)
                if los.get("LOS_Pattern"):
                    etree.SubElement(los_el, "LOS_Pattern", FullPatternLOS=los["LOS_Pattern"])

        # RestrictionStatus
        if msg.get("RestrictionStatus"):
            rs = msg["RestrictionStatus"]
            rs_attrs = {k: str(v) for k, v in rs.items() if v is not None}
            etree.SubElement(avail_status_msg_el, "RestrictionStatus", **rs_attrs)

    return etree.tostring(root, pretty_print=True, encoding="utf-8", xml_declaration=True).decode("utf-8") 