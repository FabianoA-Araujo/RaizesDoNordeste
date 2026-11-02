const db = require('../postgres/connection');

class EstoqueRepositoryPg {
  
  async verificarSaldo(unidadeId, produtoId, quantidadeSolicitada) {
    const text = `
      SELECT quantidade 
      FROM estoques 
      WHERE unidade_id = $1 AND produto_id = $2
    `;
    const values = [unidadeId, produtoId];
    
    const result = await db.query(text, values);
    
    // Se não encontrou registro de estoque, é porque não tem saldo
    if (result.rows.length === 0) return false;
    
    const saldoAtual = result.rows[0].quantidade;
    return saldoAtual >= quantidadeSolicitada;
  }

  async debitarSaldo(unidadeId, produtoId, quantidade) {
    // Abate a quantidade do saldo do banco
    const text = `
      UPDATE estoques 
      SET quantidade = quantidade - $1,
          atualizado_em = CURRENT_TIMESTAMP
      WHERE unidade_id = $2 AND produto_id = $3
      RETURNING quantidade
    `;
    const values = [quantidade, unidadeId, produtoId];
    
    await db.query(text, values);
  }
}

module.exports = EstoqueRepositoryPg;