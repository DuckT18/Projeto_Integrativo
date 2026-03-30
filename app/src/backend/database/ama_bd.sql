-- =====================================================
-- PROJETO AMA - Assistência e Mobilização Animal
-- Script de Criação do Banco de Dados
-- PostgreSQL 14
-- =====================================================

-- Criar o banco de dados
CREATE DATABASE ama_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TEMPLATE = template0;

-- Conectar ao banco recém-criado
\c ama_db;

-- =====================================================
-- CRIAÇÃO DAS TABELAS
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabela ESPECIES
CREATE TABLE ESPECIES (
    id_especie SERIAL PRIMARY KEY,
    nome_especie VARCHAR(30) NOT NULL UNIQUE,
    descricao TEXT
);

-- 2. Tabela USUARIOS
CREATE TABLE USUARIOS (
    id_usr SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo_perfil VARCHAR(20) NOT NULL DEFAULT 'cidadao',
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    foto_perfil VARCHAR(255)

    CONSTRAINT chk_tipo_perfil CHECK (tipo_perfil IN ('cidadao', 'resgatista', 'ong', 'admin'));
);

-- 3. Tabela ORGANIZACAO
CREATE TABLE ORGANIZACAO (
    id_org SERIAL PRIMARY KEY,
    nome_org VARCHAR(100) NOT NULL,
    cnpj CHAR(14) NOT NULL UNIQUE,
    endereco VARCHAR(200),
    telefone VARCHAR(20),
    email_contato VARCHAR(100),
    tipo_org VARCHAR(20) NOT NULL DEFAULT 'ong',
    data_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aprovada BOOLEAN NOT NULL DEFAULT FALSE

    CONSTRAINT chk_tipo_org CHECK (tipo_org IN ('ong', 'clinica', 'governo', 'outro'));
);

-- 4. Tabela MEMBRO_ORG
CREATE TABLE MEMBRO_ORG (
    id_membro SERIAL PRIMARY KEY,
    funcao_membro VARCHAR(50) NOT NULL,
    data_entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_vinculo VARCHAR(20) NOT NULL DEFAULT 'pendente',
    id_usr INTEGER NOT NULL,
    id_org INTEGER NOT NULL,
    UNIQUE(id_usr, id_org),
    
    CONSTRAINT chk_status_vinculo CHECK (status_vinculo IN ('ativo', 'inativo', 'pendente')),

    CONSTRAINT fk_membro_usr FOREIGN KEY (id_usr) REFERENCES USUARIOS(id_usr) ON DELETE CASCADE,
    CONSTRAINT fk_membro_org FOREIGN KEY (id_org) REFERENCES ORGANIZACAO(id_org) ON DELETE CASCADE
);

-- 5. Tabela ANIMAIS
CREATE TABLE ANIMAIS (
    id_animal SERIAL PRIMARY KEY,
    nome_animal VARCHAR(50),
    raca VARCHAR(50),
    idade_estimada INTEGER,
    sexo VARCHAR(10) DEFAULT 'indefinido',
    condicao_saude TEXT,
    foto_principal VARCHAR(255),
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    caracteristicas_marcantes TEXT,
    castrado BOOLEAN DEFAULT FALSE,
    vacinado BOOLEAN DEFAULT FALSE,
    id_especie INTEGER NOT NULL,
    
    CONSTRAINT chk_sexo CHECK (sexo IN ('macho', 'femea', 'indefinido')),
    
    CONSTRAINT fk_animal_especie FOREIGN KEY (id_especie) REFERENCES ESPECIES(id_especie) ON DELETE RESTRICT
);

-- 6. Tabela LOCALIZACAO
CREATE TABLE LOCALIZACAO (
    id_local SERIAL PRIMARY KEY,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    endereco_aproximado VARCHAR(200),
    precisao INTEGER,
    data_hora_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    consentimento_geolocalizacao BOOLEAN NOT NULL
);

-- 7. Tabela CASOS
CREATE TABLE CASOS (
    id_caso SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    nivel_urgencia VARCHAR(10) NOT NULL,
    data_reporte TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_caso VARCHAR(15) NOT NULL DEFAULT 'reportado',
    ultima_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_animal INTEGER,
    id_usuario INTEGER NOT NULL,
    id_local INTEGER NOT NULL,
    
    CONSTRAINT chk_nível_urgencia CHECK (nivel_urgencia IN ('baixo', 'medio', 'alto', 'critico')),
    CONSTRAINT chk_status_caso CHECK (status_caso IN ('reportado', 'em_andamento', 'resgatado', 'finalizado', 'cancelado')),

    CONSTRAINT fk_caso_animal FOREIGN KEY (id_animal) REFERENCES ANIMAIS(id_animal) ON DELETE SET NULL,
    CONSTRAINT fk_caso_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usr) ON DELETE RESTRICT,
    CONSTRAINT fk_caso_local FOREIGN KEY (id_local) REFERENCES LOCALIZACAO(id_local) ON DELETE RESTRICT
);

