# Raízes do Nordeste — API RESTful de Gestão Multicanal

Projeto desenvolvido como Trabalho da disciplina Desenvolvimento Back-end, do curso superior de tecnologia em **Análise e Desenvolvimento de Sistemas (ADS)** da **UNINTER**.

A aplicação consiste em uma API RESTful projetada para modernizar e centralizar as operações da rede de restaurantes **Raízes do Nordeste**, integrando o fluxo de pedidos multicanal (Aplicativo, Totem de Autoatendimento, Balcão, Pickup e Web), o controle transacional de estoque por unidade, a autenticação segura com controle de acesso baseado em perfis (RBAC) e a conformidade com a Lei Geral de Proteção de Dados (LGPD).

---

## Arquitetura e Tecnologias

O sistema foi construído seguindo os princípios da **Clean Architecture**, separando as regras de negócio da infraestrutura externa em quatro camadas:

* **Domain (`src/domain`):** Entidades, regras puras e exceções de negócio (`RegraNegocioException`).
* **Application (`src/application`):** Casos de uso da aplicação (`LoginUseCase`, `CriarPedidoUseCase`).
* **Infrastructure (`src/infrastructure`):** Implementação de acesso ao banco de dados, migrations SQL (`01_schema_inicial.sql`, `02_seed_inicial.sql`), repositórios PostgreSQL e adaptadores externos (`PagamentoMockAdapter`).
* **API (`src/api`):** Controladores HTTP, definição de rotas, middlewares de autenticação/autorização e documentação Swagger.

### Stack Tecnológica
* **Runtime e Framework:** Node.js (v20 Alpine) e Express.js
* **Banco de Dados:** PostgreSQL 15 (utilizando o driver nativo `pg`)
* **Segurança:** Autenticação via JSON Web Token (`jsonwebtoken`) e hash de senhas com `bcryptjs`
* **Infraestrutura e Conteinerização:** Docker e Docker Compose, levantando também a interface do Adminer.
* **Documentação de API:** Swagger / OpenAPI 3.0 (`swagger-ui-express`)

---

## Estrutura de Diretórios

## Estrutura de Diretórios

```text
RaizesDoNordeste/
├── src/
│   ├── api/
│   │   ├── controllers/         # Controladores HTTP (AuthController, PedidoController)
│   │   ├── docs/                # Contrato OpenAPI (swagger.json) e coleção do Postman
│   │   ├── middlewares/         # Autenticação JWT, RBAC e tratamento global de erros
│   │   └── routes/              # Definição dos endpoints e injeção de dependências (routes.js)
│   ├── application/
│   │   └── use-cases/           # Casos de uso e orquestração das regras de negócio
│   ├── domain/
│   │   ├── entities/            # Entidades de domínio e regras de negócio puras (Pedido.js)
│   │   ├── enums/               # Enumerações e constantes do domínio (CanalPedido.js, StatusPedido.js)
│   │   └── exceptions/          # Exceções customizadas de domínio (RegraNegocioException.js)
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── migrations/      # Scripts SQL de criação das 12 tabelas e carga inicial (seed)
│   │   │   ├── postgres/        # Configuração do pool de conexões
│   │   │   └── repositories/    # Repositórios de persistência no PostgreSQL
│   │   └── integrations/        # Gateway simulado de pagamentos (PagamentoMockAdapter)
│   └── server.js                # Ponto de entrada da aplicação Express
├── .env.example                 # Modelo de variáveis de ambiente
├── .gitattributes               # Padronização de quebra de linha (LF)
├── .gitignore                   # Arquivos ignorados pelo controle de versão
├── docker-compose.yml           # Orquestração dos serviços (API, PostgreSQL e Adminer)
├── Dockerfile                   # Imagem da aplicação Node.js
├── package.json                 # Dependências e scripts do projeto
└── README.md                    # Documentação geral, arquitetura e guia de execução do projeto
```

## Pré-requisitos

Para executar este projeto localmente, é necessário ter instalado na máquina:
* **Git**
* **Docker** e **Docker Compose**
* **Postman** (ou outro cliente HTTP de sua preferência, caso deseje importar a coleção de testes)

---

## Como Clonar e Executar o Ambiente

### 1. Clonar o repositório
Abra o terminal e execute os comandos abaixo para baixar o código-fonte e acessar a pasta do projeto:

