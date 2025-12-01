const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT
 * Verifica se o token JWT fornecido é válido
 */
const authenticateToken = (req, res, next) => {
  // Obtém o token do header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Verifica se o token foi fornecido
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso não fornecido',
      error: 'Unauthorized'
    });
  }

  // Verifica a validade do token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido ou expirado',
        error: 'Forbidden'
      });
    }

    // Adiciona os dados do usuário à requisição
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };