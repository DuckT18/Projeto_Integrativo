from pydantic import BaseModel, EmailStr
from typing import Optional

# Esquema para criação de usuário (o que o cliente envia)
class UserCreate(BaseModel):
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