-- 8. Tabela FOTOS_CASOS
CREATE TABLE FOTOS_CASOS (
    id_foto SERIAL PRIMARY KEY,
    caminho_arquivo VARCHAR(255) NOT NULL,
    data_upload TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descricao VARCHAR(200),
    tipo_imagem VARCHAR(20),
    id_caso INTEGER NOT NULL,
    
    CONSTRAINT chk_tipo_imagem CHECK (tipo_imagem IN ('ferimento', 'local', 'animal', 'documento')),
    
    CONSTRAINT fk_foto_caso FOREIGN KEY (id_caso) REFERENCES CASOS(id_caso) ON DELETE CASCADE
);

-- 9. Tabela ACAO_RESGATE
CREATE TABLE ACAO_RESGATE (
    id_acao SERIAL PRIMARY KEY,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    descricao_acao TEXT NOT NULL,
    status_resgate VARCHAR(15) NOT NULL DEFAULT 'planejada',
    recursos_necessarios TEXT,
    resultado TEXT,
    id_caso INTEGER NOT NULL,
    id_local_destino INTEGER,
    
    CONSTRAINT chk_status_resgate CHECK (status_resgate IN ('planejada', 'em_andamento', 'concluida', 'cancelada')),
    
    CONSTRAINT fk_acao_caso FOREIGN KEY (id_caso) REFERENCES CASOS(id_caso) ON DELETE RESTRICT,
    CONSTRAINT fk_acao_local FOREIGN KEY (id_local_destino) REFERENCES LOCALIZACAO(id_local) ON DELETE SET NULL
);

-- 10. Tabela ACAO_USUARIO
CREATE TABLE ACAO_USUARIO (
    id_relac SERIAL PRIMARY KEY,
    funcao_acao VARCHAR(50),
    data_entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_saida TIMESTAMP,
    id_acao INTEGER NOT NULL,
    id_usr INTEGER NOT NULL,
    UNIQUE(id_acao, id_usr),
    
    CONSTRAINT fk_acao_usuario_acao FOREIGN KEY (id_acao) REFERENCES ACAO_RESGATE(id_acao) ON DELETE CASCADE,
    CONSTRAINT fk_acao_usuario_usr FOREIGN KEY (id_usr) REFERENCES USUARIOS(id_usr) ON DELETE CASCADE
);

-- 11. Tabela MSG_CHAT
CREATE TABLE MSG_CHAT (
    id_msg SERIAL PRIMARY KEY,
    mensagem TEXT NOT NULL,
    data_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    id_remetente INTEGER NOT NULL,
    id_destinatario INTEGER NOT NULL,
    id_caso_referencia INTEGER,
    
    CONSTRAINT fk_msg_remetente FOREIGN KEY (id_remetente) REFERENCES USUARIOS(id_usr) ON DELETE CASCADE,
    CONSTRAINT fk_msg_destinatario FOREIGN KEY (id_destinatario) REFERENCES USUARIOS(id_usr) ON DELETE CASCADE,
    CONSTRAINT fk_msg_caso FOREIGN KEY (id_caso_referencia) REFERENCES CASOS(id_caso) ON DELETE SET NULL
);

-- 12. Tabela RESPOSTA
CREATE TABLE RESPOSTA (
    id_resp SERIAL PRIMARY KEY,
    conteudo TEXT NOT NULL,
    data_resposta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_msg INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    
    CONSTRAINT fk_resposta_msg FOREIGN KEY (id_msg) REFERENCES MSG_CHAT(id_msg) ON DELETE CASCADE,
    CONSTRAINT fk_resposta_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usr) ON DELETE CASCADE
);

-- 13. Tabela NOTIFICACAO
CREATE TABLE NOTIFICACAO (
    id_notif SERIAL PRIMARY KEY,
    mensagem VARCHAR(255) NOT NULL,
    data_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    tipo_notificacao VARCHAR(20) NOT NULL,
    id_referencia INTEGER,
    id_usuario INTEGER NOT NULL,
    
    CONSTRAINT chk_tipo_notificacao CHECK (tipo_notificacao IN ('novo_caso', 'atualizacao_caso', 'convite_acao', 'avaliacao', 'sistema')),
    
    CONSTRAINT fk_notificacao_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usr) ON DELETE CASCADE
);

-- 14. Tabela AVALIACAO
CREATE TABLE AVALIACAO (
    id_aval SERIAL PRIMARY KEY,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_avaliador INTEGER NOT NULL,
    id_avaliado INTEGER NOT NULL,
    id_acao INTEGER NOT NULL,
    UNIQUE(id_avaliador, id_acao),
    
    CONSTRAINT fk_avaliador FOREIGN KEY (id_avaliador) REFERENCES USUARIOS(id_usr) ON DELETE SET NULL,
    CONSTRAINT fk_avaliado FOREIGN KEY (id_avaliado) REFERENCES USUARIOS(id_usr) ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_acao FOREIGN KEY (id_acao) REFERENCES ACAO_RESGATE(id_acao) ON DELETE CASCADE
);

