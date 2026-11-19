SET client_encoding = 'UTF8';
-- Unidades (Matriz com cozinha completa e Filial express)
INSERT INTO unidades (id, nome, cnpj, endereco, cidade, estado, cozinha_completa, ativa)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Raízes do Nordeste - Matriz Recife', '12345678000199', 'Av. Boa Viagem, 1500', 'Recife', 'PE', TRUE, TRUE),
  ('11111111-1111-1111-1111-111111111112', 'Raízes do Nordeste - Express Olinda', '98765432000188', 'Rua do Sol, 420', 'Olinda', 'PE', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Usuários
INSERT INTO usuarios (id, nome, email, senha_hash, cpf, perfil, telefone, ativo)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'João da Silva (Cliente)', 'cliente@raizesdonordeste.com.br', '$2a$10$euQU3YA1Yd26o/CZrcMu8uPDl.8bqpPaO3SQYlAzZZ6VtvJrckU6K', '11111111111', 'CLIENTE', '41999991111', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Maria Oliveira (Gerente)', 'gerente@raizesdonordeste.com.br', '$2a$10$euQU3YA1Yd26o/CZrcMu8uPDl.8bqpPaO3SQYlAzZZ6VtvJrckU6K', '22222222222', 'GERENTE', '41999992222', TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Carlos Souza (Atendente)', 'atendente@raizesdonordeste.com.br', '$2a$10$euQU3YA1Yd26o/CZrcMu8uPDl.8bqpPaO3SQYlAzZZ6VtvJrckU6K', '33333333333', 'ATENDENTE', '41999993333', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Consentimentos LGPD (Opt-in ativo para o cliente de teste)
INSERT INTO consentimentos_lgpd (id, usuario_id, tipo_consentimento, concedido, ip_origem)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PROGRAMA_FIDELIDADE', TRUE, '127.0.0.1')
ON CONFLICT (id) DO NOTHING;

-- Produtos
INSERT INTO produtos (id, nome, descricao, preco_base, unidade_medida, categoria, sazonal, ativo)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Baião de Dois Completo', 'Arroz, feijão de corda, carne de sol desfiada, queijo coalho e manteiga de garrafa.', 34.90, 'UN', 'Pratos Principais', FALSE, TRUE),
  ('22222222-2222-2222-2222-222222222223', 'Carne de Sol na Nata', 'Tiras de carne de sol aceboladas na nata fresca, acompanha macaxeira frita.', 48.50, 'UN', 'Pratos Principais', FALSE, TRUE),
  ('22222222-2222-2222-2222-222222222224', 'Cuscuz Nordestino', 'Flocos de milho, manteiga de garrafa, queijo coalho e carne de sol desfiada.', 18.00, 'UN', 'Pratos Principais', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. Estoques na Matriz Recife
-- Baião de Dois: 50 unidades (permite testar pedidos aprovados)
-- Carne de Sol: 2 unidades (permite testar erro HTTP 409 ao pedir 5 unidades)
-- Cuscuz Nordestino: 0 unidades (permite testar item esgotado)
INSERT INTO estoques (id, unidade_id, produto_id, quantidade, quantidade_minima)
VALUES 
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 50, 10),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', 2, 5),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222224', 0, 5)
ON CONFLICT (id) DO NOTHING;