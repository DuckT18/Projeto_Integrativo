# 🐾 AMA

![Status do Projeto](https://img.shields.io/badge/status-Em_Desenvolvimento-orange)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1)

> **Plataforma centralizada e inteligente para o resgate de animais em risco.**

A **AMA** conecta cidadãos, ONGs, resgatistas e voluntários de forma eficiente. Diferente das redes sociais, oferecemos um banco de dados estruturado, geolocalização e gamificação para agilizar o socorro animal.

---

## ✨ Funcionalidades

-   **Autenticação Segura:** Login e Cadastro com JWT (JSON Web Tokens).
-   **Dashboard Personalizado:** Interface adaptada para voluntários e resgatistas.


### Funcionalidades Futuras

- **Geolocalização:** Visualização de chamados urgentes próximos ao usuário.
- **Gestão de Resgates:** Acompanhamento de status (em andamento, transporte, finalizado).
- **Gamificação:** Sistema de pontos e níveis para incentivar o engajamento da comunidade.
- **Feed de Atualizações:** Notícias sobre finais felizes e alertas da rede.

---

## 🛠️ Tecnologias Utilizadas

### Backend
-   **Python 3**
-   **FastAPI:** Framework web moderno e rápido.
-   **SQLAlchemy:** ORM para interação com o banco de dados.
-   **Pydantic:** Validação de dados.
-   **MySQL:** Banco de dados relacional.
-   **Uvicorn:** Servidor ASGI.

### Frontend
-   **HTML5 & JavaScript (Vanilla):** Estrutura leve e modular.
-   **Tailwind CSS:** Estilização moderna e responsiva via CDN.
-   **Lucide Icons:** Ícones vetoriais leves.

### Infra
- **Docker e Docker Compose**

---

## 📂 Estrutura do Projeto

```text
PI/
└── app/
    ├── Dockerfile             # Definição da Imagem do Backend
    ├── docker-compose.yml     # Orquestração dos serviços (App + Banco de Dados)
    └── src/                   # Código Fonte e Configurações
        ├── requirements.txt   # Lista de dependências do Python
        ├── README.md          # Documentação do projeto
        ├── backend/           # Lógica do Servidor (API)
        │   ├── database/      # Conexão (database.py), Models, CRUD, Schemas e Security
        │   ├── home.py        # Lógica de negócios da Home
        │   ├── router.py      # Ponto de entrada (App FastAPI)
        │   └── prototipo_dados.py
        │
        └── frontend/          # Interface do Usuário (Arquivos Estáticos)
            ├── home/          # Tela principal pós-login
            ├── login/         # Tela de login
            └── register/      # Tela de cadastro

## Como rodar o Projeto

### Pré-Requisitos

- Ter o python baixado em sua máquina
- Ter o docker desktop baixado em sua máquina
- Ter o MySql baixado em sua máquina
- Crie uma local instance do MySql em sua máquina para que o banco seja hospedado

### Instruções

- 1. Abra uma nova janela do vs code e digite git clone https://github.com/DuckT18/Projeto_Integrativo , ou pelo próprio site do gihub clique em code, clone with https, abra o vs code, clique em clone a repository e insira o link

-2. Dê um cd app e um cd src no terminal

-3. Digite docker-compose up -d (isso fará com que o container do projeto rode e caso seja a primeira vez ele irá baixar todas as dependências e subir o container)

-4. Abra seu navegador e acesse localhost:8080 para acessar a aplicação