# Raízes do Nordeste — API RESTful de Gestão Multicanal

Projeto desenvolvido como Trabalho da disciplina **Desenvolvimento Back-end**, do Curso Superior de Tecnologia em **Análise e Desenvolvimento de Sistemas (ADS)** da **UNINTER**.

A aplicação consiste em uma API RESTful projetada para modernizar e centralizar as operações da rede de restaurantes **Raízes do Nordeste**, integrando o fluxo de pedidos multicanal (Aplicativo, Totem de Autoatendimento, Balcão, Pickup e Web), o controle transacional de estoque por unidade, a autenticação segura com controle de acesso baseado em perfis (RBAC) e a conformidade com a Lei Geral de Proteção de Dados (LGPD).

---

## Arquitetura e Tecnologias

O sistema foi construído seguindo os princípios da **Clean Architecture**, separando as regras de negócio da infraestrutura externa em quatro camadas:

* **Domain (`src/domain`):** Entidades, enumerações (`CanalPedido`, `StatusPedido`), regras puras e exceções de negócio (`RegraNegocioException`).
* **Application (`src/application`):** Casos de uso da aplicação (`LoginUseCase`, `CriarPedidoUseCase`).
* **Infrastructure (`src/infrastructure`):** Implementação de acesso ao banco de dados, migrations SQL (`01_schema_inicial.sql`, `02_seed_inicial.sql`), repositórios PostgreSQL e adaptadores externos (`PagamentoMockAdapter`).
* **API (`src/api`):** Controladores HTTP, definição de rotas, middlewares de autenticação/autorização e documentação Swagger.

### Stack Tecnológica
* **Linguagem e Runtime:** JavaScript (ES6+) / Node.js v20 (Alpine)
* **Framework Web:** Express.js (`v4.x`)
* **Banco de Dados:** PostgreSQL 15 (driver nativo `pg` com *Connection Pooling*)
* **Segurança:** Autenticação via JSON Web Token (`jsonwebtoken`) e hash de senhas com `bcryptjs`
* **Infraestrutura e Conteinerização:** Docker, Docker Compose e Adminer
* **Documentação de API:** Swagger / OpenAPI 3.0 (`swagger-ui-express`)

---

## Atendimento aos Requisitos de Negócio e Alta Disponibilidade (Horário de Pico)

O principal desafio operacional identificado no restaurante **Raízes do Nordeste** é a concentração severa de demanda durante o horário de almoço, cenário que exige absorção de picos de requisições simultâneas sem indisponibilidade, lentidão crítica ou inconsistência nos pedidos.

As decisões arquiteturais e tecnológicas deste projeto foram definidas especificamente para mitigar esses riscos:

* **Processamento Assíncrono Não-Bloqueante (Node.js + Express):** Diferente de servidores web tradicionais baseados em *threads* bloqueantes, o *Event Loop* do Node.js gerencia milhares de conexões simultâneas de entrada (App, Totens e Balcão) com baixo consumo de recursos, evitando quedas por saturação durante o pico do almoço.
* **Autenticação *Stateless* via JWT:** O controle de sessão não depende de armazenamento em memória no servidor. Como o estado do usuário trafega assinado no próprio token JWT, a API pode ser escalada horizontalmente (múltiplas instâncias atrás de um *Load Balancer*) sem perda de sessão.
* **Pool de Conexões e Transações ACID (PostgreSQL + `pg`):** A utilização de *Connection Pooling* reutiliza conexões ativas com o banco de dados, eliminando a latência de abertura e fechamento de sockets a cada pedido. Além disso, o controle transacional explícito (`BEGIN` / `COMMIT` / `ROLLBACK`) impede condições de corrida (*race conditions*), garantindo que dois clientes não comprem a última unidade de um prato simultaneamente e que o estoque só seja debitado após a confirmação do pagamento.
* **Isolamento e Resiliência com Docker (`restart: always`):** A conteinerização isola os recursos da API e do banco de dados, garantindo paridade entre ambientes e recuperação automática do serviço em caso de falhas inesperadas.
* **Desacoplamento via Clean Architecture:** O isolamento da regra de negócio em relação a serviços externos (como o `PagamentoMockAdapter`) permite substituir ou escalar integrações de terceiros sem comprometer o recebimento de pedidos.

---

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

---

## Pré-requisitos

