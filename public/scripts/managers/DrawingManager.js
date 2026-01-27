import { Canvas } from '../components/Canvas.js';

/**
 * DrawingManager - Manages drawing operations
 */
export class DrawingManager {
  constructor(container) {
    this.canvas = new Canvas(container);
    this.socket = null;
    this.drawingMode = false;
    this.eraseMode = false;
    this.isDrawing = false;
    this.isErasing = false;
    this.eraserElement = null;
  }

  /**
   * Initialize the drawing manager
   * @param {Object} socket - Socket instance
   * @returns {HTMLCanvasElement}
   */
  init(socket) {
    this.socket = socket;
    const canvasEl = this.canvas.create();

    this.attachCanvasEvents(canvasEl);
    this.setupSocketHandlers();

    return canvasEl;
  }

  /**
   * Attach canvas event handlers
   */
  attachCanvasEvents(canvasEl) {
    canvasEl.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    canvasEl.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    canvasEl.addEventListener('mouseup', () => this.handleMouseUp());
    canvasEl.addEventListener('mouseout', () => this.handleMouseUp());
    canvasEl.addEventListener('mouseleave', () => this.handleMouseUp());
  }

  /**
   * Setup socket event handlers
   */
  setupSocketHandlers() {
    if (!this.socket) return;

    this.socket.on('desenho', ({ x, y }) => {
      this.canvas.remoteDrawPoint(x, y);
    });

    this.socket.on('parou-desenho', () => {
      this.canvas.stopDrawing();
    });

    this.socket.on('apagar', ({ x, y }) => {
      if (!this.eraseMode) {
        this.canvas.erase(x, y, 15);
      }
    });

    this.socket.on('apagar-tudo', () => {
      this.canvas.clear();
    });
  }

  /**
   * Handle mouse down
   */
  handleMouseDown(e) {
    if (this.eraseMode) {
      this.isErasing = true;
      this.canvas.erase(e.offsetX, e.offsetY);
      if (this.socket) {
        this.socket.emit('apagar', { x: e.offsetX, y: e.offsetY });
      }
    } else if (this.drawingMode) {
      this.isDrawing = true;
      this.canvas.startDrawing(e.offsetX, e.offsetY);
      if (this.socket) {
        this.socket.emit('desenho', { x: e.offsetX, y: e.offsetY });
      }
    }
  }

  /**
   * Handle mouse move
   */
  handleMouseMove(e) {
    if (this.isDrawing && this.drawingMode) {
      this.canvas.drawTo(e.offsetX, e.offsetY);
      if (this.socket) {
        this.socket.emit('desenho', { x: e.offsetX, y: e.offsetY });
      }
    } else if (this.isErasing && this.eraseMode) {
      this.canvas.erase(e.offsetX, e.offsetY);
      if (this.socket) {
        this.socket.emit('apagar', { x: e.offsetX, y: e.offsetY });
      }
    }
  }

  /**
   * Handle mouse up
   */
  handleMouseUp() {
    if (this.isDrawing) {
      this.isDrawing = false;
      if (this.socket) {
        this.socket.emit('parou-desenho');
      }
    }
    this.isErasing = false;
  }

  /**
   * Toggle drawing mode
   * @returns {boolean} New drawing mode state
   */
  toggleDrawingMode() {
    this.drawingMode = !this.drawingMode;
    if (this.drawingMode) {
      this.eraseMode = false;
      this.hideEraser();
    }
    this.canvas.stopDrawing();
    return this.drawingMode;
  }

  /**
   * Toggle erase mode
   * @returns {boolean} New erase mode state
   */
  toggleEraseMode() {
    this.eraseMode = !this.eraseMode;
    if (this.eraseMode) {
      this.drawingMode = false;
      this.showEraser();
      document.body.style.cursor = 'none';
    } else {
      this.hideEraser();
      document.body.style.cursor = '';
    }
    return this.eraseMode;
  }

  /**
   * Set eraser element
   * @param {HTMLElement} eraser
   */
  setEraserElement(eraser) {
    this.eraserElement = eraser;
  }

  /**
   * Show eraser visual
   */
  showEraser() {
    if (this.eraserElement) {
      this.eraserElement.style.display = 'block';
    }
  }

  /**
   * Hide eraser visual
   */
  hideEraser() {
    if (this.eraserElement) {
      this.eraserElement.style.display = 'none';
    }
  }

  /**
   * Update eraser position
   * @param {number} x
   * @param {number} y
   */
  updateEraserPosition(x, y) {
    if (this.eraserElement && this.eraseMode) {
      this.eraserElement.style.left = `${x - 10}px`;
      this.eraserElement.style.top = `${y - 10}px`;
    }
  }

  /**
   * Clear all drawings
   */
  clearAll() {
    this.canvas.clear();
    if (this.socket) {
      this.socket.emit('apagar-tudo');
    }
  }

  /**
   * Get drawing mode state
   * @returns {boolean}
   */
  isDrawingMode() {
    return this.drawingMode;
  }

  /**
   * Get erase mode state
   * @returns {boolean}
   */
  isEraseMode() {
    return this.eraseMode;
  }

  /**
   * Get canvas instance
   * @returns {Canvas}
   */
  getCanvas() {
    return this.canvas;
  }
}
