const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log(`Socket conectado: ${socket.id}`);

  socket.on('mover-h1', (posicao) => {
    // Envia para todos, exceto o que moveu
    io.emit('atualizar-h1', posicao);
  });

  socket.on('redimensionar-h1', (dimensoes) => {
    socket.broadcast.emit('atualizar-redimensionar-h1', dimensoes);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
