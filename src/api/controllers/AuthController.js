class AuthController {
  
  constructor(loginUseCase) {
    this.loginUseCase = loginUseCase;
  }

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      // Validação
      if (!email || !senha) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'E-mail e senha são obrigatórios.',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
      }

      // Para verificar o hash e gerar o token JWT.
      const resultado = await this.loginUseCase.executar(email, senha);

      return res.status(200).json(resultado);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;