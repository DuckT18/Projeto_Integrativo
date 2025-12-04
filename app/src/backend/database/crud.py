from sqlalchemy.orm import Session
from . import models, schemas, security

def get_user_by_email(db: Session, email: str):
    """Busca um usuário pelo seu e-mail."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """Busca um usuário pelo seu nome de usuário."""
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_id(db: Session, id: int):
    """Busca um usuário pelo seu id"""
    
    return db.query(models.User).filter(models.User.id).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Cria um novo usuário no banco de dados."""
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        nome=user.nome,
        avatar_url=user.avatar_url,
        tipo_perfil=user.tipo_perfil,
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
        
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_caso(db: Session, caso: schemas.CasoCreate, user_id: int):
    """Cria um novo caso no banco de dados"""
    db_caso = models.Casos(
        id_usuario=user_id,
        titulo=caso.titulo,
        descricao=caso.descricao,
        imagem_url=caso.imagem_url,
        localizacao=caso.localizacao,
        lat=caso.lat,
        lng=caso.lng,
        status=caso.status,
        urgencia=caso.urgencia
    )
    db.add(db_caso)
    db.commit()
    db.refresh(db_caso)
    return db_caso

def create_message(db: Session, message: schemas.MessageCreate, sender_id: int, receiver_id: int):
    """Guarda a mensagem no banco de dados"""
    
    db_message = models.Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=message.content,
        timestamp=message.timestamp,
        is_read=message.is_read
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
    