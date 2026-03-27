import json
import asyncio
from typing import Dict, List, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.utils.security import verify_token
from app.utils.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List of active WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Stores driver locations: user_id -> {lat: float, lon: float, role: str}
        self.driver_locations: Dict[int, Dict[str, Any]] = {}
        # Maps driver_id -> passenger_id for active trips
        self.matches: Dict[int, int] = {}

    async def connect(self, websocket: WebSocket, user_id: int, role: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} ({role}) connected to WebSocket")

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        if user_id in self.driver_locations:
            del self.driver_locations[user_id]
        
        # Remove match if driver disconnects
        if user_id in self.matches:
            del self.matches[user_id]
            
        logger.info(f"User {user_id} disconnected from WebSocket")

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {user_id}: {e}")

    async def broadcast_to_drivers(self, message: dict):
        for user_id, connections in self.active_connections.items():
            if user_id in self.driver_locations: # Only connected drivers
                for connection in connections:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting to {user_id}: {e}")

    def set_trip_match(self, driver_id: int, passenger_id: int):
        self.matches[driver_id] = passenger_id
        logger.info(f"Matched Driver {driver_id} with Passenger {passenger_id}")

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    try:
        # Validate token
        scheme = ""
        actual_token = token
        if " " in token:
            scheme, actual_token = token.split(" ", 1)
            
        payload = verify_token(actual_token)
        user_id = payload.get("user_id")
        role = payload.get("role", "Passenger")
        
        await manager.connect(websocket, user_id, role)
        
        # If driver, register them in driver_locations
        if role == "Driver":
            manager.driver_locations[user_id] = {"lat": 0, "lon": 0, "role": role}

        try:
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle incoming messages
                msg_type = message.get("type")
                if msg_type == "location_update" and role == "Driver":
                    lat, lon = message.get("lat"), message.get("lon")
                    heading = message.get("heading") or 0
                    
                    manager.driver_locations[user_id]["lat"] = lat
                    manager.driver_locations[user_id]["lon"] = lon
                    
                    # If this driver is matched with a passenger, notify them
                    if user_id in manager.matches:
                        passenger_id = manager.matches[user_id]
                        await manager.send_personal_message({
                            "type": "driver_location",
                            "data": {
                                "tripId": message.get("tripId"),
                                "lat": lat,
                                "lng": lon,
                                "heading": heading
                            }
                        }, passenger_id)
                
                elif msg_type == "register_match" and role == "Driver":
                    # Manually register a match from driver app
                    passenger_id = int(message.get("passengerId"))
                    manager.set_trip_match(user_id, passenger_id)

                # We can handle ping/pong here if needed
                if msg_type == "ping":
                    await websocket.send_json({"type": "pong"})
                    
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)
            
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
        await websocket.close(code=1008)

