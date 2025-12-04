from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Dict, Any
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from .database import crud, models, schemas, security
from .database import engine, get_db
from .home import get_home_logic 
from .database.security import get_current_active_user, get_current_user_ws
from pathlib import Path
from .connection_manager import manager
import json

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint para registrar um novo usuário.
    """
    db_user_email = crud.get_user_by_email(db, email=user.email)
    if db_user_email:
        raise HTTPException(status_code=400, detail="E-mail já registrado")
    
    db_user_username = crud.get_user_by_username(db, username=user.username)
    if db_user_username:
        raise HTTPException(status_code=400, detail="Nome de usuário já existe")
        
    new_user = crud.create_user(db=db, user=user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Endpoint para login. Retorna um token JWT.
    """
    user = crud.get_user_by_email(db, email=form_data.username)
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# esse endpoint recebe o json montado da função get_home_logic dentro do home
@app.get("/api/v1/home")
async def read_home_data(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Endpoint protegido que retorna os dados da home
    para o usuário logado.
    """

    home_data = get_home_logic(current_user=current_user, db=db)
    return home_data

@app.get("/")
async def read_root_redirect():
    """
    Redireciona a raiz do site ("/") para a página de login.
    """
    return RedirectResponse(url="/login/login.html")


@app.post("/v1/casos", response_model=schemas.CasoOut)
def create_casos_endpoint(
    caso: schemas.CasoCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Endpoint para a implementação da lógica de criação dos casos.
    """
    
    novo_caso = crud.create_caso(db=db, caso=caso, user_id=current_user.id)
    
    return novo_caso
    

@app.websocket("/v1/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    db: Session = Depends(get_db),
    # Essa dependência valida o token antes de aceitar a conexão
    current_user: models.User = Depends(get_current_user_ws) 
):
    # 1. Aceitar Conexão
    # O user_id vem do token validado, não da URL (segurança)
    await manager.connect(websocket, current_user.id)
    
    try:
        while True:
            # 2. Receber dados (Espera um JSON string)
            data = await websocket.receive_text()
            
            # 3. Parsear o JSON
            try:
                data_dict = json.loads(data)
                receiver_id = int(data_dict.get("receiver_id"))
                content = data_dict.get("content")
            except (ValueError, TypeError):
                # Se o JSON for inválido, ignora e continua
                continue

            # 4. Salvar no Banco de Dados
            # Criamos o schema manualmente para passar pro CRUD
            message_schema = schemas.MessageCreate(
                content=content,
                receiver_id=receiver_id
            )
            
            # Chama o CRUD para persistir
            # (Nota: Em produção, idealmente isso seria async ou rodaria em threadpool)
            nova_mensagem = crud.create_message(
                db=db, 
                message=message_schema, 
                sender_id=current_user.id
            )

            # 5. Enviar em Tempo Real (Via Manager)
            # Envia apenas o texto ou um JSON formatado
            await manager.send_personal_message(
                message=content, 
                sender_id=current_user.id, # Quem mandou
                receiver_id=receiver_id    # Quem recebe
            )
            
    except WebSocketDisconnect:
        # 6. Lidar com Desconexão
        manager.disconnect(current_user.id)
        
        print(f"O usuário {current_user.id} está offline, mensagem salva no banco")
    
    
    
backend_dir = Path(__file__).resolve().parent

# Sobe um nível para 'src' e entra em 'frontend': .../src/frontend
frontend_path = backend_dir.parent / "frontend"

# Monta os arquivos estáticos usando o caminho absoluto
app.mount("/", StaticFiles(directory=str(frontend_path)), name="static")
