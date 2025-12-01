const { Pool } = require('pg');
require('dotenv').config();

/**
 * Configuração do pool de conexões com o PostgreSQL
 * Utiliza variáveis de ambiente para segurança
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'order_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Testa a conexão com o banco de dados
 */
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no banco de dados:', err);
  process.exit(-1);
});

/**
 * Função auxiliar para executar queries
 * @param {string} text - Query SQL
 * @param {Array} params - Parâmetros da query
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
};