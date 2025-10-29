# Definindo um protótipo de dados para o frontend consumir.

# Este protótipo é focado na visão de um(a) "Resgatista" ou "Voluntário(a)" logado(a).
dados_home_resgate = {
    "usuario": {
        "id_usuario": 101,
        "nome": "Carlos Silva",
        "avatar_url": "https://i.pravatar.cc/150?img=68", # Usando um placeholder
        "tipo_perfil": "Resgatista Verificado", # Cidadão, Voluntário, Resgatista, ONG
        "pontos_gamificacao": 1250,
        "nivel": "Protetor Sênior"
    },
    "secoes": [
        {
            "id_secao": "chamados_urgentes",
            "titulo": "Chamados Urgentes Próximos a Você",
            "tipo_visualizacao": "lista_mapa", # OBS: implementar mapa para visualização no frontend
            "itens": [
                {
                    "id_caso": "C-2025-1025",
                    "titulo": "Cachorro atropelado",
                    "especie": "Cachorro",
                    "prioridade": "alta",
                    "distancia_km": 1.2,
                    "status": "aguardando_resgate",
                    "localizacao_aprox": "Próximo à Av. Paulista, 1500",
                    "imagem_url": "https://placeimg.com/640/480/animals?1", # Placeholder
                    "timestamp_abertura": "2025-10-29T14:30:00Z" # ISO 8601
                },
                {
                    "id_caso": "C-2025-1024",
                    "titulo": "Gato preso em bueiro",
                    "especie": "Gato",
                    "prioridade": "media",
                    "distancia_km": 2.5,
                    "status": "necessita_voluntario",
                    "localizacao_aprox": "Rua Augusta, 900",
                    "imagem_url": "https://placeimg.com/640/480/animals?2", # Placeholder
                    "timestamp_abertura": "2025-10-29T13:15:00Z"
                }
            ]
        },
        {
            "id_secao": "meus_resgates",
            "titulo": "Seus Resgates em Andamento",
            "tipo_visualizacao": "carrossel", # Similar ao "Continue de Onde Parou"
            "itens": [
                {
                    "id_caso": "C-2025-1020",
                    "titulo": "Ninhada abandonada (5 filhotes)",
                    "especie": "Gato",
                    "status": "em_transporte_para_ong",
                    "progresso_percentual": 75, # Para uma barra de progresso
                    "proxima_acao": "Confirmar chegada na ONG 'Patas Felizes'",
                    "imagem_url": "https://placeimg.com/640/480/animals?3", # Placeholder
                    "id_ong_destino": 42
                },
                {
                    "id_caso": "C-2025-1018",
                    "titulo": "Cavalo desnutrido",
                    "especie": "Equino",
                    "status": "aguardando_transporte_especial",
                    "progresso_percentual": 40,
                    "proxima_acao": "Aguardar agendamento do reboque",
                    "imagem_url": "https://placeimg.com/640/480/animals?4", # Placeholder
                    "id_ong_destino": 15
                }
            ]
        },
        {
            "id_secao": "comunidade_destaque",
            "titulo": "Heróis da Semana",
            "tipo_visualizacao": "avatar_lista_horizontal", # OBS: implementar lista de avatares no frontend
            "itens": [
                {
                    "id_usuario": 102,
                    "nome": "Ana Souza",
                    "avatar_url": "https://i.pravatar.cc/150?img=45",
                    "descricao": "Top Resgatista (12 resgates)"
                },
                {
                    "id_usuario": 205, # Pode ser um ID de ONG
                    "nome": "ONG Patas Felizes",
                    "avatar_url": "https://placeimg.com/150/150/arch?1", # Placeholder de logo
                    "descricao": "Top Acolhimento (30 animais)"
                },
                {
                    "id_usuario": 58,
                    "nome": "Bruno Martins",
                    "avatar_url": "https://i.pravatar.cc/150?img=12",
                    "descricao": "Top Voluntário de Transporte"
                }
            ]
        },
        {
            "id_secao": "feed_atualizacoes",
            "titulo": "Últimas Atualizações da Rede",
            "tipo_visualizacao": "lista_feed", # Um feed simples de notícias
            "itens": [
                {
                    "id_atualizacao": "F-501",
                    "tipo": "sucesso", # 'sucesso', 'novo_caso', 'alerta'
                    "titulo": "Final Feliz: 'Trovão' foi adotado!",
                    "descricao": "O cachorro resgatado semana passada na Vila Madalena encontrou um novo lar. Obrigado a todos os envolvidos!",
                    "imagem_url": "https://placeimg.com/640/480/animals?5", # Placeholder
                    "timestamp": "2025-10-29T14:00:00Z"
                },
                {
                    "id_atualizacao": "F-500",
                    "tipo": "alerta",
                    "titulo": "Alerta: Feira de Adoção CANCELADA",
                    "descricao": "A feira de adoção da ONG 'Amor Animal' deste sábado foi cancelada devido à chuva. Nova data será informada.",
                    "imagem_url": "",
                    "timestamp": "2025-10-29T11:05:00Z"
                }
            ]
        }
    ]
}