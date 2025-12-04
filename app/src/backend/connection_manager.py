from fastapi import WebSocket, FastAPI
from fastapi.responses import Response
from .database import schemas
from typing import Dict

class ConnectionManager:
    
    def __init__(self):
        self.active_connection: Dict[int, WebSocket]= {}
        
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connection[user_id] = websocket
        
    def disconnect(self, user_id: int):
        
        if user_id in self.active_connection:
            del self.active_connection[user_id]
        
    async def send_personal_message(self, message: str, receiver_id: int):
        if receiver_id in self.active_connection:
            connection = self.active_connection[receiver_id]
            
            await connection.send_text(message)
            
        else:
            
            print(f"Usuário {receiver_id} offline. Mensagem salva no banco.")
        
manager = ConnectionManager()
        