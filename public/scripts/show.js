import { ElementManager } from "./utils/ElementsManager.js";
const elementManager = new ElementManager();
const socket = io();
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
    }

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

    socket.on('editar-elemento', ({ id, conteudo }) => {
        const el = document.querySelector(`[data-id="${id}"]`);
        if (el && el.dataset.tipo === 'texto') {
            el.textContent = conteudo;
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
        ctx.arc(x, y, 10, 0, Math.PI * 2); 
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