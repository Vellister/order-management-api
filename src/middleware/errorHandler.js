/**
 * Middleware global para tratamento de erros
 * Captura todos os erros da aplicação e retorna respostas padronizadas
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro capturado:', err);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.errors
    });
  }

  // Erro de banco de dados - Duplicate entry
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Registro já existe',
      error: 'Duplicate entry'
    });
  }

  // Erro de banco de dados - Foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referência inválida',
      error: 'Foreign key violation'
    });
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: 'Unauthorized'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      error: 'Token expired'
    });
  }

  // Erro padrão
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Internal Server Error'
  });
};

module.exports = errorHandler;