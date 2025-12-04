from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import relationship
from sqlalchemy import Numeric
from datetime import datetime

# Esquema para criação de usuário (o que o cliente envia)
class UserCreate(BaseModel):
    nome: str
    avatar_url: str
    tipo_perfil: str
    email: EmailStr
    username: str
    password: str
    
    

# Esquema para resposta ao criar ou buscar um usuário (o que a API retorna)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str

    class Config:
        orm_mode = True # Permite que o Pydantic leia dados de objetos ORM

# Esquema para o token de acesso
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
    email: Optional[str] = None
    
class CasoBase(BaseModel):
    titulo: str
    localizacao: str
    descricao: str
    lat: float
    lng: float
    status: str
    urgencia: str
    imagem_url: Optional[str] = None

class CasoCreate(CasoBase):
    titulo: str
    localizacao: str
    descricao: str
    lat: float
    lng: float
    status: str
    urgencia: str
    imagem_url: Optional[str] = None

class CasoOut(CasoBase):
    id: int
    id_usuario: int
    
    class config:
        
        orm_mode = True

class MessageCreate(BaseModel):
    content: str
    receiver_id: int

class MessageOut(BaseModel):
    id: int
    content: str
    sender_id: int
    receiver_id: int
    timestamp: datetime
    is_read: bool
    
    class config:
        
        orm_mode = True
    
    
    
    