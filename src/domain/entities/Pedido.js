const CanalPedido = require('../enums/CanalPedido');
const StatusPedido = require('../enums/StatusPedido');
const RegraNegocioException = require('../exceptions/RegraNegocioException');
const crypto = require('crypto'); //Criptografia nativa do Node para gerar os IDs únicos

class Pedido {
  constructor({ id, unidadeId, usuarioId, canalPedido, itens = [] }) {
    this.id = id || crypto.randomUUID();
    this.unidadeId = unidadeId;
    this.usuarioId = usuarioId || null; // Null para vendas anônimas realizadas nos TOTENS E PICKUP
    this.itens = itens;
    this.status = StatusPedido.AGUARDANDO_PAGAMENTO;
    this.valorTotal = 0;
    this.descontoFidelidade = 0;
    this.valorFinal = 0;
    
    // O setter faz a validação de domínio obrigatória
    this.canalPedido = canalPedido; 
    
    this.calcularValores();
  }

  set canalPedido(canal) {
    if (!Object.values(CanalPedido).includes(canal)) {
      throw new RegraNegocioException(
        'CANAL_INVALIDO', 
        'O canal de origem do pedido não foi informado ou é inválido.',
        [{ field: 'canalPedido', issue: `Valores permitidos: ${Object.values(CanalPedido).join(', ')}` }]
      );
    }
    this._canalPedido = canal;
  }

  get canalPedido() {
    return this._canalPedido;
  }

  calcularValores() {
    // Soma quantidade * precoUnitario de cada item
    this.valorTotal = this.itens.reduce((total, item) => {
      return total + (item.quantidade * item.precoUnitario);
    }, 0);
    
    // Aplica o desconto de fidelidade e garante que o pedido não fique negativo
    const valorAposDesconto = this.valorTotal - this.descontoFidelidade;
    this.valorFinal = valorAposDesconto > 0 ? valorAposDesconto : 0;
  }

  aplicarDescontoFidelidade(valor) {
    this.descontoFidelidade = valor;
    this.calcularValores();
  }

  atualizarStatus(novoStatus) {
    if (!Object.values(StatusPedido).includes(novoStatus)) {
      throw new RegraNegocioException('STATUS_INVALIDO', 'O status informado não existe.');
    }
    this.status = novoStatus;
  }
}

module.exports = Pedido;