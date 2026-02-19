import json
import logging
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class RoomManager:
    """Manages WebSocket connections organized by room."""

    def __init__(self):
        # room_id -> set of connected WebSocket clients
        self._rooms: dict[str, set[WebSocket]] = {}

    async def join_room(self, room_id: str, websocket: WebSocket) -> int:
        """Add a client to a room. Returns the new user count."""
        if room_id not in self._rooms:
            self._rooms[room_id] = set()
        self._rooms[room_id].add(websocket)
        count = len(self._rooms[room_id])
        logger.info(f"User joined room {room_id}. Users: {count}")
        return count

    async def leave_room(self, room_id: str, websocket: WebSocket) -> int:
        """Remove a client from a room. Returns the new user count."""
        if room_id in self._rooms:
            self._rooms[room_id].discard(websocket)
            count = len(self._rooms[room_id])
            if count == 0:
                del self._rooms[room_id]
                logger.info(f"Room {room_id} is now empty, removed.")
                return 0
            logger.info(f"User left room {room_id}. Users: {count}")
            return count
        return 0

    async def broadcast(
        self, room_id: str, message: dict, exclude: WebSocket | None = None
    ):
        """Broadcast a message to all clients in a room except the sender."""
        if room_id not in self._rooms:
            return
        data = json.dumps(message)
        disconnected = set()
        for ws in self._rooms[room_id]:
            if ws == exclude:
                continue
            try:
                await ws.send_text(data)
            except Exception:
                disconnected.add(ws)
        # Clean up any broken connections
        for ws in disconnected:
            self._rooms[room_id].discard(ws)

    def get_user_count(self, room_id: str) -> int:
        """Get the number of connected users in a room."""
        return len(self._rooms.get(room_id, set()))


# Global singleton
room_manager = RoomManager()
