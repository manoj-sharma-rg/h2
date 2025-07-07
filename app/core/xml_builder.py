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

    return etree.tostring(root, pretty_print=True, encoding="utf-8", xml_declaration=False).decode("utf-8")


def build_rate_amount_notif_xml(
    hotel_code: str,
    rate_amount_messages: List[Dict[str, Any]],
    timestamp: str = None,
    target: str = "Production",
    version: str = "1.0",
    echo_token: str = None
) -> str:
    """
    Build OTA_HotelRateAmountNotifRQ XML from data
    """
    if not timestamp:
        timestamp = datetime.utcnow().isoformat()
    if not echo_token:
        echo_token = str(int(datetime.utcnow().timestamp()))

    root = etree.Element(
        "OTA_HotelRateAmountNotifRQ",
        nsmap=NSMAP,
        TimeStamp=timestamp,
        Target=target,
        Version=version,
        EchoToken=echo_token
    )
    rate_amount_messages_el = etree.SubElement(root, "RateAmountMessages", HotelCode=hotel_code)

    for msg in rate_amount_messages:
        ram_el = etree.SubElement(rate_amount_messages_el, "RateAmountMessage")
        # StatusApplicationControl
        sac_attrs = {}
        for k in ["InvCode", "RatePlanCode", "Start", "End"]:
            if msg.get(k) is not None:
                sac_attrs[k] = str(msg[k])
        etree.SubElement(ram_el, "StatusApplicationControl", **sac_attrs)
        # Rates
        rates_el = etree.SubElement(ram_el, "Rates")
        rate_attrs = {}
        for k in ["CurrencyCode", "UnitMultiplier"]:
            if msg.get(k) is not None:
                rate_attrs[k] = str(msg[k])
        rate_el = etree.SubElement(rates_el, "Rate", **rate_attrs)
        # BaseByGuestAmts
        if msg.get("BaseByGuestAmts"):
            bbga_el = etree.SubElement(rate_el, "BaseByGuestAmts")
            for amt in msg["BaseByGuestAmts"]:
                etree.SubElement(bbga_el, "BaseByGuestAmt", **{k: str(v) for k, v in amt.items() if v is not None})
        # GuaranteePolicies
        if msg.get("GuaranteePolicies"):
            gp_el = etree.SubElement(rate_el, "GuaranteePolicies")
            for gp in msg["GuaranteePolicies"]:
                etree.SubElement(gp_el, "GuaranteePolicy", **{k: str(v) for k, v in gp.items() if v is not None})
        # CancelPolicies
        if msg.get("CancelPolicies"):
            cp_el = etree.SubElement(rate_el, "CancelPolicies")
            for cp in msg["CancelPolicies"]:
                cp_el2 = etree.SubElement(cp_el, "CancelPenalty", **{k: str(v).lower() if isinstance(v, bool) else str(v) for k, v in cp.items() if k not in ["Deadline", "AmountPercent", "PenaltyDescription"] and v is not None})
                if cp.get("Deadline"):
                    etree.SubElement(cp_el2, "Deadline", **{k: str(v) for k, v in cp["Deadline"].items() if v is not None})
                if cp.get("AmountPercent"):
                    etree.SubElement(cp_el2, "AmountPercent", **{k: str(v) for k, v in cp["AmountPercent"].items() if v is not None})
                if cp.get("PenaltyDescription"):
                    pd_el = etree.SubElement(cp_el2, "PenaltyDescription")
                    if cp["PenaltyDescription"].get("Text"):
                        etree.SubElement(pd_el, "Text").text = cp["PenaltyDescription"]["Text"]
        # MealsIncluded
        if msg.get("MealsIncluded"):
            etree.SubElement(rate_el, "MealsIncluded", **{k: str(v) for k, v in msg["MealsIncluded"].items() if v is not None})

    return etree.tostring(root, pretty_print=True, encoding="utf-8", xml_declaration=False).decode("utf-8") 