Para executar este projeto localmente, é necessário ter instalado na máquina:
* **Git**
* **Docker** e **Docker Compose** (recomendado — provisiona automaticamente o Node.js v20, PostgreSQL 15 e Adminer)
* **Node.js v20+ e npm** *(opcional, necessário apenas caso opte por executar a API fora do Docker)*
* **Postman** *(ou outro cliente HTTP de sua preferência, para importar e executar a coleção de testes)*

---

## Passo a Passo de Instalação e Execução

### 1. Clonar o repositório
Abra o terminal e execute os comandos abaixo para baixar o código-fonte e acessar a pasta do projeto:

```bash
git clone https://github.com/FabianoA-Araujo/RaizesDoNordeste.git
cd RaizesDoNordeste
```

### 2. Configurar as variáveis de ambiente
Crie uma cópia do arquivo de exemplo `.env.example` renomeando-a para `.env` na raiz do projeto:

**No Linux / macOS:**
```bash
cp .env.example .env
```

**No Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

O arquivo `.env.example` já contém os valores padrão configurados (`PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `JWT_SECRET`) compatíveis com o `docker-compose.yml`.

### 3. Instalar dependências, criar o banco (migrations/seed) e iniciar a API
Na raiz do projeto, execute o comando de construção e inicialização dos serviços via Docker Compose:

```bash
# Sobe os contêineres em segundo plano (recomendado)
docker compose up -d --build

# Ou execute sem "-d" para acompanhar os logs em tempo real no terminal:
# docker compose up --build
```

Ao executar este comando pela primeira vez, o ambiente realizará automaticamente:
1. **Instalação de Dependências:** O `Dockerfile` executa `npm install` com base no `package.json`, instalando `express`, `pg`, `jsonwebtoken`, `bcryptjs`, `dotenv`, `cors`, `uuid` e `swagger-ui-express`.
2. **Criação do Banco de Dados:** Inicializa o contêiner PostgreSQL 15 (`raizes_db`) com codificação UTF-8 e banco `raizes_nordeste_db`.
3. **Execução das Migrations e Carga Inicial (Seed):** Roda automaticamente os scripts da pasta `src/infrastructure/database/migrations/`:
   * `01_schema_inicial.sql`: cria as 12 tabelas do Diagrama Entidade-Relacionamento (DER).
   * `02_seed_inicial.sql`: popula o banco com unidades, usuários de teste, consentimento LGPD, produtos e saldos iniciais de estoque.
4. **Inicialização da API e Adminer:** Inicia o servidor Express (`raizes_api` na porta `3000`) e o painel visual do banco (`raizes_adminer` na porta `8080`).

*(Nota: Caso deseje instalar as dependências localmente para inspeção no editor, basta executar `npm install` na raiz do projeto).*

---

## Serviços, Documentação (Swagger) e Banco de Dados

Após a inicialização dos contêineres, os seguintes serviços estarão disponíveis localmente:

* **Healthcheck da API:** `http://localhost:3000/health`
* **Documentação Interativa (Swagger / OpenAPI 3.0):** `http://localhost:3000/api-docs`
* **Painel Visual do Banco de Dados (Adminer):** `http://localhost:8080`

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

1. Abra o **Postman**, clique em **Import** e selecione (ou arraste) o arquivo:
   ```text
   src/api/docs/raizes_nordeste_collection.json
   ```
2. A coleção **API Raízes do Nordeste** será carregada com as variáveis `base_url` (`http://localhost:3000`) e `jwt_token` configuradas.
3. **Ordem recomendada de execução:**
   * **Infraestrutura e Autenticação Cliente:** Execute `01 - Healthcheck`, `02 - Login Cliente com Sucesso` (um script na aba *Tests* salva automaticamente o `accessToken` do perfil `CLIENTE` na variável `{{jwt_token}}`) e `04 - Login com Senha Incorreta (HTTP 401)`.
   * **Fluxo Crítico de Pedidos (com token de `CLIENTE` ativo):** Execute em sequência `05 - Criar Pedido Multicanal Aprovado (HTTP 201)`, `06 - Erro: Pedido Sem Token JWT (HTTP 401)`, `08 - Erro: Estoque Insuficiente (HTTP 409)`, `09 - Erro: Pagamento Recusado (HTTP 402)` e `10 - Erro: Canal de Pedido Inválido (HTTP 422)`.
   * **Validação de Permissão RBAC (com token de `GERENTE`):** Execute `03 - Login Gerente com Sucesso` (sobrescreve `{{jwt_token}}` com o perfil `GERENTE`) e, em seguida, dispare `07 - Erro: Perfil Sem Permissão RBAC (HTTP 403)`.

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