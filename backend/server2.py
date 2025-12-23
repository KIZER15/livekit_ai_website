import os
import uuid
import logging
import asyncio
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from livekit import api as lk_api
from livekit.api import LiveKitAPI, ListRoomsRequest
from twilio.rest import Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(override=True)
app = FastAPI(title="LiveKit Token Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
client = Client(account_sid, auth_token)

async def get_rooms() -> list[str]:
    lkapi = LiveKitAPI()
    try:
        rooms = await lkapi.room.list_rooms(ListRoomsRequest())
        return [room.name for room in rooms.rooms]
    except Exception as e:
        logger.error(f"Error in get_rooms: {e}")
        return []
    finally:
        await lkapi.aclose()

@app.get("/api/getToken", response_class=PlainTextResponse)
async def get_token(name: str = Query("guest"), room: Optional[str] = Query(None)):
    # If no room is provided (Web Chat), create a fresh unique room
    if not room:
        room = "web-room-" + str(uuid.uuid4())[:8]
    
    logger.info(f"Issuing token for User: {name} in Room: {room}")

    try:
        token = (
            lk_api.AccessToken(os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET"))
            .with_identity(name)
            .with_name(name)
            .with_grants(lk_api.VideoGrants(room_join=True, room=room))
        )
        return token.to_jwt()
    except Exception as e:
        logger.error(f"Error generating JWT: {e}")
        return "Error generating token."

@app.get("/api/testCall/{to_phone_number}")
async def test_call(to_phone_number: str):
    try:
        from_number = "+16506435672" 
        logger.info(f"Generating call to {to_phone_number}")

        call = client.calls.create(
            to=to_phone_number,
            from_=from_number,
            url="https://handler.twilio.com/twiml/EHf0d0394ec95c850816dff5cd1163e446"
        )

        # Poll for the SIP room to appear
        room_name = None
        for _ in range(12): 
            await asyncio.sleep(1)
            rooms = await get_rooms()
            match = next((r for r in rooms if from_number in r), None)
            if match:
                room_name = match
                break
        
        return {
            "status": 0, 
            "data": call.sid, 
            "roomName": room_name, 
            "message": "Call initiated"
        }
    except Exception as e:
        logger.error(f"Error generating call: {e}")
        return {"status": -1, "message": str(e)}