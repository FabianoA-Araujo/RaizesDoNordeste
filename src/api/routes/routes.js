const { Router } = require('express');

// Repositórios e Adapters
const UsuarioRepositoryPg = require('../../infrastructure/database/repositories/UsuarioRepositoryPg');
const EstoqueRepositoryPg = require('../../infrastructure/database/repositories/EstoqueRepositoryPg');
const PedidoRepositoryPg = require('../../infrastructure/database/repositories/PedidoRepositoryPg');
const PagamentoMockAdapter = require('../../infrastructure/integrations/PagamentoMockAdapter');

// Casos de Uso
const LoginUseCase = require('../../application/use-cases/LoginUseCase');
const CriarPedidoUseCase = require('../../application/use-cases/CriarPedidoUseCase');

// Controllers (API)
const AuthController = require('../controllers/AuthController');
const PedidoController = require('../controllers/PedidoController');

// Middlewares
const { garantirAutenticacao, garantirPerfil } = require('../middlewares/AuthMiddleware');

const routes = Router();

// Injeção de Dependências

// Autenticação
const usuarioRepository = new UsuarioRepositoryPg();
const loginUseCase = new LoginUseCase(usuarioRepository);
const authController = new AuthController(loginUseCase);

// Pedidos
const estoqueRepository = new EstoqueRepositoryPg();
const pedidoRepository = new PedidoRepositoryPg();
const pagamentoGateway = new PagamentoMockAdapter();
const criarPedidoUseCase = new CriarPedidoUseCase(estoqueRepository, pedidoRepository, pagamentoGateway);
const pedidoController = new PedidoController(criarPedidoUseCase);

// Definição das Rotas HTTP

// Healthcheck - para testar se a API está respondendo
routes.get('/health', (req, res) => {
  return res.status(200).json({ status: 'OK', message: 'API Raízes do Nordeste rodando!' });
});

// Autenticação
routes.post('/auth/login', (req, res, next) => authController.login(req, res, next));

// Pedidos
routes.post('/pedidos', garantirAutenticacao, garantirPerfil(['CLIENTE', 'ATENDENTE', 'ADMIN']), (req, res, next) => {
  pedidoController.criar(req, res, next);
});

module.exports = routes;