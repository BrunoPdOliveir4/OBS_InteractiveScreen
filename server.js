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
const { v4: uuidv4 } = require('uuid');
const userCache = new Map();
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/User.js');

// DATABASE CONN 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🟢 Conectado ao MongoDB'))
.catch(err => {
  console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  process.exit(1);
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

// SOCKET FLOW.

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

// APP PAGES FLOW.
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
}
);
app.get('/show', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'show.html'));
});


// OAUTH2 AUTHORIZATION CODE FLOW. TWITCH

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
        redirect_uri: process.env.REDIRECT_URI 
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
    userData.access_token = access_token;
    const tempId = uuidv4();
    
    const user = await User.findOne({ username: userData.login });
    if (!user) {
      const newUser = new User({ username: userData.login });
      await newUser.save();
    } else {
      userData.whitelist = user.whitelist;
    }
    
    userCache.set(tempId, userData);
    setTimeout(() => userCache.delete(tempId), 5 * 60 * 1000);
    res.redirect(`/profile.html?id=${tempId}`);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter informações do perfil' });
  }
});

app.get('/get-oauth-info', (req, res) => {
  res.json({
    clientId: process.env.TWITCH_ID,
    redirectUri: process.env.REDIRECT_URI
  });
});

app.get('/api/profile/:id', (req, res) => {
  const userData = userCache.get(req.params.id);
  if (!userData) {
    return res.redirect('/login');
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

// DATABASE INTERACTIONS.
app.post('/user/', async (req, res) => {
  const { username } = req.body;

  if (!username) return res.status(400).json({ error: 'Username is required.' });

  try {
    const newUser = new User({ username });
    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.post('/whitelist/:owner', async (req, res) => {
  const { usernameToAdd, tempId } = req.body;
  const { owner } = req.params;
  const ownerUsername = owner;

  if (!ownerUsername || !usernameToAdd) {
    return res.status(400).json({ error: 'Both ownerUsername and usernameToAdd are required.' });
  }

  if(ownerUsername !== userCache.get(tempId).login){
    return res.status(403).json({ error: 'You are not authorized to add users to this whitelist.' });
  }
  try {
    const owner = await User.findOne({ username: ownerUsername });

    if (!owner) {
      return res.status(404).json({ error: 'Owner user not found.' });
    }

    if (!owner.whitelist.includes(usernameToAdd)) {
      owner.whitelist.push(usernameToAdd);
      await owner.save();
    }

    res.status(200).json(owner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/whitelist', async (req, res) => {
  const { username, check } = req.query;

  if (!username || !check) {
    return res.status(400).json({ error: 'username and check are required in query.' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'Owner user not found.' });
    }

    const isWhitelisted = user.whitelist.includes(check);
    res.status(200).json({ whitelisted: isWhitelisted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// APP LISTEN

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
