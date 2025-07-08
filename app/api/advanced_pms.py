"""
Advanced PMS Integration Endpoints
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request, Body
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import os
from app.core.logging import get_logger

router = APIRouter(prefix="/api/v1")

# Logger for this module
logger = get_logger("advanced_pms")

# Add this at the top, after imports
PMS_REGISTRY = {
    "cloudbeds": {"code": "cloudbeds", "name": "Cloudbeds", "status": "active", "description": "Sample PMS"}
}

# --- PMS Management ---
@router.get("/pms")
async def list_pms() -> List[Dict[str, Any]]:
    """List all PMS codes and their status"""
    logger.info(f"called list_pms")
    return list(PMS_REGISTRY.values())

@router.post("/pms")
async def register_pms(
    code: str = Form(...),
    name: str = Form(...),
    description: str = Form(""),
    combined_avail_rate: bool = Form(False)
) -> Dict[str, Any]:
    """Register a new PMS"""
    if code in PMS_REGISTRY:
        raise HTTPException(status_code=400, detail="PMS code already exists")
    PMS_REGISTRY[code] = {
        "code": code,
        "name": name,
        "status": "active",
        "description": description,
        "combined_avail_rate": combined_avail_rate
    }
    logger.info(f"PMS '{code}' registered")
    return {"message": f"PMS '{code}' registered", "code": code, "name": name, "description": description, "combined_avail_rate": combined_avail_rate}

@router.put("/pms/{pms_code}")
async def update_pms(
    pms_code: str,
    name: str = Form(...),
    description: str = Form(""),
    combined_avail_rate: bool = Form(False)
) -> Dict[str, Any]:
    """Update PMS name and description"""
    logger.info(f"called update_pms put")
    if pms_code not in PMS_REGISTRY:
        raise HTTPException(status_code=404, detail="PMS not found")
    PMS_REGISTRY[pms_code]["name"] = name
    PMS_REGISTRY[pms_code]["description"] = description
    PMS_REGISTRY[pms_code]["combined_avail_rate"] = combined_avail_rate
    return {"message": f"PMS '{pms_code}' updated", "code": pms_code, "name": name, "description": description, "combined_avail_rate": combined_avail_rate}

@router.delete("/pms/{pms_code}")
async def delete_pms(pms_code: str) -> Dict[str, Any]:
    """Remove a PMS"""
    logger.info(f"called delete_pms")
    if pms_code not in PMS_REGISTRY:
        raise HTTPException(status_code=404, detail="PMS not found")
    del PMS_REGISTRY[pms_code]
    return {"message": f"PMS '{pms_code}' deleted"}

# --- Mapping Management ---
@router.get("/mappings/{pms_code}")
async def get_mapping(pms_code: str) -> Any:
    """Get mapping file for a PMS"""
    logger.info(f"called get_mapping")
    mapping_path = os.path.join("pms", pms_code, "mapping.yaml")
    if not os.path.exists(mapping_path):
        logger.warning(f"Mapping not found for PMS: {pms_code}")
        raise HTTPException(status_code=404, detail="Mapping not found")
    with open(mapping_path, "r", encoding="utf-8") as f:
        logger.info(f"Fetched mapping for PMS: {pms_code}")
        return JSONResponse(content={"mapping": f.read()})

@router.post("/mappings/{pms_code}")
async def upload_mapping(pms_code: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload or update mapping file"""
    logger.info(f"called upload_mapping")
    pms_dir = os.path.join("pms", pms_code)
    os.makedirs(pms_dir, exist_ok=True)
    mapping_path = os.path.join(pms_dir, "mapping.yaml")
    content = await file.read()
    with open(mapping_path, "wb") as f:
        f.write(content)
    logger.info(f"Uploaded mapping for PMS: {pms_code}")
    return {"message": f"Mapping for '{pms_code}' uploaded"}

@router.post("/mappings/{pms_code}/validate")
async def validate_mapping(pms_code: str, request: Request) -> Dict[str, Any]:
    """Validate mapping file"""
    logger.info(f"called validate_mapping")
    data = await request.body()
    import yaml
    try:
        yaml.safe_load(data)
        logger.info(f"Validated mapping for PMS: {pms_code}")
        return {"valid": True}
    except Exception as e:
        logger.error(f"Validation failed for PMS: {pms_code}: {e}")
        return {"valid": False, "error": str(e)}

@router.get("/mappings")
async def list_mappings() -> Any:
    """List all mapping files (without .yaml extension)"""
    logger.info(f"called list_mappings")
    pms_root = "pms"
    mapping_codes = []
    if os.path.isdir(pms_root):
        for pms_code in os.listdir(pms_root):
            mapping_path = os.path.join(pms_root, pms_code, "mapping.yaml")
            if os.path.isfile(mapping_path):
                mapping_codes.append(pms_code)
    logger.info(f"Listed all PMS mappings: {mapping_codes}")
    return {"mappings": mapping_codes}

