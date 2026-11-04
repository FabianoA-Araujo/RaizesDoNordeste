# Imagem oficial e leve do Node.js
FROM node:20-alpine

# Pasta de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependencia.
COPY package*.json ./

# Instala as dependencias
RUN npm install

# Copia todo o resto do código
COPY . .

# Expõe a porta da API
EXPOSE 3000

# Comando para iniciar a aplicacao
CMD ["npm", "start"]