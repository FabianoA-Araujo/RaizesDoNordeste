class RegraNegocioException extends Error {
  constructor(codigo, mensagem, detalhes = []) {
    super(mensagem);
    this.name = 'RegraNegocioException';
    this.codigo = codigo; // Ex: 'ESTOQUE_INSUFICIENTE'
    this.detalhes = detalhes;// Array com os campos que falharam
  }
}

module.exports = RegraNegocioException;