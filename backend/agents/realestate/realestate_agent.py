from livekit.agents import (Agent)
import logging
from agents.realestate.realestate_agent_prompt import REALESTATE_PROMOPT, REALESTATE_PROMPT2
from agents.shared.tts_humanification_framework import TTS_HUMANIFICATION_FRAMEWORK

logger = logging.getLogger("agent")

class RealestateAgent(Agent):
    def __init__(self, room) -> None:
        super().__init__(
            # Instructions for the agent
            instructions=REALESTATE_PROMPT2 + TTS_HUMANIFICATION_FRAMEWORK,
        )
        self.room = room 

    @property
    def welcome_message(self):
        return ("<emotion value='content' />Hi, this is VYOM from House of Abhinandan Lodha. You had reached out earlier to ask about properties in Goa and investment options. I'm calling to help answer your questions. Good time to talk?")