```
git clone https://github.com/FabianoA-Araujo/RaizesDoNordeste
cd RaizesDoNordeste
```

### 2. Configurar as variáveis de ambiente
Crie uma cópia do arquivo de exemplo `.env.example` renomeando-a para `.env` na raiz do projeto:

**No Linux / macOS:**
```
cp .env.example .env
```

**No Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

O arquivo `.env.example` já contém os valores padrão compatíveis com o `docker-compose.yml` para execução imediata em ambiente de desenvolvimento.

### 3. Subir os contêineres com Docker Compose
Na raiz do projeto, execute o comando de construção e inicialização dos serviços:

```
docker compose up -d --build
ou
docker compose up --build "para travar o terminal e ter acesso imediato aos logs em tempo real"
```

Ao executar este comando pela primeira vez, o Docker realizará automaticamente:
1. O download das imagens e o build da aplicação Node.js (`raizes_api`).
2. A criação do banco de dados PostgreSQL (`raizes_db`) com codificação UTF-8.
3. A execução automática dos scripts da pasta `src/infrastructure/database/migrations/`:
   * `01_schema_inicial.sql`: cria as 12 tabelas do Diagrama Entidade-Relacionamento (DER).
   * `02_seed_inicial.sql`: popula o banco com unidades, usuários de teste, consentimento LGPD, produtos e saldos iniciais de estoque.
4. A inicialização do gerenciador visual de banco de dados **Adminer** (`raizes_adminer`).

---

## Serviços e Endpoints Disponíveis

Após a inicialização dos contêineres, os seguintes serviços estarão disponíveis localmente:

* **Healthcheck da API:** `http://localhost:3000/health`
* **Documentação Interativa (Swagger UI):** `http://localhost:3000/api-docs`
* **Painel do Banco de Dados (Adminer):** `http://localhost:8080`

### Credenciais de Acesso ao Adminer
Caso deseje inspecionar as tabelas e os registros diretamente pelo navegador em `http://localhost:8080`, utilize os dados abaixo:
* **Sistema:** PostgreSQL
* **Servidor:** `postgres`
* **Usuário:** `postgres`
* **Senha:** `admin123`
* **Base de dados:** `raizes_nordeste_db`

---

## Como Executar os Testes Automatizados (Postman)

O projeto conta com uma coleção completa de testes cobrindo cenários positivos e negativos (autenticação JWT, controle de permissões RBAC, aprovação de pedidos multicanal, bloqueio por estoque insuficiente HTTP 409, recusa de pagamento HTTP 402 e validação de canal HTTP 422).

1. Abra o **Postman** e clique no botão **Import** ou arraste e solte o arquivo "raizes_nordeste_collection.json" no Postman.
2. Selecione o arquivo localizado em:
   ```text
   src/api/docs/raizes_nordeste_collection.json
   ```
3. A coleção ** API Raízes do Nordeste** será carregada com as variáveis `base_url` (`http://localhost:3000`) e `jwt_token` já configuradas.
4. Execute as requisições na ordem numérica (`01` a `10`):
   * Ao executar a requisição **02 - Login Cliente com Sucesso**, um script na aba *Tests* captura o `accessToken` retornado e preenche automaticamente a variável `{{jwt_token}}` para as requisições subsequentes.
   * Para validar o bloqueio de perfil (RBAC), execute a requisição **03 - Login Gerente com Sucesso** (atualizando o token ativo para o perfil `GERENTE`) e, em seguida, execute a requisição **07 - Erro: Perfil Sem Permissão RBAC**.

### Usuários Disponíveis na Carga Inicial (Seed)
Todos os usuários cadastrados pelo script `02_seed_inicial.sql` utilizam a senha padrão **`Senha@123`**:

| Perfil | Nome | E-mail |
| :--- | :--- | :--- |
| `CLIENTE` | João da Silva (Cliente) | `cliente@raizesdonordeste.com.br` |
| `GERENTE` | Maria Oliveira (Gerente) | `gerente@raizesdonordeste.com.br` |
| `ATENDENTE` | Carlos Souza (Atendente) | `atendente@raizesdonordeste.com.br` |

---

## Autor

**Fabiano Alves Araujo**  
Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas — UNINTER