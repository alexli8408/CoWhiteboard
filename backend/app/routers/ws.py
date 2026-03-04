import json
import time
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.room_manager import room_manager
from app.supabase_client import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()

# Track last snapshot time per room to auto-save periodically
_last_snapshot: dict[str, float] = {}
SNAPSHOT_INTERVAL = 30  # seconds

# Track rooms we've already ensured exist in Supabase
_ensured_rooms: set[str] = set()


async def _ensure_room_exists(room_id: str):
    """Ensure the room exists in the Supabase rooms table (auto-create if not)."""
    if room_id in _ensured_rooms:
        return
    try:
        supabase = get_supabase()
        supabase.table("rooms").upsert(
            {"id": room_id, "name": "Untitled Board"},
            on_conflict="id",
        ).execute()
        _ensured_rooms.add(room_id)
        logger.info(f"Ensured room {room_id} exists in database")
    except Exception as e:
        logger.error(f"Failed to ensure room exists {room_id}: {e}")


async def _save_snapshot_to_db(room_id: str, data: dict):
    """Save a snapshot to Supabase."""
    try:
        supabase = get_supabase()
        supabase.table("snapshots").insert(
            {"room_id": room_id, "data": data}
        ).execute()
        _last_snapshot[room_id] = time.time()
        logger.info(f"Saved snapshot for room {room_id}")
    except Exception as e:
        logger.error(f"Failed to save snapshot for room {room_id}: {e}")


async def _maybe_save_snapshot(room_id: str, data: dict):
    """Save a snapshot if enough time has passed since the last one."""
    now = time.time()
    last = _last_snapshot.get(room_id, 0)
    if now - last >= SNAPSHOT_INTERVAL:
        await _save_snapshot_to_db(room_id, data)


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket endpoint for real-time board collaboration."""
    await websocket.accept()
    logger.info(f"WebSocket connected for room {room_id}")

    # Join the room
    user_count = await room_manager.join_room(room_id, websocket)

    # Ensure room exists in Supabase (auto-create if needed)
    await _ensure_room_exists(room_id)

    # Send the latest snapshot to the new user
    # Prefer in-memory snapshot (always up-to-date), fall back to Supabase
    snapshot_data = room_manager.get_snapshot(room_id)
    if snapshot_data is None:
        try:
            supabase = get_supabase()
            result = (
                supabase.table("snapshots")
                .select("data")
                .eq("room_id", room_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            snapshot_data = result.data[0]["data"] if result.data else None
            # Cache it in memory for future joiners
            if snapshot_data:
                room_manager.set_snapshot(room_id, snapshot_data)
        except Exception as e:
            logger.error(f"Failed to load snapshot for room {room_id}: {e}")

    try:
        await websocket.send_text(
            json.dumps(
                {
                    "type": "init",
                    "snapshot": snapshot_data,
                    "userCount": user_count,
                }
            )
        )
    except Exception as e:
        logger.error(f"Failed to send init message for room {room_id}: {e}")

    # Broadcast updated user count to everyone in the room
    await room_manager.broadcast(
        room_id,
        {"type": "user_count", "count": user_count},
        exclude=websocket,
    )

    # Main message loop
    try:
        while True:
            raw = await websocket.receive_text()
            message = json.loads(raw)
            msg_type = message.get("type", "")

            if msg_type == "update":
                # Broadcast tldraw store diff to other users
                await room_manager.broadcast(room_id, message, exclude=websocket)
                # Always update in-memory snapshot
                if "data" in message:
                    room_manager.set_snapshot(room_id, message["data"])
                    # Periodically persist to Supabase
                    await _maybe_save_snapshot(room_id, message["data"])

            elif msg_type == "snapshot":
                # Client explicitly wants to save state
                if "data" in message:
                    room_manager.set_snapshot(room_id, message["data"])
                    await _save_snapshot_to_db(room_id, message["data"])

            elif msg_type == "cursor":
                # Broadcast cursor position
                await room_manager.broadcast(room_id, message, exclude=websocket)

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected from room {room_id}")
    except Exception as e:
        logger.error(f"WebSocket error in room {room_id}: {e}")
    finally:
        user_count = await room_manager.leave_room(room_id, websocket)
        # Save snapshot to Supabase when the last user leaves
        if user_count == 0:
            final_snapshot = room_manager.get_snapshot(room_id)
            if final_snapshot:
                await _save_snapshot_to_db(room_id, final_snapshot)
                room_manager.clear_snapshot(room_id)
        await room_manager.broadcast(
            room_id,
            {"type": "user_count", "count": user_count},
        )
