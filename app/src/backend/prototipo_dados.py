# Este é um exemplo de como os dados poderiam vir de um banco de dados ou API.
# Definindo um prototipo de dados so para utilizar no prototipo inicial

dados_home = {
    "usuario": {
        "nome": "Ana",
        "avatar_url": "https://exemplo.com/avatar/ana.png"
    },
    "secoes": [
        {
            "id_secao": "continue",
            "titulo": "Continue de Onde Parou",
            "tipo_visualizacao": "carrossel", # Dica para o frontend sobre como exibir
            "itens": [
                {
                    "id": 1,
                    "tipo": "curso",
                    "titulo": "FastAPI: O Guia Completo",
                    "progresso": 60 # em porcentagem
                },
                {
                    "id": 2,
                    "tipo": "artigo",
                    "titulo": "10 Dicas de Produtividade para Devs",
                    "progresso": 90
                },
                {
                    "id": 3,
                    "tipo": "curso",
                    "titulo": "Git e GitHub para Iniciantes",
                    "progresso": 25
                }
            ]
        },
        {
            "id_secao": "tarefas",
            "titulo": "Suas Tarefas para Hoje",
            "tipo_visualizacao": "lista",
            "itens": [
                {
                    "id": 101,
                    "titulo": "Revisar o Pull Request #56",
                    "concluida": False
                },
                {
                    "id": 102,
                    "titulo": "Participar da Daily Meeting",
                    "concluida": True
                },
                {
                    "id": 103,
                    "titulo": "Estudar capítulo 3 do livro de Python",
                    "concluida": False
                }
            ]
        },
        {
            "id_secao": "descubra",
            "titulo": "Descubra Algo Novo",
            "tipo_visualizacao": "grade", # Exibir em formato de grade de cartões
            "itens": [
                {
                    "id": 201,
                    "titulo": "Técnica Pomodoro",
                    "categoria": "Produtividade",
                    "imagem_url": "https://exemplo.com/imagens/pomodoro.png"
                },
                {
                    "id": 202,
                    "titulo": "Introdução ao Docker",
                    "categoria": "DevOps",
                    "imagem_url": "https://exemplo.com/imagens/docker.png"
                }
            ]
        }
    ]
}