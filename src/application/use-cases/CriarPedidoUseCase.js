const Pedido = require('../../domain/entities/Pedido');
const RegraNegocioException = require('../../domain/exceptions/RegraNegocioException');

class CriarPedidoUseCase {
/*
   Recebe as dependências de banco e integrações de fora - Injeção de Dependência.
*/
  constructor(estoqueRepository, pedidoRepository, pagamentoGateway) {
    this.estoqueRepository = estoqueRepository;
    this.pedidoRepository = pedidoRepository;
    this.pagamentoGateway = pagamentoGateway;
  }

  async executar(dadosRequisicao) {
    // Instancia a Entidade de Domínio e faz a verifica se o CanalPedido é válido.
    const pedido = new Pedido({
      unidadeId: dadosRequisicao.unidadeId,
      usuarioId: dadosRequisicao.usuarioId,
      canalPedido: dadosRequisicao.canalPedido,
      itens: dadosRequisicao.itens
    });

    //Validação de Estoque
    for (const item of pedido.itens) {
      const temSaldo = await this.estoqueRepository.verificarSaldo(
        pedido.unidadeId, 
        item.produtoId, 
        item.quantidade
      );
      
      if (!temSaldo) {
        throw new RegraNegocioException(
          'ESTOQUE_INSUFICIENTE',
          'Não há quantidade suficiente para um ou mais itens.',
          [{ field: `produtoId: ${item.produtoId}`, issue: 'Saldo indisponível nesta unidade.' }]
        );
      }
    }

    // Salva o pedido inicial no banco com status "AGUARDANDO_PAGAMENTO".
    await this.pedidoRepository.salvar(pedido);

    // Aciona o Mock para simular o pagamento
    const respostaPagamento = await this.pagamentoGateway.processarCobranca(
      pedido.valorFinal, 
      dadosRequisicao.formaPagamento
    );

    if (respostaPagamento.status === 'APROVADO') {
      
      pedido.atualizarStatus('EM_PREPARO'); // Avança o status
      await this.pedidoRepository.atualizar(pedido);
      
      // Só faz baixa de estoque se o pagamento for confirmado
      for (const item of pedido.itens) {
        await this.estoqueRepository.debitarSaldo(pedido.unidadeId, item.produtoId, item.quantidade);
      }
      return {
        pedidoId: pedido.id,
        canalPedido: pedido.canalPedido,
        status: pedido.status,
        valorTotal: pedido.valorTotal,
        pagamento: respostaPagamento
      };

    } else {
      pedido.atualizarStatus('PAGAMENTO_RECUSADO');
      await this.pedidoRepository.atualizar(pedido);

      throw new RegraNegocioException(
        'PAGAMENTO_RECUSADO',
        'A transação foi negada pelo gateway de pagamento.',
        [{ field: 'formaPagamento', issue: respostaPagamento.motivo }]
      );
    }
  }
}

module.exports = CriarPedidoUseCase;