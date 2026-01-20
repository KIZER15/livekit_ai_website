import json
import os
import logging

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "inbound_config.json")
logger = logging.getLogger(__name__)

def _load_config():
    if not os.path.exists(CONFIG_FILE):
        return {}
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading inbound config: {e}")
        return {}

def _save_config(config):
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        logger.error(f"Error saving inbound config: {e}")

# Get the mapped number
def get_agent_for_number(phone_number: str) -> str:
    config = _load_config()
    return config.get(phone_number)

# Set the mapped number to agent
def set_agent_for_number(phone_number: str, agent_type: str):
    config = _load_config()
    config[phone_number] = agent_type
    _save_config(config)
