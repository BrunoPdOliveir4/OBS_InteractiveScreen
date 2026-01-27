/**
 * Base Element class for interactive elements
 */
export class Element {
  constructor(data) {
    this.id = data.id;
    this.type = data.type || 'texto';
    this.content = data.content || '';
    this.left = data.left || 100;
    this.top = data.top || 100;
    this.width = data.width || 200;
    this.height = data.height || 60;
    this.element = null;
  }

  /**
   * Create the DOM element
   * @returns {HTMLElement}
   */
  createElement() {
    const el = document.createElement('div');
    el.className = 'elemento';
    el.setAttribute('data-id', this.id);
    el.setAttribute('data-type', this.type);
    el.style.left = `${this.left}px`;
    el.style.top = `${this.top}px`;
    el.style.width = `${this.width}px`;
    el.style.height = `${this.height}px`;

    this.element = el;
    return el;
  }

  /**
   * Update element position
   * @param {number} left
   * @param {number} top
   */
  setPosition(left, top) {
    this.left = left;
    this.top = top;
    if (this.element) {
      this.element.style.left = `${left}px`;
      this.element.style.top = `${top}px`;
    }
  }

  /**
   * Update element size
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
    if (this.element) {
      this.element.style.width = `${width}px`;
      this.element.style.height = `${height}px`;
    }
  }

  /**
   * Remove the element from DOM
   */
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Get element data
   * @returns {Object}
   */
  getData() {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
    };
  }
}
