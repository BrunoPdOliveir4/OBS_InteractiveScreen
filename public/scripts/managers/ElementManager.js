import { TextElement } from '../components/TextElement.js';
import { ImageElement } from '../components/ImageElement.js';
import { VideoElement } from '../components/VideoElement.js';

/**
 * ElementManager - Manages element CRUD operations
 */
export class ElementManager {
  constructor() {
    this.elements = new Map();
  }

  /**
   * Create an element based on type
   * @param {Object} data - Element data
   * @param {Object} socket - Socket instance for communication
   * @param {boolean} editable - Whether element should be editable
   * @returns {HTMLElement}
   */
  createElement(data, socket, editable = false) {
    let element;

    switch (data.type) {
      case 'texto':
        element = new TextElement(data);
        break;
      case 'imagem':
        element = new ImageElement(data);
        break;
      case 'video':
        element = new VideoElement(data);
        break;
      default:
        element = new TextElement(data);
    }

    const el = editable
      ? this.createEditableElement(element, socket)
      : element.createElement(data.type === 'video');

    this.elements.set(data.id, element);
    return el;
  }

  /**
   * Create an editable element with controls
   * @param {Element} elementInstance - Element instance
   * @param {Object} socket - Socket instance
   * @returns {HTMLElement}
   */
  createEditableElement(elementInstance, socket) {
    const el = elementInstance.createElement(true);
    let isResizing = false;
    const id = elementInstance.id;

    // Delete button
    const deleteBtn = this.createDeleteButton(id, el, socket);
    el.appendChild(deleteBtn);

    // Visibility button
    const visibilityBtn = this.createVisibilityButton(id, el, socket);
    el._toggleVisibilityBtn = visibilityBtn;
    el.appendChild(visibilityBtn);

    // Resizer
    const resizer = this.createResizer(id, el, socket, () => isResizing, (val) => { isResizing = val; });
    el.appendChild(resizer);

    // Move functionality
    this.attachMoveHandler(id, el, socket, () => isResizing);

    // Text editing for text elements
    if (elementInstance instanceof TextElement && elementInstance.textElement) {
      this.attachTextEditor(elementInstance, socket);
    }

    return el;
  }

