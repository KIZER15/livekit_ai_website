from livekit.agents import (Agent, 
                            function_tool,
                            RunContext)
import logging
import json
from agents.solarsquare_aget_prompt import SOLAR_SQUARE_AGENT_PROMPT

logger = logging.getLogger("agent")

class SolarsquareAgent(Agent):
    def __init__(self, room) -> None:
        super().__init__(
            # Instructions for the agent
            instructions=SOLAR_SQUARE_AGENT_PROMPT,
        )
        self.room = room 

