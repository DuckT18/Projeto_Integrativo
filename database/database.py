from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Formato: "mysql+mysqlconnector://<usuário>:<senha>@<host>:<porta>/<banco_de_dados>"
# ATENÇÃO: INSERIR AQUI URL DO BANCO DE DADOS
DATABASE_URL = "mysql+mysqlconnector://root:sua_senha_aqui@localhost:3306/auth_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência para obter a sessão do banco de dados em cada request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()