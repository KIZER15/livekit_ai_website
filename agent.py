import logging
import asyncio

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    cli,
    inference,
    room_io,
    function_tool,
    RunContext,
    BackgroundAudioPlayer, # Added import
    AudioConfig,           # Added import
    BuiltinAudioClip       # Added import
)
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv()

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            # Updated instructions for a "Contact" / Customer Service persona
            instructions="""You are a polite and professional Contact Center Voice Agent. 
            You are here to help users schedule appointments, find contact details, and resolve support issues.
            Your responses should be warm, concise, and helpful.
            Do not use emojis or complex formatting.
            If you do not know an answer, politely offer to transfer them to a human supervisor.""",
        )

    @function_tool
    async def lookup_weather(self, context: RunContext, location: str):
        """Use this tool to look up current weather information."""
        logger.info(f"Looking up weather for {location}")
        await asyncio.sleep(5)
        return "sunny with a temperature of 70 degrees."

server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: JobContext):
    # Logging setup
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # --- Fix for Auto-Speaking/Sensitivity ---
    stricter_vad = silero.VAD.load(
        min_speech_duration=0.3, 
        activation_threshold=0.6
    )

    session = AgentSession(
        stt=inference.STT(model="assemblyai/universal-streaming", language="en"),
        llm=inference.LLM(model="openai/gpt-4.1-mini"),
        tts=inference.TTS(model="cartesia/sonic-3", voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"),
        
        turn_detection=MultilingualModel(),
        vad=stricter_vad,
        
        # --- CRITICAL FIX ---
        # Set this to False. If True, the agent tries to guess when you are done and starts talking immediately.
        preemptive_generation=True,
    )

    # --- Background Audio Setup ---
    # Creates an office ambience (or use a custom file path like "path/to/sound.mp3")
    background_audio = BackgroundAudioPlayer(
    ambient_sound=AudioConfig(BuiltinAudioClip.OFFICE_AMBIENCE, volume=1.0),
    thinking_sound=[
        AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING, volume=1.0),
        AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING2, volume=1.0),
        ],
    )
    await background_audio.start(room=ctx.room, agent_session=session)  

    # Start the session
    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                # Only use Echo Cancellation/Noise Suppression for SIP (Phone) callers
                # Standard web users usually have this built into the browser
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony()
                if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                else noise_cancellation.BVC(),
            ),
        ),
    )

    # # Start the background audio
    # try:
    #     await background_audio.start(room=ctx.room, agent_session=session)
    # except Exception as e:
    #     logger.error(f"Failed to start background audio: {e}")
        
    # --- INITIATING SPEECH (The Agent Speaks First) ---
    await session.say(
        "Hello, thank you for calling customer support. My name is Ava. How can I help you today?", 
        allow_interruptions=True
    )

    # Connect to the room
    await ctx.connect()

    # Clean up background audio when the agent disconnects
    # try:
    #     # Wait for the session to end (this keeps the agent alive)
    #     await ctx.wait_for_disconnect()
    # finally:
    #     await background_audio.aclose()

if __name__ == "__main__":
    cli.run_app(server)