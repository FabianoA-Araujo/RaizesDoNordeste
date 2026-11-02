class PedidoController {
  // Recebe o caso de uso
  constructor(criarPedidoUseCase) {
    this.criarPedidoUseCase = criarPedidoUseCase;
  }

  // Método que será chamado na rota POST /pedidos
  async criar(req, res, next) {
    try {
      const { unidadeId, canalPedido, itens, formaPagamento } = req.body;
      
      // Extração do ID do usuário autenticado via JWT
      const usuarioId = req.user ? req.user.id : null;

      const dadosRequisicao = {
        unidadeId,
        usuarioId,
        canalPedido,
        itens,
        formaPagamento
      };

      const pedidoCriado = await this.criarPedidoUseCase.executar(dadosRequisicao);

      // Retorna 201 com sucesso
      return res.status(201).json(pedidoCriado);

    } catch (error) {
      // Em caso de erro, joga para o Middleware de Erro
      next(error);
    }
  }
}

module.exports = PedidoController;