"""
Advanced PMS Integration Endpoints
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request, Body
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import os

router = APIRouter(prefix="/api/v1")

# Add this at the top, after imports
PMS_REGISTRY = {
    "cloudbeds": {"code": "cloudbeds", "name": "Cloudbeds", "status": "active", "description": "Sample PMS"}
}

# --- PMS Management ---
@router.get("/pms")
async def list_pms() -> List[Dict[str, Any]]:
    """List all PMS codes and their status"""
    return list(PMS_REGISTRY.values())

@router.post("/pms")
async def register_pms(
    code: str = Form(...),
    name: str = Form(...),
    description: str = Form("")
) -> Dict[str, Any]:
    """Register a new PMS"""
    if code in PMS_REGISTRY:
        raise HTTPException(status_code=400, detail="PMS code already exists")
    PMS_REGISTRY[code] = {
        "code": code,
        "name": name,
        "status": "active",
        "description": description
    }
    return {"message": f"PMS '{code}' registered", "code": code, "name": name, "description": description}

@router.put("/pms/{pms_code}")
async def update_pms(
    pms_code: str,
    name: str = Form(...),
    description: str = Form("")
) -> Dict[str, Any]:
    """Update PMS name and description"""
    if pms_code not in PMS_REGISTRY:
        raise HTTPException(status_code=404, detail="PMS not found")
    PMS_REGISTRY[pms_code]["name"] = name
    PMS_REGISTRY[pms_code]["description"] = description
    return {"message": f"PMS '{pms_code}' updated", "code": pms_code, "name": name, "description": description}

@router.delete("/pms/{pms_code}")
async def delete_pms(pms_code: str) -> Dict[str, Any]:
    """Remove a PMS"""
    if pms_code not in PMS_REGISTRY:
        raise HTTPException(status_code=404, detail="PMS not found")
    del PMS_REGISTRY[pms_code]
    return {"message": f"PMS '{pms_code}' deleted"}

# --- Mapping Management ---
@router.get("/mappings/{pms_code}")
async def get_mapping(pms_code: str) -> Any:
    """Get mapping file for a PMS"""
    mapping_path = os.path.join("mappings", f"{pms_code}.yaml")
    if not os.path.exists(mapping_path):
        raise HTTPException(status_code=404, detail="Mapping not found")
    with open(mapping_path, "r", encoding="utf-8") as f:
        return JSONResponse(content={"mapping": f.read()})

@router.post("/mappings/{pms_code}")
async def upload_mapping(pms_code: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload or update mapping file"""
    mapping_path = os.path.join("mappings", f"{pms_code}.yaml")
    content = await file.read()
    with open(mapping_path, "wb") as f:
        f.write(content)
    return {"message": f"Mapping for '{pms_code}' uploaded"}

@router.post("/mappings/{pms_code}/validate")
async def validate_mapping(pms_code: str, request: Request) -> Dict[str, Any]:
    """Validate mapping file"""
    data = await request.body()
    # TODO: Validate YAML structure and required fields
    # For now, just check if it's valid YAML
    import yaml
    try:
        yaml.safe_load(data)
        return {"valid": True}
    except Exception as e:
        return {"valid": False, "error": str(e)}

@router.get("/mappings")
async def list_mappings() -> Any:
    """List all mapping files (without .yaml extension)"""
    mapping_dir = "mappings"
    files = [f for f in os.listdir(mapping_dir) if f.endswith(".yaml")]
    mapping_codes = [os.path.splitext(f)[0] for f in files]
    return {"mappings": mapping_codes}

@router.delete("/mappings/{pms_code}")
async def delete_mapping(pms_code: str) -> dict:
    """Delete a mapping file for a PMS"""
    mapping_path = os.path.join("mappings", f"{pms_code}.yaml")
    if not os.path.exists(mapping_path):
        raise HTTPException(status_code=404, detail="Mapping not found")
    os.remove(mapping_path)
    return {"message": f"Mapping for '{pms_code}' deleted"}

# --- Schema Management ---
@router.post("/schemas/{pms_code}")
async def upload_schema(pms_code: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload PMS schema (JSON Schema/XSD)"""
    schema_path = os.path.join("schemas", f"{pms_code}_{file.filename}")
    content = await file.read()
    with open(schema_path, "wb") as f:
        f.write(content)
    return {"message": f"Schema for '{pms_code}' uploaded as {file.filename}"}

@router.get("/schemas/{pms_code}")
async def get_schema(pms_code: str) -> Any:
    """Get PMS schema file"""
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
    schema_dir = "schemas"
    files = [f for f in os.listdir(schema_dir) if os.path.isfile(os.path.join(schema_dir, f))]
    return {"schemas": files}

@router.delete("/schemas/{filename}")
async def delete_schema(filename: str) -> dict:
    """Delete a schema file by filename"""
    schema_path = os.path.join("schemas", filename)
    if not os.path.exists(schema_path):
        raise HTTPException(status_code=404, detail="Schema not found")
    os.remove(schema_path)
    return {"message": f"Schema '{filename}' deleted"}

# --- Translator Management ---
@router.get("/translators")
async def list_translators() -> List[Dict[str, Any]]:
    """List all registered translators"""
    # TODO: List from plugin registry
    return [
        {"pms_code": "cloudbeds", "class": "CloudbedsPMSTranslator", "status": "active"},
        # ...
    ]

@router.post("/translators/{pms_code}")
async def register_translator(pms_code: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    """Register/upload new translator code (dynamic plugin loading)"""
    # TODO: Save and dynamically load plugin code (advanced, security risk!)
    return {"message": f"Translator for '{pms_code}' uploaded (not yet active)"}

# --- Test & Preview ---
@router.post("/translate/{pms_code}")
async def test_translation(pms_code: str, request: Request) -> Dict[str, Any]:
    """Test translation with sample PMS message, return RGBridge XML and validation result"""
    data = await request.json()
    # TODO: Use actual translation logic
    # For now, just echo
    return {"translated": data, "xml": "<xml>...</xml>", "valid": True} 