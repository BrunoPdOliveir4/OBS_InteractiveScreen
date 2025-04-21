import { ElementManager } from './utils/ElementsManager.js';
const elementManager = new ElementManager();

const socket = io();
socket.on('connect-erro', (msg) => {
  alert(msg);
  const userId = prompt('Digite seu ID de usuário:');
  const path = window.location.pathname;
  window.location.href = path+`?user=${userId}`;
});
const apagadorVisual = elementManager.createEraser();
document.body.appendChild(apagadorVisual);

const area = document.getElementById('area');
const btnTexto = document.getElementById('btn-add-texto');
const btnImg = document.getElementById('btn-add-img');
const btnVideo = document.getElementById('btn-add-video');
const btnErase = document.getElementById('btn-erase'); 
const btnDeleteAll = document.getElementById('btn-delete-all');

const criarElemento = (data) => { 
    const el = elementManager.createEditableElemnt(data, socket);
    area.appendChild(el);
}


const canvas = document.createElement('canvas');
canvas.id = 'canvas-desenho';
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '0';
area.appendChild(canvas);

const ctx = canvas.getContext('2d');
ctx.lineWidth = 2;
ctx.strokeStyle = 'black';

let modoDesenho = false;
let modoErase = false; 
let desenhando = false;
let isErasing = false; 
let primeiroPonto = true;

document.getElementById('btn-desenhar').addEventListener('click', () => {
  modoDesenho = !modoDesenho;
  primeiroPonto = true;
  modoErase = false; 
  btnErase.style.backgroundColor = '';
  document.body.style.cursor = ''; 
});



// Alterna modo apagar
btnErase.addEventListener('click', () => {
  modoErase = !modoErase;
  modoDesenho = false;

  if (modoErase) {
    btnErase.style.backgroundColor = '#fff';
    document.body.style.cursor = 'none'; // Esconde o cursor padrão
    apagadorVisual.style.display = 'block';
  } else {
    btnErase.style.backgroundColor = '';
    document.body.style.cursor = '';
    apagadorVisual.style.display = 'none';
  }
});

// Move o apagador com o mouse
document.addEventListener('mousemove', (e) => {
  if (modoErase) {
    apagadorVisual.style.left = `${e.clientX - 10}px`; // Centraliza com base no tamanho
    apagadorVisual.style.top = `${e.clientY - 10}px`;
  }
});


// Função para ajustar o tamanho do canvas
function ajustarCanvas() {
  canvas.width = area.clientWidth;
  canvas.height = area.clientHeight;
}

ajustarCanvas();
window.addEventListener('resize', ajustarCanvas);

// Eventos de desenhar no canvas
canvas.addEventListener('mousedown', (e) => {
  if (modoDesenho || modoErase) {
    if (modoErase) {
      isErasing = true;
      ctx.globalCompositeOperation = 'destination-out'; 
      ctx.beginPath();
      ctx.arc(e.offsetX, e.offsetY, 10, 0, Math.PI * 2); 
      ctx.fill();
      socket.emit('apagar', { x: e.offsetX, y: e.offsetY });
    } else {
      desenhando = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      socket.emit('desenho', { x: e.offsetX, y: e.offsetY });
    }
  }
});

// Evento de movimento do mouse para desenhar ou apagar
canvas.addEventListener('mousemove', (e) => {
  if (desenhando && modoDesenho) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    socket.emit('desenho', { x: e.offsetX, y: e.offsetY });
  } else if (isErasing && modoErase) {
    ctx.arc(e.offsetX, e.offsetY, 10, 0, Math.PI * 2); 
    ctx.fill();
    socket.emit('apagar', { x: e.offsetX, y: e.offsetY });
  }
});

canvas.addEventListener('mouseup', () => {
  desenhando = false;
  isErasing = false;
  ctx.globalCompositeOperation = 'source-over'; 
  socket.emit('parou-desenho');
});
canvas.addEventListener('mouseout', () => {
  desenhando = false;
  isErasing = false;
  ctx.globalCompositeOperation = 'source-over'; 
});
canvas.addEventListener('mouseleave', () => {
  desenhando = false;
  isErasing = false;
  ctx.globalCompositeOperation = 'source-over'; 
});




// Evento de adicionar vídeo
//btnVideo.addEventListener('click', () => {
//  const url = prompt('URL do vídeo:');
//  if (url) {
//    const id = 'el-' + Date.now();
//    const data = { id, type: 'video', content: url, width: 320, height: 240 };
//    criarElemento(data);
//    socket.emit('novo-elemento', data);
//  }
//});

// Eventos para criar texto e imagem
btnTexto.addEventListener('click', () => {
  const texto = prompt('Texto:');
  const id = 'el-' + Date.now();
  const data = { id, type: 'texto', content: texto, width: 200, height: 60 };
  criarElemento(data);
  socket.emit('novo-elemento', data);
});

btnImg.addEventListener('click', () => {
  const url = prompt('URL da imagem:');
  if (url) {
    const id = 'el-' + Date.now();
    const data = { id, type: 'imagem', content: url, width: 300, height: 200 };
    criarElemento(data);
    socket.emit('novo-elemento', data);
  }
});

btnDeleteAll.addEventListener('click', () => {
  const elementos = document.querySelectorAll('.elemento');
  elementos.forEach(el => el.remove());  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('remover-tudo');
});


// WebSocket para sincronizar eventos entre os clientes
socket.on('estado-inicial', (elementos) => {
  elementos.forEach(el => {
    criarElemento(el);
  });
});

socket.on('desenho', ({ x, y }) => {
  if (primeiroPonto) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    primeiroPonto = false;
  } else {
    ctx.lineTo(x, y);
    ctx.stroke();
  }
});

socket.on('parou-desenho', () => {
  primeiroPonto = true
});

socket.on('apagar', ({ x, y }) => {
  if (modoErase) return;
  ctx.globalCompositeOperation = 'destination-out'; 
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2); 
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; 
});

socket.on('novo-elemento', (data) => criarElemento(data));
socket.on('mover-elemento', ({ id, left, top }) => {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }
});

socket.on('redimensionar-elemento', ({ id, width, height }) => {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
  }
});

socket.on('editar-elemento', ({ id, content, size, color }) => {
  const el = document.querySelector(`[data-id="${id}"]`);
  console.log(el);
  if (el && el.dataset.type === 'texto') {
    el.innerText = content;
    el.style.fontSize = size;
    el.style.color = color;
  }
});

socket.on('remover-elemento', ({ id }) => {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) el.remove();
});

socket.on('remover-tudo', () => {
  const elementos = document.querySelectorAll('.elemento');
  elementos.forEach(el => el.remove());  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  primeiroPonto = true;
});

socket.on('ocultar-elemento', ({ id }) => {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add('hided');
    el.ocultoParaOutros = true;
    el.style.opacity = '0.5';
    if (el._toggleVisibilityBtn) {
      el._toggleVisibilityBtn.innerText = '🚫';
    }
  }
});

socket.on('mostrar-elemento', ({ id }) => {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.remove('hided');
    el.ocultoParaOutros = false;
    el.style.opacity = '1';
    if (el._toggleVisibilityBtn) {
      el._toggleVisibilityBtn.innerText = '👁';
    }
  }
});