-- 15. Tabela LOGS_ATIVIDADES
CREATE TABLE LOGS_ATIVIDADES (
    id_log SERIAL PRIMARY KEY,
    acao VARCHAR(100) NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_origem VARCHAR(45) NOT NULL,
    user_agent TEXT,
    detalhes JSONB,
    entidade_afetada VARCHAR(50),
    id_entidade_afetada INTEGER,
    id_usuario INTEGER,
    
    CONSTRAINT fk_log_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usr) ON DELETE SET NULL
);

-- 16. Tabela CONSENTIMENTOS
CREATE TABLE CONSENTIMENTOS (
    id_consent SERIAL PRIMARY KEY,
    tipo_consentimento VARCHAR(20) NOT NULL,
    concedido BOOLEAN NOT NULL,
    data_manifestacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_origem VARCHAR(45) NOT NULL,
    versao_termo VARCHAR(20),
    id_usuario INTEGER NOT NULL,
    
    CONSTRAINT chk_tipo_consentimento CHECK (tipo_consentimento IN ('dados_pessoais', 'geolocalizacao', 'fotos', 'comunicacao')),
    
    CONSTRAINT fk_consentimento_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usr) ON DELETE CASCADE
);

-- =====================================================
-- CRIAÇÃO DOS ÍNDICES
-- =====================================================

CREATE INDEX idx_usuarios_email ON USUARIOS(email);
CREATE INDEX idx_usuarios_tipo_perfil ON USUARIOS(tipo_perfil);

CREATE INDEX idx_casos_status ON CASOS(status_caso);
CREATE INDEX idx_casos_urgencia ON CASOS(nivel_urgencia);
CREATE INDEX idx_casos_data_reporte ON CASOS(data_reporte);
CREATE INDEX idx_casos_usuario ON CASOS(id_usuario);
CREATE INDEX idx_casos_animal ON CASOS(id_animal);

CREATE INDEX idx_localizacao_coordenadas ON LOCALIZACAO USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

CREATE INDEX idx_notificacao_usuario_lida ON NOTIFICACAO(id_usuario, lida);

CREATE INDEX idx_msg_chat_remetente ON MSG_CHAT(id_remetente);
CREATE INDEX idx_msg_chat_destinatario ON MSG_CHAT(id_destinatario, lida);

CREATE INDEX idx_logs_data_hora ON LOGS_ATIVIDADES(data_hora);
CREATE INDEX idx_logs_usuario ON LOGS_ATIVIDADES(id_usuario);

CREATE INDEX idx_avaliacao_avaliado ON AVALIACAO(id_avaliado);

CREATE INDEX idx_acao_status ON ACAO_RESGATE(status_resgate);

-- =====================================================
-- TRIGGERS E FUNÇÕES
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_ultima_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_caso
    BEFORE UPDATE ON CASOS
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_ultima_atualizacao();

CREATE OR REPLACE FUNCTION notificar_caso_critico()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nivel_urgencia IN ('alto', 'critico') THEN
        INSERT INTO NOTIFICACAO (id_usuario, mensagem, tipo_notificacao, id_referencia)
        SELECT id_usr, 
               'Novo caso ' || NEW.nivel_urgencia || ' na região: ' || NEW.titulo,
               'novo_caso',
               NEW.id_caso
        FROM USUARIOS
        WHERE tipo_perfil = 'resgatista' AND ativo = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notificar_caso_critico
    AFTER INSERT ON CASOS
    FOR EACH ROW
    EXECUTE FUNCTION notificar_caso_critico();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

INSERT INTO ESPECIES (nome_especie, descricao) VALUES
('Cão', 'Canis lupus familiaris'),
('Gato', 'Felis catus'),
('Ave', 'Aves - diversas espécies'),
('Roedor', 'Hamsters, porquinhos-da-índia, etc.'),
('Equino', 'Cavalos, burros, mulas');

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE USUARIOS IS 'Todos os perfis de usuário da plataforma';
COMMENT ON TABLE ANIMAIS IS 'Animais atendidos ou reportados';
COMMENT ON TABLE CASOS IS 'Ocorrências de animais em situação de risco';
COMMENT ON TABLE LOCALIZACAO IS 'Dados geográficos para geolocalização';
COMMENT ON TABLE LOGS_ATIVIDADES IS 'Registro de ações para auditoria e LGPD';
COMMENT ON TABLE CONSENTIMENTOS IS 'Histórico de consentimentos dos usuários (LGPD)';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================