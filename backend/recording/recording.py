from livekit import api
import os
from dotenv import load_dotenv

load_dotenv(override=True)

# livekit secrets
LIVEKIT_EGRESS_URL = os.getenv("LIVEKIT_EGRESS_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

async def start_audio_recording(room_name: str):
    client = api.LiveKitAPI(url=LIVEKIT_EGRESS_URL,api_key=LIVEKIT_API_KEY,api_secret=LIVEKIT_API_SECRET)

    try:

        output_path = f"/out/{room_name}.ogg"
        # Record the audio of the room
        req = api.RoomCompositeEgressRequest(
            room_name=room_name,
            audio_only=True,
            file_outputs=[api.EncodedFileOutput(
                file_type=api.EncodedFileType.OGG,
                filepath=output_path
                )]
        )
        
        result = await client.egress.start_room_composite_egress(req)

        return {
            "room_name": room_name,
            "output_path": output_path,
            "engess_id": result.egress_id
        }

    except Exception as e:
        print(f"Error starting audio recording: {e}")
        return None