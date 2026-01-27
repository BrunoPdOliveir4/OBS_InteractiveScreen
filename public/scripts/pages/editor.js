import { socketService } from '../core/SocketService.js';
import { apiService } from '../core/ApiService.js';
import { eventBus } from '../core/EventBus.js';
import { ElementManager } from '../managers/ElementManager.js';
import { DrawingManager } from '../managers/DrawingManager.js';
import { stateManager } from '../managers/StateManager.js';
import { showPopup } from '../components/PopUp.js';
import { generateElementId, redirect } from '../utils/helpers.js';
import { ROUTES, SOCKET_EVENTS } from '../utils/constants.js';

class EditorPage {
  constructor() {
    this.elementManager = new ElementManager();
    this.drawingManager = null;
    this.socket = null;
    this.userParam = stateManager.getUrlParam('user');
    this.loggedUser = stateManager.getCurrentUser();
    this.area = null;
    this.twitchEmbed = null;
    this.twitchEmbedContainer = null;
    this.liveClickable = false;
  }

  async init() {
    // Validate access
    if (!await this.validateAccess()) {
      return;
    }

    // Initialize socket
    this.initSocket();

    // Initialize DOM elements
    this.initDom();

    // Initialize drawing
    this.initDrawing();

    // Setup event listeners
    this.setupEventListeners();

    // Setup socket handlers
    this.setupSocketHandlers();
  }

  async validateAccess() {
    if (!this.userParam) {
      showPopup('Acesso nao autorizado', true);
      redirect(ROUTES.LOGIN);
      return false;
    }

    if (this.userParam !== this.loggedUser) {
      try {
        const result = await apiService.get(
          `/whitelist?username=${this.loggedUser}&check=${this.userParam}`
        );

        if (!result.whitelisted) {
          showPopup('Acesso nao autorizado', true);
          redirect(ROUTES.LOGIN);
          return false;
        }
      } catch (error) {
        console.error('Whitelist check error:', error);
        showPopup('Acesso nao autorizado', true);
        redirect(ROUTES.LOGIN);
        return false;
      }
    }

    return true;
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

    // Create eraser visual
    const eraser = this.elementManager.createEraser();
    document.body.appendChild(eraser);

    // Create Twitch iframe
    this.createTwitchEmbed();
  }

  createTwitchEmbed() {
    const embedContainer = document.getElementById('twitch-embed');
    if (!embedContainer) return;

    // Style the container
    embedContainer.style.position = 'absolute';
    embedContainer.style.top = '0';
    embedContainer.style.left = '0';
    embedContainer.style.zIndex = '-1';
    embedContainer.style.pointerEvents = 'none';
    embedContainer.style.opacity = '0.5';
    embedContainer.style.width = `${this.area.clientWidth}px`;
    embedContainer.style.height = `${this.area.clientHeight}px`;

    // Get parent domain for embed
    const parentDomain = window.location.hostname;

    // Create Twitch embed using SDK
    // The SDK automatically handles user authentication if they're logged into Twitch
    // Subscribers will get ad-free viewing automatically
    this.twitchEmbed = new Twitch.Embed('twitch-embed', {
      width: '100%',
      height: '100%',
      channel: this.userParam,
      parent: [parentDomain, 'obs-interactivescreen.onrender.com'],
      layout: 'video',
      autoplay: true,
      muted: false,
    });

    this.twitchEmbedContainer = embedContainer;

    // Resize when window resizes
    window.addEventListener('resize', () => this.resizeTwitchEmbed());
  }

  resizeTwitchEmbed() {
    if (this.twitchEmbedContainer && this.area) {
      this.twitchEmbedContainer.style.width = `${this.area.clientWidth}px`;
      this.twitchEmbedContainer.style.height = `${this.area.clientHeight}px`;
    }
  }

  toggleLiveClickable() {
    this.liveClickable = !this.liveClickable;
    if (this.twitchEmbedContainer) {
      this.twitchEmbedContainer.style.pointerEvents = this.liveClickable ? 'auto' : 'none';
      this.twitchEmbedContainer.style.zIndex = this.liveClickable ? '10' : '-1';
    }
    return this.liveClickable;
  }

