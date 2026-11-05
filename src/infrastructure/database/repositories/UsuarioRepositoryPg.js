const db = require('../postgres/connection');

class UsuarioRepositoryPg {
  
  async buscarPorEmail(email) {
    const text = `
      SELECT id, nome, email, senha_hash, perfil, ativo 
      FROM usuarios 
      WHERE email = $1
    `;
    const values = [email];
    
    const result = await db.query(text, values);
    
    // Retorna o usuário encontrado ou undefined, caso não exista.
    return result.rows[0];
  }

}

module.exports = UsuarioRepositoryPg;