from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus
import os
from sqlalchemy.orm import declarative_base
import dotenv

# --- LÓGICA DE CONEXÃO HÍBRIDA ---

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

load_dotenv()

if not SQLALCHEMY_DATABASE_URL:
    print("DATABASE_URL não encontrada. Usando configuração LOCAL.")
    
    DB_USER = "root"
    DB_PASSWORD = "s" 
    DB_HOST = "127.0.0.1"
    DB_PORT = "3306"
    DB_NAME = "PIDB"
    
    # Codifica a senha para evitar erros com caracteres especiais
    encoded_password = quote_plus(DB_PASSWORD)
    
    # Monta a URL local
    SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Cria o motor de conexão
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
except Exception as e:
    print(f"Erro ao configurar conexão com o banco: {e}")
    raise e

# Cria a fábrica de sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência para injetar no FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
