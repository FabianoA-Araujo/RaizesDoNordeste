const RegraNegocioException = require('../../domain/exceptions/RegraNegocioException');


// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  if (err instanceof RegraNegocioException) {
    
    // Mapeia o código de erro interno para o status HTTP correspondente
    let statusCode = 400; // Bad Request como padrão
    
    if (err.codigo === 'ESTOQUE_INSUFICIENTE') statusCode = 409; // Conflict
    if (err.codigo === 'CANAL_INVALIDO') statusCode = 422; // Unprocessable Entity
    if (err.codigo === 'PAGAMENTO_RECUSADO') statusCode = 402; // Payment Required
    if (err.codigo === 'STATUS_INVALIDO') statusCode = 400; // Bad Request

    return res.status(statusCode).json({
      error: err.codigo,
      message: err.message,
      details: err.detalhes,
      timestamp: timestamp,
      path: path
    });
  }

  // Se for algum erro inesperado:
  console.error('[Erro Crítico]:', err);
  
  return res.status(500).json({
    error: 'ERRO_INTERNO_SERVIDOR',
    message: 'Ocorreu um erro inesperado no processamento da requisição.',
    details: [],
    timestamp: timestamp,
    path: path
  });
}

module.exports = errorHandler;