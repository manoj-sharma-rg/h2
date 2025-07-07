"""
Plugin system for PMS translators
"""

from .base import BasePMSTranslator
from .registry import PluginRegistry

# Create global plugin registry
plugin_registry = PluginRegistry()

# Import all plugins to register them
# This will be expanded as plugins are added 
import importlib.util
import os

# Dynamically import all translators from pms/*/translator.py
pms_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../pms'))
if os.path.isdir(pms_root):
    for pms_name in os.listdir(pms_root):
        pms_dir = os.path.join(pms_root, pms_name)
        translator_path = os.path.join(pms_dir, 'translator.py')
        if os.path.isfile(translator_path):
            spec = importlib.util.spec_from_file_location(f"pms.{pms_name}.translator", translator_path)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module) 