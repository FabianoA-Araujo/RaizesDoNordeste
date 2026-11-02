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
  }
}

module.exports = PedidoRepositoryPg;