"""
Plugin system for PMS translators
"""

from .base import BasePMSTranslator
from .registry import PluginRegistry

# Create global plugin registry
plugin_registry = PluginRegistry()

# Import all plugins to register them
# This will be expanded as plugins are added 