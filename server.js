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
  
    socket.on('novo-elemento', (data) => {
      socket.broadcast.emit('novo-elemento', data);
    });
  
    socket.on('mover-elemento', (data) => {
      socket.broadcast.emit('mover-elemento', data);
    });
  
    socket.on('redimensionar-elemento', (data) => {
      socket.broadcast.emit('redimensionar-elemento', data);
    });
  
    socket.on('editar-elemento', (data) => {
      socket.broadcast.emit('editar-elemento', data);
    });

    socket.on('remover-elemento', (data) => {
        socket.broadcast.emit('remover-elemento', data);
    });      
});
app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
}
);
app.get('/show', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'show.html'));
});
  

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
