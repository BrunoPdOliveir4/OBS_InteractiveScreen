import { socketService } from '../core/SocketService.js';
import { eventBus } from '../core/EventBus.js';
import { ElementManager } from '../managers/ElementManager.js';
import { Canvas } from '../components/Canvas.js';
import { showPopup } from '../components/PopUp.js';
import { redirect } from '../utils/helpers.js';
import { ROUTES, SOCKET_EVENTS } from '../utils/constants.js';

class ShowPage {
  constructor() {
    this.elementManager = new ElementManager();
    this.canvas = null;
    this.socket = null;
    this.area = null;
    this.youtubePlayers = {};
    this.firstPoint = true;
  }

  init() {
    // Initialize socket
    this.initSocket();

    // Initialize DOM elements
    this.initDom();

    // Setup socket handlers
    this.setupSocketHandlers();
  }

  initSocket() {
    socketService.connect();
    this.socket = socketService.getSocket();

    // Handle connection error
    eventBus.on('socket:error', (msg) => {
      showPopup(msg, true);
      redirect(ROUTES.LOGIN);
    });
  }

  initDom() {
    this.area = document.getElementById('area');

    // Get or create canvas
    const existingCanvas = document.getElementById('canvas-desenho');
    if (existingCanvas) {
      this.canvas = new Canvas(this.area);
      this.canvas.canvas = existingCanvas;
      this.canvas.ctx = existingCanvas.getContext('2d');
      this.canvas.ctx.lineWidth = 2;
      this.canvas.ctx.strokeStyle = 'black';
      this.canvas.resize();
      window.addEventListener('resize', () => this.canvas.resize());
    }

    // Setup YouTube IFrame API
    this.setupYouTubeAPI();
  }

  setupYouTubeAPI() {
    window.onYouTubeIframeAPIReady = () => {
      document.querySelectorAll('iframe[src*="youtube.com/embed"]').forEach((iframe) => {
        const id = iframe.id;
        if (!id) return;

        this.youtubePlayers[id] = new YT.Player(id, {
          events: {
            onReady: () => console.log(`Player ${id} ready.`),
          },
        });
      });
    };
  }

  createElement(data) {
    const el = this.elementManager.createElement(data, this.socket, false);
    this.area.appendChild(el);

    // Auto-play YouTube videos
    if (data.type === 'video') {
      setTimeout(() => {
        this.playYouTubeById(data.id);
      }, 2000);
    }
  }

  playYouTubeById(dataId, retries = 10) {
    const iframe = document.querySelector(`[data-id="${dataId}"] iframe`);
    if (!iframe) return;

    const iframeId = iframe.id;
    const player = this.youtubePlayers[iframeId];

    if (player && typeof player.playVideo === 'function') {
      player.playVideo();
    } else if (retries > 0) {
      setTimeout(() => this.playYouTubeById(dataId, retries - 1), 300);
    } else {
      console.warn(`YouTube player not available for ${iframeId}`);
    }
  }

  setupSocketHandlers() {
    // Initial state
    this.socket.on(SOCKET_EVENTS.INITIAL_STATE, (elements) => {
      elements.forEach((el) => this.createElement(el));
    });

    // Drawing
    this.socket.on(SOCKET_EVENTS.DRAW, ({ x, y }) => {
      if (this.firstPoint) {
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(x, y);
        this.firstPoint = false;
      } else {
        this.canvas.ctx.lineTo(x, y);
        this.canvas.ctx.stroke();
      }
    });

    this.socket.on(SOCKET_EVENTS.STOP_DRAW, () => {
      this.firstPoint = true;
    });

    // New element
    this.socket.on(SOCKET_EVENTS.NEW_ELEMENT, (data) => {
      this.createElement(data);
    });

    // Move element
    this.socket.on(SOCKET_EVENTS.MOVE_ELEMENT, ({ id, left, top }) => {
      this.elementManager.updatePosition(id, left, top);
    });

    // Resize element
    this.socket.on(SOCKET_EVENTS.RESIZE_ELEMENT, ({ id, width, height }) => {
      this.elementManager.updateSize(id, width, height);
    });

    // Edit element
    this.socket.on(SOCKET_EVENTS.EDIT_ELEMENT, (data) => {
      const el = document.querySelector(`[data-id="${data.id}"]`);
      if (el && el.dataset.type === 'texto') {
        el.textContent = data.content;
        el.style.color = data.color;
        el.style.fontSize = data.size;
        el.style.fontFamily = data.font;
      }
    });

    // Remove element
    this.socket.on(SOCKET_EVENTS.REMOVE_ELEMENT, ({ id }) => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) el.remove();
    });

    // Erase drawing
    this.socket.on(SOCKET_EVENTS.ERASE, ({ x, y }) => {
      this.canvas.erase(x, y, 15);
    });

    // Hide element
    this.socket.on(SOCKET_EVENTS.HIDE_ELEMENT, ({ id }) => {
      this.elementManager.hideElement(id, false);
    });

    // Show element
    this.socket.on(SOCKET_EVENTS.SHOW_ELEMENT, ({ id }) => {
      this.elementManager.showElement(id, false);
    });

    // Remove all
    this.socket.on(SOCKET_EVENTS.REMOVE_ALL, () => {
      document.querySelectorAll('.elemento').forEach((el) => el.remove());
      this.canvas.clear();
    });

    // Clear all drawings
    this.socket.on(SOCKET_EVENTS.ERASE_ALL, () => {
      this.canvas.clear();
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const showPage = new ShowPage();
  showPage.init();
});

export default ShowPage;