@router.delete("/mappings/{pms_code}")
async def delete_mapping(pms_code: str) -> dict:
    """Delete a mapping file for a PMS"""
    logger.info(f"called delete_mapping")
    mapping_path = os.path.join("pms", pms_code, "mapping.yaml")
    if not os.path.exists(mapping_path):
        logger.warning(f"Mapping not found for PMS (delete): {pms_code}")
        raise HTTPException(status_code=404, detail="Mapping not found")
    os.remove(mapping_path)
    logger.info(f"Deleted mapping for PMS: {pms_code}")
    return {"message": f"Mapping for '{pms_code}' deleted"}

# --- Schema Management ---
@router.post("/schemas/{pms_code}")
async def upload_schema(pms_code: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload PMS schema (JSON Schema/XSD)"""
    logger.info(f"called upload_schema")
    schema_path = os.path.join("schemas", f"{pms_code}_{file.filename}")
    content = await file.read()
    with open(schema_path, "wb") as f:
        f.write(content)
    return {"message": f"Schema for '{pms_code}' uploaded as {file.filename}"}

@router.get("/schemas/{pms_code}")
async def get_schema(pms_code: str) -> Any:
    """Get PMS schema file"""
    logger.info(f"called get_schema")
    # TODO: List all schemas for this PMS
    schema_dir = "schemas"
    files = [f for f in os.listdir(schema_dir) if f.startswith(f"{pms_code}_")]
    if not files:
        raise HTTPException(status_code=404, detail="Schema not found")
    # Return the first one for now
    with open(os.path.join(schema_dir, files[0]), "r", encoding="utf-8") as f:
        return JSONResponse(content={"schema": f.read(), "filename": files[0]})

@router.get("/schemas")
async def list_schemas() -> dict:
    """List all schema files in the schemas directory"""
    logger.info(f"called list_schemas")
    schema_dir = "schemas"
    files = [f for f in os.listdir(schema_dir) if os.path.isfile(os.path.join(schema_dir, f))]
    return {"schemas": files}

@router.delete("/schemas/{filename}")
async def delete_schema(filename: str) -> dict:
    """Delete a schema file by filename"""
    logger.info(f"called delete_schema")
    schema_path = os.path.join("schemas", filename)
    if not os.path.exists(schema_path):
        raise HTTPException(status_code=404, detail="Schema not found")
    os.remove(schema_path)
    return {"message": f"Schema '{filename}' deleted"}

# --- Translator Management ---
@router.get("/translators")
async def list_translators() -> List[Dict[str, Any]]:
    """List all registered translators"""
    logger.info(f"called list_translators")
    # TODO: List from plugin registry
    return [
        {"pms_code": "cloudbeds", "class": "CloudbedsPMSTranslator", "status": "active"},
        # ...
    ]

@router.post("/translators/{pms_code}")
async def register_translator(pms_code: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    """Register/upload new translator code (dynamic plugin loading)"""
    logger.info(f"called register_translator")
    pms_dir = os.path.join("pms", pms_code)
    os.makedirs(pms_dir, exist_ok=True)
    translator_path = os.path.join(pms_dir, "translator.py")
    content = await file.read()
    with open(translator_path, "wb") as f:
        f.write(content)
    logger.info(f"Uploaded translator for PMS: {pms_code}")
    return {"message": f"Translator for '{pms_code}' uploaded"}

# --- Test & Preview ---
@router.post("/translate/{pms_code}")
async def test_translation(pms_code: str, request: Request) -> Dict[str, Any]:
    """Test translation with sample PMS message, return RGBridge XML and validation result"""
    logger.info(f"called test_translation")
    data = await request.json()
    pms_config = PMS_REGISTRY.get(pms_code, {"combined_avail_rate": False})

    if pms_config.get("combined_avail_rate"):
        # Stub: split message into availability and rate
        avail_data = data.get("availability", {})
        rate_data = data.get("rate", {})
        # Stub: translate to RGBridge XML
        xml_avail = f"<xml><availability>{avail_data}</availability></xml>"
        xml_rate = f"<xml><rate>{rate_data}</rate></xml>"
        # Stub: validate XML (always True)
        return {
            "availability": {"translated": avail_data, "xml": xml_avail, "valid": True},
            "rate": {"translated": rate_data, "xml": xml_rate, "valid": True}
        }
    else:
        # Normal processing
        return {"translated": data, "xml": "<xml>...</xml>", "valid": True} 