  initDrawing() {
    this.drawingManager = new DrawingManager(this.area);
    const canvas = this.drawingManager.init(this.socket);
    this.area.appendChild(canvas);

    // Set eraser element
    const eraser = document.querySelector('[style*="border: 2px solid red"]');
    if (eraser) {
      this.drawingManager.setEraserElement(eraser);
    }

    // Track eraser movement
    document.addEventListener('mousemove', (e) => {
      this.drawingManager.updateEraserPosition(e.clientX, e.clientY);
    });
  }

  setupEventListeners() {
    // Drawing button
    document.getElementById('btn-desenhar')?.addEventListener('click', () => {
      const isDrawing = this.drawingManager.toggleDrawingMode();
      this.updateButtonState('btn-erase', false);
    });

    // Erase button
    document.getElementById('btn-erase')?.addEventListener('click', () => {
      const isErasing = this.drawingManager.toggleEraseMode();
      this.updateButtonState('btn-erase', isErasing);
    });

    // Clear drawings button
    document.getElementById('btn-erase-all')?.addEventListener('click', () => {
      this.drawingManager.clearAll();
    });

    // Add text button
    document.getElementById('btn-add-texto')?.addEventListener('click', () => {
      this.addTextElement();
    });

    // Add image button
    document.getElementById('btn-add-img')?.addEventListener('click', () => {
      this.addImageElement();
    });

    // Add video button
    document.getElementById('btn-add-video')?.addEventListener('click', () => {
      this.addVideoElement();
    });

    // Delete all button
    document.getElementById('btn-delete-all')?.addEventListener('click', () => {
      this.deleteAllElements();
    });

    // Toggle live clickable button
    document.getElementById('btn-toggle-live')?.addEventListener('click', () => {
      const isClickable = this.toggleLiveClickable();
      this.updateButtonState('btn-toggle-live', isClickable);
    });
  }

  updateButtonState(buttonId, active) {
    const btn = document.getElementById(buttonId);
    if (btn) {
      btn.style.backgroundColor = active ? '#fff' : '';
    }
  }

  addTextElement() {
    const texto = prompt('Texto:');
    if (texto) {
      const id = generateElementId();
      const data = { id, type: 'texto', content: texto, width: 200, height: 60 };
      this.createElement(data);
      this.socket.emit(SOCKET_EVENTS.NEW_ELEMENT, data);
    }
  }

  addImageElement() {
    const url = prompt('URL da imagem:');
    if (url) {
      const id = generateElementId();
      const data = { id, type: 'imagem', content: url, width: 300, height: 200 };
      this.createElement(data);
      this.socket.emit(SOCKET_EVENTS.NEW_ELEMENT, data);
    }
  }

  addVideoElement() {
    const url = prompt('URL do video:');
    if (url) {
      const id = generateElementId();
      const data = { id, type: 'video', content: url, width: 320, height: 240 };
      this.createElement(data);
      this.socket.emit(SOCKET_EVENTS.NEW_ELEMENT, data);
    }
  }

  deleteAllElements() {
    document.querySelectorAll('.elemento').forEach((el) => el.remove());
    this.drawingManager.getCanvas().clear();
    this.socket.emit(SOCKET_EVENTS.REMOVE_ALL);
  }

  createElement(data) {
    const el = this.elementManager.createElement(data, this.socket, true);
    this.area.appendChild(el);
  }

  setupSocketHandlers() {
    // Initial state
    this.socket.on(SOCKET_EVENTS.INITIAL_STATE, (elements) => {
      elements.forEach((el) => this.createElement(el));
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
      this.elementManager.updateTextContent(data.id, data);
    });

    // Remove element
    this.socket.on(SOCKET_EVENTS.REMOVE_ELEMENT, ({ id }) => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) el.remove();
    });

    // Remove all
    this.socket.on(SOCKET_EVENTS.REMOVE_ALL, () => {
      document.querySelectorAll('.elemento').forEach((el) => el.remove());
      this.drawingManager.getCanvas().clear();
    });

    // Hide element
    this.socket.on(SOCKET_EVENTS.HIDE_ELEMENT, ({ id }) => {
      this.elementManager.hideElement(id, true);
    });

    // Show element
    this.socket.on(SOCKET_EVENTS.SHOW_ELEMENT, ({ id }) => {
      this.elementManager.showElement(id, true);
    });

    // Clear all drawings
    this.socket.on(SOCKET_EVENTS.ERASE_ALL, () => {
      this.drawingManager.getCanvas().clear();
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const editor = new EditorPage();
  editor.init();
});

export default EditorPage;
