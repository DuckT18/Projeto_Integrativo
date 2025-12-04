from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Numeric, TIMESTAMP
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    avatar_url = Column(String(2048), nullable=True)
    tipo_perfil = Column(String(255), nullable=False, default="Usuario")
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    casos = relationship("Casos", back_populates="dono_caso") 
    
class Casos(Base):
    __tablename__ = "casos"
    
    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey('users.id'))
    dono_caso = relationship("User", back_populates="casos")
    titulo = Column(String(255), nullable=False)
    descricao = Column(String(255), nullable=False)
    imagem_url = Column(String(2048), nullable=True, default=None)
    localizacao = Column(String(255), nullable=False)
    lat = Column(Numeric(9, 6), nullable=False)
    lng = Column(Numeric(9, 6), nullable=False)
    status = Column(String(20), nullable=False, default="Aberto")
    urgencia = Column(String(20), nullable=False, default="Baixa")
    
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey('users.id'))
    receiver_id = Column(Integer, ForeignKey('users.id'))
    content = Column(String(255), nullable=False)
    timestamp = Column(TIMESTAMP, nullable=False)
    is_read = Column(Boolean, nullable=False)