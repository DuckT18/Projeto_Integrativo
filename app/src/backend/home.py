from prototipo_dados import dados_home # Importando os dados para utilizar no prototipo de logica da tela home
import json

def obter_dados_tela_home(id_usuario: int):
    """
    Função que simula a busca e a montagem dos dados para a tela inicial.
    
    OBS: ainda falta implementar a lógica dessa página com o banco de dados
    """
    
    nome_usuario = dados_home["usuario"]["nome"]
    mensagem_boas_vindas = f"Olá, {nome_usuario}! Pronto(a) para ser produtivo(a) hoje?"

    tarefas = []
    
    for secao in dados_home["secoes"]:
        if secao["id_secao"] == "tarefas":
            tarefas = secao["itens"]
            break
    
    
    tarefas_pendentes = sum(1 for tarefa in tarefas if not tarefa["concluida"])
    
    if tarefas_pendentes > 0:
        resumo_dia = f"Você tem {tarefas_pendentes} tarefa(s) pendente(s)."
    else:
        resumo_dia = "Você completou todas as suas tarefas. Parabéns!"

    resultado_final = {
        "mensagem_header": mensagem_boas_vindas,
        "resumo_dia": resumo_dia,
        "conteudo_tela": dados_home # Os dados originais para as seções
    }

    return resultado_final

if __name__ == "__main__":
   
    dados_para_tela = obter_dados_tela_home(id_usuario=123)

    print(json.dumps(dados_para_tela, indent=2, ensure_ascii=False))