# Este é um exemplo de como os dados poderiam vir do seu backend FastAPI.
# Definindo um protótipo de dados para o frontend consumir.

# A estrutura reflete o design Mobile-First e inclui coordenadas para o MAPA
dados_home_resgate = {
    "usuario": {
        "id_usuario": 101,
        "nome": "Arthur",
        "avatar_url": "https://i.pravatar.cc/150?img=12", # Avatar de exemplo
        "tipo_perfil": "Voluntário",
    },
    "secoes": [
        {
            "id_secao": "casos_urgentes",
            "titulo": "Casos Urgentes",
            "icone": "triangle-alert",
            "tipo_visualizacao": "carrossel", # Horizontal
            "itens": [
                {
                    "id_caso": "C-100",
                    "titulo": "Gatinho Preso em Árvore",
                    "imagem_url": "https://loremflickr.com/400/300/kitten?lock=1",
                    "localizacao": "Praça da República, SP",
                    # Coordenadas reais de SP para teste
                    "lat": -23.5431,
                    "lng": -46.6420,
                    "tags": [
                        {"texto": "Urgente", "tipo": "urgente"},
                        {"texto": "Filhote", "tipo": "info"}
                    ],
                    "is_favorito": False
                },
                {
                    "id_caso": "C-101",
                    "titulo": "Cão Desidratado",
                    "imagem_url": "https://loremflickr.com/400/300/dog?lock=10",
                    "localizacao": "Av. Rebouças, Pinheiros",
                    "lat": -23.5658,
                    "lng": -46.6853,
                    "tags": [
                        {"texto": "Urgente", "tipo": "urgente"},
                        {"texto": "Cão", "tipo": "info"}
                    ],
                    "is_favorito": True
                },
                {
                    "id_caso": "C-102",
                    "titulo": "Atropelamento",
                    "imagem_url": "https://loremflickr.com/400/300/dog?lock=20",
                    "localizacao": "Rod. Anchieta, Km 10",
                    "lat": -23.6489,
                    "lng": -46.5744,
                    "tags": [
                        {"texto": "Muito Urgente", "tipo": "urgente"},
                        {"texto": "Ferido", "tipo": "alerta"}
                    ],
                    "is_favorito": False
                }
            ]
        },
        {
            "id_secao": "casos_proximos",
            "titulo": "Casos Próximos",
            "icone": "target",
            "tipo_visualizacao": "lista_mapa", # Vertical
            "itens": [
                {
                    "id_caso": "C-200",
                    "titulo": "Ninhada de Gatos",
                    "imagem_url": "https://loremflickr.com/400/300/cat?lock=33",
                    "descricao": "Gata com filhotes embaixo de carro.",
                    "distancia_km": 0.2,
                    "lat": -23.5505,
                    "lng": -46.6333,
                    "tags": [
                        {"texto": "Família", "tipo": "info"},
                        {"texto": "Gato", "tipo": "info"}
                    ],
                    "is_favorito": True
                },
                {
                    "id_caso": "C-201",
                    "titulo": "Pitbull Perdido",
                    "imagem_url": "https://loremflickr.com/400/300/pitbull?lock=42",
                    "descricao": "Encontrado vagando perto da padaria. Parece bem cuidado.",
                    "distancia_km": 0.8,
                    "lat": -23.5874,
                    "lng": -46.6576,
                    "tags": [
                        {"texto": "Cão", "tipo": "info"},
                        {"texto": "Perdido", "tipo": "alerta"}
                    ],
                    "is_favorito": False
                },
                {
                    "id_caso": "C-202",
                    "titulo": "Papagaio fugitivo",
                    "imagem_url": "https://loremflickr.com/400/300/parrot?lock=50",
                    "descricao": "Pousou no quintal da vizinha e não quer sair.",
                    "distancia_km": 1.5,
                    "lat": -23.5615,
                    "lng": -46.6559,
                    "tags": [
                        {"texto": "Ave", "tipo": "info"},
                        {"texto": "Silvestre", "tipo": "info"}
                    ],
                    "is_favorito": False
                }
            ]
        }
    ]
}