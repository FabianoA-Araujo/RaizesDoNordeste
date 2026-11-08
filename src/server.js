require('dotenv').config();
const express = require('express');
const routes = require('./api/routes/routes');
const errorHandler = require('./api/middlewares/ErrorHandlerMiddleware');

const app = express();

// Configura o Express para ler corpos de requisição em formato JSON
app.use(express.json());

// Monta as rotas registradas
app.use(routes);

// Middleware de Erro Global
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
  console.log(`Endpoint de teste: http://localhost:${PORT}/health`);
});