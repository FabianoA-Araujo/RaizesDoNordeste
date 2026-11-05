const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const RegraNegocioException = require('../../domain/exceptions/RegraNegocioException');

class LoginUseCase {
  
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async executar(email, senhaPlana) {
    const usuario = await this.usuarioRepository.buscarPorEmail(email);

    // Se o usuário estiver inativo ou não estiver, o acesso é negado.
    if (!usuario || !usuario.ativo) {
      throw new RegraNegocioException(
        'CREDENCIAIS_INVALIDAS', 
        'E-mail ou senha incorretos.'
      );
    }

    const senhaValida = await bcrypt.compare(senhaPlana, usuario.senha_hash);

    if (!senhaValida) {
      throw new RegraNegocioException(
        'CREDENCIAIS_INVALIDAS', 
        'E-mail ou senha incorretos.'
      );
    }

    // Gera o payload do JWT
    const payload = {
      id: usuario.id,
      perfil: usuario.perfil
    };

    // Assina o token com a chave secreta do arquivo .env
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN // Ex: '1h'
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 3600, // Tempo de expiração em 1 hora
      user: {
        id: usuario.id,
        nome: usuario.nome,
        perfil: usuario.perfil
      }
    };
  }
}

module.exports = LoginUseCase;