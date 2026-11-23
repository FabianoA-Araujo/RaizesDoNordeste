const db = require('../postgres/connection');

class PedidoRepositoryPg {
  
  async salvar(pedidoEntity) {
    // getClient() pega uma conexão exclusiva do pool para rodar uma transação segura
    const client = await db.getClient();

    try {
      await client.query('BEGIN');
      // insere os dados do pedido no banco    
      const insertPedidoText = `
        INSERT INTO pedidos (id, unidade_id, usuario_id, canal_pedido, status, valor_total, desconto_fidelidade, valor_final)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      const pedidoValues = [
        pedidoEntity.id,
        pedidoEntity.unidadeId,
        pedidoEntity.usuarioId, // Permite null para pedidos anonimos dos canais TOTEM e PICKUP
        pedidoEntity.canalPedido,
        pedidoEntity.status,
        pedidoEntity.valorTotal,
        pedidoEntity.descontoFidelidade,
        pedidoEntity.valorFinal
      ];
      
      await client.query(insertPedidoText, pedidoValues);

      //Insere na tabela 'itens_pedido' fazendo um loop nos itens
      const insertItemText = `
        INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `;
      
      for (const item of pedidoEntity.itens) {
        const subtotal = item.quantidade * item.precoUnitario;
        const itemValues = [
          pedidoEntity.id, 
          item.produtoId, 
          item.quantidade, 
          item.precoUnitario, 
          subtotal
        ];
        await client.query(insertItemText, itemValues);
      }

     await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK'); // Se der erro em qualquer insert, desfaz tudo
      console.error('[DB] Erro ao salvar pedido, transação revertida.', error);
      throw error; // Joga o erro para cima, para o ErrorHandlerMiddleware capturar
    } finally {
      client.release(); // Devolve a conexão para o pool
    }
  }

  async atualizar(pedidoEntity) {
    // Atualiza apenas o status e a data de atualização
    const text = `
      UPDATE pedidos 
      SET status = $1, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    const values = [pedidoEntity.status, pedidoEntity.id];
    
    await db.query(text, values);

    // Alimenta a tabela de pagamentos caso o pedido já possua os dados da transação
    if (pedidoEntity.pagamento) {
      const insertPagamentoText = `
        INSERT INTO pagamentos (pedido_id, metodo_pagamento, status_pagamento, transacao_id_mock, payload_retorno)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (pedido_id) DO NOTHING
      `;
      await db.query(insertPagamentoText, [
        pedidoEntity.id,
        pedidoEntity.pagamento.metodo || 'PIX',
        pedidoEntity.pagamento.status,
        pedidoEntity.pagamento.transacaoIdMock,
        JSON.stringify(pedidoEntity.pagamento)
      ]);
    }

    // Registrar logs de auditoria
    const insertAuditText = `
      INSERT INTO logs_auditoria (usuario_id, acao_id, entidade, entidade_id, detalhes, ip_origem)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await db.query(insertAuditText, [
      pedidoEntity.usuarioId,
      'CRIAR_PEDIDO',
      'pedidos',
      pedidoEntity.id,
      JSON.stringify({
        canalPedido: pedidoEntity.canalPedido,
        unidadeId: pedidoEntity.unidadeId,
        statusAtual: pedidoEntity.status,
        valorFinal: pedidoEntity.valorFinal
      }),
      '127.0.0.1'
    ]);    
  }
}

module.exports = PedidoRepositoryPg;