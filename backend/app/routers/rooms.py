import uuid
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.supabase_client import get_supabase
from app.room_manager import room_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/rooms", tags=["rooms"])


class CreateRoomRequest(BaseModel):
    name: str = "Untitled Board"


class RoomResponse(BaseModel):
    id: str
    name: str
    created_at: str | None = None
    user_count: int = 0


@router.post("", response_model=RoomResponse)
async def create_room(body: CreateRoomRequest):
    """Create a new whiteboard room."""
    room_id = str(uuid.uuid4())
    try:
        supabase = get_supabase()
        result = (
            supabase.table("rooms")
            .insert({"id": room_id, "name": body.name})
            .execute()
        )
        room = result.data[0]
        return RoomResponse(
            id=room["id"],
            name=room["name"],
            created_at=room.get("created_at"),
            user_count=0,
        )
    except Exception as e:
        logger.error(f"Failed to create room: {e}")
        raise HTTPException(status_code=500, detail="Failed to create room")


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str):
    """Get room info."""
    try:
        supabase = get_supabase()
        result = supabase.table("rooms").select("*").eq("id", room_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Room not found")
        room = result.data[0]
        return RoomResponse(
            id=room["id"],
            name=room["name"],
            created_at=room.get("created_at"),
            user_count=room_manager.get_user_count(room_id),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get room: {e}")
        raise HTTPException(status_code=500, detail="Failed to get room")


@router.get("/{room_id}/snapshot")
async def get_snapshot(room_id: str):
    """Get the latest board snapshot for a room."""
    try:
        supabase = get_supabase()
        result = (
            supabase.table("snapshots")
            .select("*")
            .eq("room_id", room_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not result.data:
            return {"data": None}
        return {"data": result.data[0]["data"]}
    except Exception as e:
        logger.error(f"Failed to get snapshot: {e}")
        raise HTTPException(status_code=500, detail="Failed to get snapshot")


@router.put("/{room_id}/snapshot")
async def save_snapshot(room_id: str, body: dict):
    """Save a board snapshot."""
    try:
        supabase = get_supabase()
        supabase.table("snapshots").insert(
            {"room_id": room_id, "data": body}
        ).execute()
        # Update room's updated_at timestamp
        supabase.table("rooms").update(
            {"updated_at": "now()"}
        ).eq("id", room_id).execute()
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Failed to save snapshot: {e}")
        raise HTTPException(status_code=500, detail="Failed to save snapshot")
