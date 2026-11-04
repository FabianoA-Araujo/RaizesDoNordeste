-- Unidades
CREATE TABLE unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cozinha_completa BOOLEAN DEFAULT TRUE,
    ativa BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE,
    perfil VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produtos
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    preco_base DECIMAL(10,2) NOT NULL,
    unidade_medida VARCHAR(10) NOT NULL DEFAULT 'UN',
    categoria VARCHAR(50) NOT NULL,
    sazonal BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consentimentos LGPD
CREATE TABLE consentimentos_lgpd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo_consentimento VARCHAR(50) NOT NULL,
    concedido BOOLEAN NOT NULL,
    ip_origem VARCHAR(45),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estoques
CREATE TABLE estoques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidades(id),
    produto_id UUID NOT NULL REFERENCES produtos(id),
    quantidade INT NOT NULL,
    quantidade_minima INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(unidade_id, produto_id)
);

-- Movimentações de Estoque
CREATE TABLE movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estoque_id UUID NOT NULL REFERENCES estoques(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(20) NOT NULL,
    quantidade INT NOT NULL,
    unidade_medida VARCHAR(10) NOT NULL,
    motivo VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidades(id),
    usuario_id UUID REFERENCES usuarios(id),
    canal_pedido VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    valor_total DECIMAL(10,2) NOT NULL,
    desconto_fidelidade DECIMAL(10,2) DEFAULT 0.00,
    valor_final DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens do Pedido
CREATE TABLE itens_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Pagamentos
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID UNIQUE NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo_pagamento VARCHAR(30),
    status_pagamento VARCHAR(20) NOT NULL,
    transacao_id_mock VARCHAR(100) NOT NULL,
    payload_retorno JSONB,
    processado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fidelidade Pontos
CREATE TABLE fidelidade_pontos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    pedido_id UUID REFERENCES pedidos(id),
    pontos INT NOT NULL,
    tipo_transacao VARCHAR(20) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de Auditoria
CREATE TABLE logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    acao_id VARCHAR(100) NOT NULL,
    entidade VARCHAR(50) NOT NULL,
    entidade_id UUID,
    detalhes JSONB,
    ip_origem VARCHAR(45),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campanhas
CREATE TABLE campanhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    unidade_id UUID REFERENCES unidades(id),
    produto_id UUID REFERENCES produtos(id),
    descricao TEXT NOT NULL,
    tipo_desconto VARCHAR(20) NOT NULL,
    valor_desconto DECIMAL(10,2) NOT NULL,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL
);