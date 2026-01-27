/**
 * Canvas - Drawing canvas component
 */
export class Canvas {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.firstPoint = true;
  }

  /**
   * Create the canvas element
   * @returns {HTMLCanvasElement}
   */
  create() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'canvas-desenho';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '0';

    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'black';

    this.resize();
    window.addEventListener('resize', () => this.resize());

    return this.canvas;
  }

  /**
   * Resize canvas to match container
   */
  resize() {
    if (this.canvas && this.container) {
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;
    }
  }

  /**
   * Start drawing at a point
   * @param {number} x
   * @param {number} y
   */
  startDrawing(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.firstPoint = false;
  }

  /**
   * Draw to a point
   * @param {number} x
   * @param {number} y
   */
  drawTo(x, y) {
    if (this.firstPoint) {
      this.startDrawing(x, y);
    } else {
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }
  }

  /**
   * Handle remote drawing point
   * @param {number} x
   * @param {number} y
   */
  remoteDrawPoint(x, y) {
    if (this.firstPoint) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.firstPoint = false;
    } else {
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }
  }

  /**
   * Stop drawing (reset first point)
   */
  stopDrawing() {
    this.firstPoint = true;
  }

  /**
   * Erase at a point
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   */
  erase(x, y, radius = 10) {
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Clear the entire canvas
   */
  clear() {
    if (this.canvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.firstPoint = true;
    }
  }

  /**
   * Set stroke color
   * @param {string} color
   */
  setColor(color) {
    if (this.ctx) {
      this.ctx.strokeStyle = color;
    }
  }

  /**
   * Set line width
   * @param {number} width
   */
  setLineWidth(width) {
    if (this.ctx) {
      this.ctx.lineWidth = width;
    }
  }

  /**
   * Get the canvas element
   * @returns {HTMLCanvasElement}
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Get the canvas context
   * @returns {CanvasRenderingContext2D}
   */
  getContext() {
    return this.ctx;
  }
}
