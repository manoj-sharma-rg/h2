"""
Mapping loader and validator for PMS to RGBridge mappings
"""

import os
import yaml
from typing import Dict, Any
from app.core.config import settings

class MappingLoader:
    """
    Loads and validates PMS mapping YAML files
    """
    def __init__(self, mapping_dir: str = None):
        self.mapping_dir = mapping_dir or settings.MAPPING_DIR

    def get_mapping_path(self, pms_code: str) -> str:
        return os.path.join(self.mapping_dir, f"{pms_code}.yaml")

    def load_mapping(self, pms_code: str) -> Dict[str, Any]:
        path = self.get_mapping_path(pms_code)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Mapping file not found: {path}")
        with open(path, 'r', encoding='utf-8') as f:
            mapping = yaml.safe_load(f)
        self.validate_mapping(mapping)
        return mapping

    def validate_mapping(self, mapping: Dict[str, Any]) -> None:
        # Basic validation: must have 'availability' and/or 'rate' keys
        if not isinstance(mapping, dict):
            raise ValueError("Mapping file must be a dictionary at the top level.")
        if not ("availability" in mapping or "rate" in mapping):
            raise ValueError("Mapping file must contain at least 'availability' or 'rate' section.")
        # Optionally, add more validation rules here

# Singleton instance for use throughout the app
mapping_loader = MappingLoader() 