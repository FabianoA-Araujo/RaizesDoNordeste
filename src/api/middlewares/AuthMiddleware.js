const jwt = require('jsonwebtoken');

// Verifica se o token recebido é válido.
function garantirAutenticacao(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'NAO_AUTORIZADO',
      message: 'Token de autenticação não fornecido.',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  const [, token] = authHeader.split(' ');

  try {
    // Decodifica e valida a assinatura usando a senha do .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      perfil: decoded.perfil
    };
    
    return next(); // Libera o acesso
    
  } catch (err) {
    return res.status(401).json({
      error: 'TOKEN_INVALIDO',
      message: 'Token expirado ou inválido.',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

// Verificação de perfil do usuário, para liberar o acesso ou não.
function garantirPerfil(perfisPermitidos) {
  return (req, res, next) => {
    if (!req.user || !perfisPermitidos.includes(req.user.perfil)) {
      return res.status(403).json({
        error: 'ACESSO_NEGADO',
        message: 'Seu perfil não tem permissão para acessar este recurso.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }
    
    return next();
  };
}

module.exports = { garantirAutenticacao, garantirPerfil };