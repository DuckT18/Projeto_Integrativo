from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from .database import crud, models, schemas, security
from .database import engine, get_db
from .home import get_home_logic
from .database.security import get_current_active_user 


# Cria as tabelas definidas
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

@app.get("/api/v1/home")
async def read_home_data(
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Endpoint protegido que retorna os dados da home
    para o usuário logado.
    """
    home_data = get_home_data(user=current_user)
    return home_data

@app.get("/")
async def read_root_redirect():
    """
    Redireciona a raiz do site ("/") para a página de login.
    """
    return RedirectResponse(url="/login/login.html")

app.mount("/", StaticFiles(directory="frontend"), name="static")

