const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const url = require('url');
const RoomMemo = require('./src/RoomMemoization.js');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

require('dotenv').config();

const { v4: uuidv4 } = require('uuid');
const userCache = new Map();

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/get-oauth-info', (req, res) => {
  res.json({
    clientId: process.env.TWITCH_ID,
    redirectUri: process.env.REDIRECT_URI
  });
});


app.use(express.static(path.join(__dirname, 'public')));
const allowedUsers = [process.env.TESTER1, 
  process.env.TESTER2, process.env.TESTER3, 
  process.env.TESTER4, process.env.TESTER5,
  process.env.TESTER6, process.env.TESTER7,
  process.env.TESTER8, process.env.TESTER9,
  process.env.TESTER10];

const rooms = new Map();
const roomMemo = new RoomMemo();

io.on('connection', (socket) => {
  const handshakeUrl = socket.handshake.headers.referer;
  const userId = new URL(handshakeUrl).searchParams.get("user");

  if (!userId || !allowedUsers.includes(userId)) {
    socket.emit('connect-erro', 'Acesso não autorizado');
    socket.disconnect();
    return;
  }

  socket.join(userId);

  const memo = roomMemo.get(userId) || roomMemo.initRoom(userId);

  const estadoAtual = roomMemo.getState(userId) || null;
 
  if(estadoAtual != null){
    socket.emit('estado-inicial', estadoAtual);
  }

  socket.emit('welcome', userId === allowedUsers[1] ? 
    `Bem vinda, ${userId}!` : `Bem vindo, ${userId}!`);
  


  rooms.set(socket.id, userId);
  

  console.log(`Socket conectado: ${socket.id} entrou na sala ${userId}`);
  

  socket.on('novo-elemento', (data) => {
    roomMemo.addUpdateElemnt(userId, data);
    socket.to(userId).emit('novo-elemento', data);
  });

  socket.on('mover-elemento', (data) => {
    roomMemo.addUpdateElemnt(userId, data);
    socket.to(userId).emit('mover-elemento', data);
  });

  socket.on('redimensionar-elemento', (data) => {
    roomMemo.addUpdateElemnt(userId, data);
    socket.to(userId).emit('redimensionar-elemento', data);
  });

  socket.on('editar-elemento', (data) => {
    roomMemo.addUpdateElemnt(userId, data);
    socket.to(userId).emit('editar-elemento', data);
  });

  socket.on('remover-elemento', (data) => {
      roomMemo.removeElemnt(userId, data.id);
      socket.to(userId).emit('remover-elemento', data);
  });
        
  socket.on('desenho', (data) => {
    socket.to(userId).emit('desenho', data);
  });

  socket.on('parou-desenho', () =>{
    socket.to(userId).emit('parou-desenho', 'ok');
  });

  socket.on('apagar', (dados) => {
    socket.to(userId).emit('apagar', dados);
  });

  socket.on('remover-tudo', () => {
    roomMemo.clearRoom(userId);
    socket.to(userId).emit('remover-tudo');
  });

  socket.on('disconnect', () => {
    rooms.delete(socket.id);
    console.log(`Socket desconectado: ${socket.id}`);
  });

  socket.on('ocultar-elemento', ({ id }) => {
    socket.to(userId).emit('ocultar-elemento', { id });
  });
  
  socket.on('mostrar-elemento', ({ id }) => {
    socket.to(userId).emit('mostrar-elemento', { id });
  });
  
  socket.on('apagar-tudo', () => {
    socket.to(userId).emit('apagar-tudo');
  });

});
app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
}
);
app.get('/show', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'show.html'));
});

app.get('/profile', async (req, res) => {
  const { code } = req.query; 

  if (!code) {
    return res.status(400).json({ error: 'Código de autorização não fornecido' });
  }

  try {
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_ID,
        client_secret: process.env.TWITCH_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.REDIRECT_URI // Make sure this matches the URI used in the OAuth flow
      }
    });

    const { access_token } = tokenResponse.data;
    const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_ID,
      }
    });

    const userData = userResponse.data.data[0]; 

    const tempId = uuidv4();
    userCache.set(tempId, userData);
    
    setTimeout(() => userCache.delete(tempId), 5 * 60 * 1000);
    res.redirect(`/profile.html?id=${tempId}`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter informações do perfil' });
  }
});
app.get('/api/profile/:id', (req, res) => {
  const userData = userCache.get(req.params.id);
  if (!userData) {
    return res.status(404).json({ error: 'Perfil não encontrado ou expirado' });
  }
  res.json(userData);
});


app.post('/get-token', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Código de autorização não fornecido' });
  }

  try {
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_ID,
        client_secret: process.env.TWITCH_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.REDIRECT_URI
      }
    });

    const { access_token } = tokenResponse.data;
    res.redirect(`/profile?access_token=${access_token}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter o token de acesso' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
