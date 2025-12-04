from .prototipo_dados import dados_home_resgate # Importando os dados do protótipo
from typing import Dict, Any
from .database import schemas, security, models, database, crud
from fastapi import Depends
from sqlalchemy.orm import Session
from .database.database import get_db

#  Lógica Futura:
    # - Filtrar por geolocalização (Haversine formula)
    # - Montar a lista 'secoes' dinamicamente com base nesses objetos do banco.

def get_home_logic(
    current_user: models.User,
    db: Session = Depends(get_db)
    
    ) -> Dict[str, Any]:
    """
    Lógica de negócios para buscar os dados da home page.
    Esta função é chamada pelo endpoint em router.py.
    """
    casos = db.query(models.Casos).all()
    
    lista_urgente = []
    
    lista_alerta = []
    
    
    for caso in casos:
        
        tags_geradas = [] # inicializando a lista de tags vazia
        
        # gerando as tags com base na urgencia do caso, pois no banco
        # não possui a coluna tag por ser algo do json
        if caso.urgencia == "Alta":
            tags_geradas.append({"texto": "Urgente", "tipo": "urgente"})
        elif caso.urgencia == "Media":
            tags_geradas.append({"texto": "Alerta", "tipo": "alerta"})
        
        # append na lista vazia  
        tags_geradas.append({"texto": caso.status, "tipo": "info"})

        # montando o json dos itens, fica dentro da seção itens: [] do json
        item_json = {
            "id_caso": caso.id,
            "titulo": caso.titulo,
            "imagem_url": caso.imagem_url or "https://placehold.co/400x300?text=Sem+Foto",
            "descricao": caso.descricao,
            "lat": float(caso.lat),
            "lng": float(caso.lng),
            "tags": tags_geradas,
            "status": caso.status,
            "urgencia": caso.urgencia
        }
    
        if item_json["urgencia"] == "Alta":
            lista_urgente.append(item_json)
        else:
            lista_alerta.append(item_json)
    
    # montando o json final para enviar para o endpoint /api/v1/home
    json = {
        "usuario": {
            "id_usuario": current_user.id,
            "nome": current_user.nome or current_user.username,
            "avatar_url": current_user.avatar_url,
            "tipo_perfil": current_user.tipo_perfil
        },
        "secoes": [
            {
                "id_secao": "casos_urgentes",
                "titulo": "Casos Urgentes",
                "icone": "triangle-alert",
                "tipo_visualizacao": "carrossel",
                "itens": lista_urgente 
            },
            {
                "id_secao": "casos_proximos",
                "titulo": "Casos Recentes",
                "icone": "target",
                "tipo_visualizacao": "lista_mapa",
                "itens": lista_alerta 
            }
        ]
    }
                
    return json
    
     
    """
    # 1. Fazemos uma cópia profunda (ou recriação) dos dados para não alterar o original em memória
    #    Isso é importante se formos modificar listas/dicionários internos
    dados_formatados = casos.copy()
    
    # 2. Injetar dados do Usuário Real (Logado)
    # Tenta pegar 'full_name', se for None usa 'username', se ambos falharem usa "Usuário"
    nome_usuario = getattr(current_user, 'full_name', None) or current_user.username or "Usuário"
    
    # Atualiza o objeto de usuário na resposta
    # Nota: Aqui buscaremos a foto de perfil do usuário
    dados_formatados["usuario"] = {
        "id_usuario": current_user.id,
        "nome": nome_usuario,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url, # Placeholder ou URL do BD
        "tipo_perfil": current_user.tipo_perfil # Placeholder ou lógica baseada em user.role
    }
    
    
    
    return dados_formatados
    
    """
    