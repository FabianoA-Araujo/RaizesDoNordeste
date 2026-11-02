const crypto = require('crypto');

class PagamentoMockAdapter {
  // Simula a chamada HTTP para uma processadora de cartões

  async processarCobranca(valorTotal, formaPagamento) {
    // Simula o tempo de latência de uma rede (500ms a 1 segundo)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Regra do Mock para forçar um cenário de erro nos testes
    if (formaPagamento === 'CARTAO_REJEITADO') {
      return {
        status: 'RECUSADO',
        motivo: 'Saldo insuficiente ou transação bloqueada pelo emissor.',
        transacaoIdMock: null
      };
    }

    return {
      status: 'APROVADO',
      motivo: 'Transação autorizada com sucesso.',
      transacaoIdMock: `mock-txn-${crypto.randomUUID()}`
    };
  }
}

module.exports = PagamentoMockAdapter;