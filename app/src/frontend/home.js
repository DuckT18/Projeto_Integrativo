document.addEventListener('DOMContentLoaded', () => {
    // URL do endpoint FastAPI que executa a sua lógica Python.
    // **Ajuste a porta e o endpoint conforme o seu FastAPI.**
    const API_URL = 'http://127.0.0.1:8000/login'; 

    const mensagemBoasVindas = document.getElementById('mensagemBoasVindas');
    const resumoDia = document.getElementById('resumoDia');
    const tarefasContainer = document.getElementById('tarefas-pendentes');

    /**
     * Função principal para buscar dados do backend e atualizar a tela.
     */
    async function carregarDadosHome() {
        try {
            // 1. Chamada à API (simulando a função Python)
            const response = await fetch(API_URL, {
                method: 'GET', // Método GET para buscar dados
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer <token_de_login>' // Adicionar token em um projeto real
                }
            });

            if (!response.ok) {
                // Se o status não for 200, lança um erro
                throw new Error(`Erro de rede: ${response.status} ${response.statusText}`);
            }

            // 2. Recebe e converte o JSON
            const dados = await response.json();
            
            // 3. Processa e exibe os dados (lógica de rendering)
            renderizarTelaHome(dados);

        } catch (error) {
            console.error('Erro ao buscar dados da tela Home:', error);
            mensagemBoasVindas.textContent = 'Erro ao carregar dados.';
            resumoDia.textContent = 'Verifique a conexão com o servidor FastAPI.';
            tarefasContainer.innerHTML = `<p style="color: red;">Falha na comunicação com o backend.</p>`;
        }
    }

    /**
     * Função para atualizar o DOM com os dados recebidos.
     * @param {object} dados - O objeto retornado pela função `obter_dados_tela_home` do Python.
     */
    function renderizarTelaHome(dados) {
        // Atualiza o Header
        mensagemBoasVindas.textContent = dados.mensagem_header;
        resumoDia.textContent = dados.resumo_dia;

        // Limpa o container de tarefas
        tarefasContainer.innerHTML = '<h3>Lista de Tarefas</h3>'; 
        
        const conteudoTela = dados.conteudo_tela;

        // 4. Renderiza a seção de Tarefas (Lógica de Estrutura de Dados/Visualização)
        if (conteudoTela && conteudoTela.secoes) {
            const secaoTarefas = conteudoTela.secoes.find(s => s.id_secao === "tarefas");

            if (secaoTarefas && secaoTarefas.itens.length > 0) {
                const ul = document.createElement('ul');
                
                secaoTarefas.itens.forEach(tarefa => {
                    const li = document.createElement('li');
                    li.textContent = `${tarefa.titulo}`;
                    
                    // Adiciona a classe visual de concluída
                    if (tarefa.concluida) {
                        li.style.textDecoration = 'line-through';
                        li.style.color = '#777';
                    } else {
                        li.style.fontWeight = 'bold';
                    }

                    ul.appendChild(li);
                });
                tarefasContainer.appendChild(ul);
            } else {
                tarefasContainer.innerHTML += `<p>Nenhuma tarefa encontrada.</p>`;
            }
        }
    }

    // Inicia o carregamento dos dados
    carregarDadosHome();
});
