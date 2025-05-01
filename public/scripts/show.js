import { ElementManager } from "./utils/ElementsManager.js";
const elementManager = new ElementManager();
const socket = io();
socket.on('connect-erro', (msg) => {
  alert(msg);
  window.location.href = '/login';
});
const youtubePlayers = {};
const area = document.getElementById('area');
const canvas = document.getElementById('canvas-desenho');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 2;
ctx.strokeStyle = 'black';

let primeiroPonto = true;
let desenhando = false;

// Configuração inicial do canvas
function ajustarCanvas() {
    canvas.width = area.clientWidth;
    canvas.height = area.clientHeight;
}

ajustarCanvas();
window.addEventListener('resize', ajustarCanvas);
// Função para criar elementos (texto, imagem, vídeo)
const criarElemento = (data) => {
    const el = elementManager.createElement(data, socket);
    area.appendChild(el);

    if (el.dataset.type === 'video') {
        setTimeout(() => {
            playYouTubeById(el.dataset.id);
        }, 2000); // espera um pouquinho para garantir que o iframe esteja no DOM
    }
}

function playYouTubeById(dataId, retries = 10) {
    const iframe = document.querySelector(`[data-id="${dataId}"] iframe`);
    if (!iframe) return;

    const iframeId = iframe.id;
    const player = youtubePlayers[iframeId];

    if (player && typeof player.playVideo === 'function') {
        player.playVideo();
    } else if (retries > 0) {
        // Tenta novamente após 300ms
        setTimeout(() => playYouTubeById(dataId, retries - 1), 300);
    } else {
        console.warn(`Player YouTube não disponível para ${iframeId}`);
    }
}

window.onYouTubeIframeAPIReady = () => {
    document.querySelectorAll('iframe[src*="youtube.com/embed"]').forEach(iframe => {
        const id = iframe.id;
        if (!id) return;

        youtubePlayers[id] = new YT.Player(id, {
            events: {
                onReady: () => console.log(`Player ${id} pronto.`)
            }
        });
    });
};


// WebSocket para sincronizar eventos entre os clientes
socket.on('estado-inicial', (elementos) => {
    elementos.forEach(el => {
      criarElemento(el);
    });
});

// Funções para desenhar
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

// Funções para interação com os elementos
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

socket.on('editar-elemento', ({ id, content, color, size, font }) => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el && el.dataset.type === 'texto') {
        el.textContent = content;
        el.style.color = color;
        el.style.fontSize = size;
        el.style.fontFamily = font;
    }
});

socket.on('remover-elemento', ({ id }) => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
});

// Função de apagar desenho
function apagarDesenho(x, y) {
    ctx.globalCompositeOperation = 'destination-out'; 
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2); 
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; 
}

// Detectando o clique para apagar
canvas.addEventListener('mousedown', (e) => {
    desenhando = true;
    apagarDesenho(e.offsetX, e.offsetY);
    socket.emit('apagar', { x: e.offsetX, y: e.offsetY });
});

canvas.addEventListener('mousemove', (e) => {
    if (desenhando) {
        apagarDesenho(e.offsetX, e.offsetY);
        socket.emit('apagar', { x: e.offsetX, y: e.offsetY });
    }
});

canvas.addEventListener('mouseup', () => {
    desenhando = false;
});

// Receber evento de apagar dos outros clientes
socket.on('apagar', ({ x, y }) => {
    apagarDesenho(x, y);
});
socket.on('ocultar-elemento', ({ id }) => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
    }
});

socket.on('mostrar-elemento', ({ id }) => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
    }
});


socket.on('remover-tudo', () => {
    const elementos = document.querySelectorAll('.elemento');
    elementos.forEach(el => el.remove());  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
  
socket.on('apagar-tudo', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    primeiroPonto = true;
  }
);