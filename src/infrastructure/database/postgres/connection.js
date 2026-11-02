const { Pool } = require('pg');

// O Pool gerencia múltiplas conexões simultâneas, o que vai dar suporte para os horários de pico da rede
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
  console.error('[DB] Erro inesperado no pool do PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect()
};