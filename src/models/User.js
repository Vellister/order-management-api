const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Model para gerenciamento de usuários
 */
class User {
  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Usuário criado
   */
  static async create(userData) {
    const { username, email, password } = userData;
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );
    
    return result.rows[0];
  }

  /**
   * Busca usuário por username
   * @param {string} username - Nome de usuário
   * @returns {Object|null} Usuário encontrado
   */
  static async findByUsername(username) {
    const result = await query(
      'SELECT id, username, email, password, created_at FROM users WHERE username = $1',
      [username]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Busca usuário por email
   * @param {string} email - Email do usuário
   * @returns {Object|null} Usuário encontrado
   */
  static async findByEmail(email) {
    const result = await query(
      'SELECT id, username, email, password, created_at FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Busca usuário por ID
   * @param {number} id - ID do usuário
   * @returns {Object|null} Usuário encontrado
   */
  static async findById(id) {
    const result = await query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Verifica se usuário ou email já existe
   * @param {string} username - Nome de usuário
   * @param {string} email - Email
   * @returns {boolean} True se existe
   */
  static async exists(username, email) {
    const result = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Compara senha
   * @param {string} plainPassword - Senha em texto
   * @param {string} hashedPassword - Senha criptografada
   * @returns {boolean} True se as senhas coincidem
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