  /**
   * Create delete button
   */
  createDeleteButton(id, el, socket) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.innerText = '\u00D7';
    deleteBtn.onclick = () => {
      el.remove();
      this.elements.delete(id);
      socket.emit('remover-elemento', { id });
    };
    return deleteBtn;
  }

  /**
   * Create visibility toggle button
   */
  createVisibilityButton(id, el, socket) {
    const btn = document.createElement('button');
    btn.className = 'hide';
    btn.innerText = '\uD83D\uDC41';
    let hidden = false;

    btn.onclick = () => {
      hidden = !hidden;

      if (hidden) {
        el.classList.add('hided');
        el.style.opacity = '0.5';
        btn.innerText = '\uD83D\uDEAB';
        socket.emit('ocultar-elemento', { id });
      } else {
        el.classList.remove('hided');
        el.style.opacity = '1';
        btn.innerText = '\uD83D\uDC41';
        socket.emit('mostrar-elemento', { id });
      }
    };

    return btn;
  }

  /**
   * Create resizer handle
   */
  createResizer(id, el, socket, getResizing, setResizing) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer';

    resizer.onmousedown = (e) => {
      setResizing(true);
      e.preventDefault();
      e.stopPropagation();

      const initialWidth = parseInt(el.style.width, 10);
      const initialHeight = parseInt(el.style.height, 10);
      const initialX = e.clientX;
      const initialY = e.clientY;
      const initialLeft = parseInt(el.style.left, 10);
      const initialTop = parseInt(el.style.top, 10);

      const resizeElement = (resizeEvent) => {
        const width = initialWidth + (resizeEvent.clientX - initialX);
        const height = initialHeight + (resizeEvent.clientY - initialY);

        if (width > 100) el.style.width = `${width}px`;
        if (height > 40) el.style.height = `${height}px`;

        el.style.left = `${initialLeft}px`;
        el.style.top = `${initialTop}px`;

        socket.emit('redimensionar-elemento', {
          id,
          width: parseInt(el.style.width, 10),
          height: parseInt(el.style.height, 10),
        });
      };

      const stopResize = () => {
        document.removeEventListener('mousemove', resizeElement);
        document.removeEventListener('mouseup', stopResize);
        setResizing(false);
      };

      document.addEventListener('mousemove', resizeElement);
      document.addEventListener('mouseup', stopResize);
    };

    return resizer;
  }

  /**
   * Attach move handler to element
   */
  attachMoveHandler(id, el, socket, getResizing) {
    el.onmousedown = (e) => {
      if (getResizing()) return;
      if (e.target.tagName === 'BUTTON' || e.target.classList.contains('resizer')) return;

      e.preventDefault();
      const offsetX = e.clientX - el.getBoundingClientRect().left;
      const offsetY = e.clientY - el.getBoundingClientRect().top;

      const moveElement = (moveEvent) => {
        el.style.left = `${moveEvent.clientX - offsetX}px`;
        el.style.top = `${moveEvent.clientY - offsetY}px`;
        socket.emit('mover-elemento', {
          id,
          left: parseInt(el.style.left, 10),
          top: parseInt(el.style.top, 10),
        });
      };

      const stopMove = () => {
        document.removeEventListener('mousemove', moveElement);
        document.removeEventListener('mouseup', stopMove);
      };

      document.addEventListener('mousemove', moveElement);
      document.addEventListener('mouseup', stopMove);
    };
  }

  /**
   * Attach text editor to text element
   */
  attachTextEditor(textElement, socket) {
    const editor = this.createTextEditor();
    editor.style.display = 'none';
    document.body.appendChild(editor);

    const textDiv = textElement.textElement;
    const id = textElement.id;

    textDiv.addEventListener('dblclick', () => {
      const input = editor.querySelector('input[type="text"]');
      const colorInput = editor.querySelector('input[type="color"]');
      const fontSelect = editor.querySelector('select');
      const sizeInput = editor.querySelector('input[type="number"]');

      input.value = textDiv.textContent;
      colorInput.value = textDiv.style.color || '#000000';
      fontSelect.value = textDiv.style.fontFamily || 'Arial';
      sizeInput.value = parseInt(textDiv.style.fontSize) || 16;

      editor.style.display = 'block';

      const rect = textDiv.getBoundingClientRect();
      editor.style.top = `${rect.top + window.scrollY + 20}px`;
      editor.style.left = `${rect.left + window.scrollX}px`;

      const saveBtn = editor.querySelector('button');
      saveBtn.onclick = () => {
        const newText = input.value;
        const newColor = colorInput.value;
        const newFont = fontSelect.value;
        const newSize = `${sizeInput.value}px`;

        textElement.updateContent({
          content: newText,
          color: newColor,
          font: newFont,
          size: newSize,
        });

        editor.style.display = 'none';

        socket.emit('editar-elemento', {
          id,
          content: newText,
          color: newColor,
          font: newFont,
          size: newSize,
        });
      };
    });
  }

  /**
   * Create text editor popup
   */
  createTextEditor() {
    const editor = document.createElement('div');
    editor.style.cssText = `
      position: absolute;
      height: auto;
      width: 300px;
      background-color: lightgray;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 999;
    `;

    const editText = document.createElement('input');
    editText.type = 'text';
    editText.placeholder = 'Escreva o novo texto';

    const editFont = document.createElement('select');
    ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'].forEach(font => {
      const option = document.createElement('option');
      option.value = font;
      option.textContent = font;
      editFont.appendChild(option);
    });

    const editSize = document.createElement('input');
    editSize.type = 'number';
    editSize.placeholder = 'Tamanho da fonte (px)';
    editSize.min = 8;
    editSize.max = 100;

    const editColor = document.createElement('input');
    editColor.type = 'color';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar';

    editor.append(editText, editFont, editSize, editColor, saveBtn);
    return editor;
  }

  /**
   * Create eraser visual indicator
   */
  createEraser() {
    const eraser = document.createElement('div');
    eraser.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid red;
      pointer-events: none;
      z-index: 9999;
      display: none;
    `;
    return eraser;
  }

  /**
   * Get element by ID
   * @param {string} id
   * @returns {Element}
   */
  getElement(id) {
    return this.elements.get(id);
  }

  /**
   * Remove element by ID
   * @param {string} id
   */
  removeElement(id) {
    const element = this.elements.get(id);
    if (element) {
      element.remove();
      this.elements.delete(id);
    }
  }

  /**
   * Clear all elements
   */
  clearAll() {
    this.elements.forEach(element => element.remove());
    this.elements.clear();
  }

  /**
   * Update element position
   * @param {string} id
   * @param {number} left
   * @param {number} top
   */
  updatePosition(id, left, top) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    }
  }

  /**
   * Update element size
   * @param {string} id
   * @param {number} width
   * @param {number} height
   */
  updateSize(id, width, height) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
    }
  }

  /**
   * Update text element content
   * @param {string} id
   * @param {Object} data
   */
  updateTextContent(id, data) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el && el.dataset.type === 'texto') {
      const textEl = el.querySelector('#textoDiv');
      if (textEl) {
        if (data.content !== undefined) textEl.textContent = data.content;
        if (data.color !== undefined) textEl.style.color = data.color;
        if (data.size !== undefined) textEl.style.fontSize = data.size;
        if (data.font !== undefined) textEl.style.fontFamily = data.font;
      }
    }
  }

  /**
   * Hide element
   * @param {string} id
   * @param {boolean} isEditor - Whether this is the editor view
   */
  hideElement(id, isEditor = false) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      if (isEditor) {
        el.classList.add('hided');
        el.style.opacity = '0.5';
        if (el._toggleVisibilityBtn) {
          el._toggleVisibilityBtn.innerText = '\uD83D\uDEAB';
        }
      } else {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }
    }
  }

  /**
   * Show element
   * @param {string} id
   * @param {boolean} isEditor - Whether this is the editor view
   */
  showElement(id, isEditor = false) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      if (isEditor) {
        el.classList.remove('hided');
        el.style.opacity = '1';
        if (el._toggleVisibilityBtn) {
          el._toggleVisibilityBtn.innerText = '\uD83D\uDC41';
        }
      } else {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      }
    }
  }
}

export const elementManager = new ElementManager();
