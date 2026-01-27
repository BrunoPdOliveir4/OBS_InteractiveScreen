import { Element } from './Element.js';

/**
 * TextElement - Text element component
 */
export class TextElement extends Element {
  constructor(data) {
    super({ ...data, type: 'texto' });
    this.color = data.color || '#000000';
    this.fontSize = data.fontSize || '16px';
    this.fontFamily = data.fontFamily || 'Arial';
    this.textElement = null;
  }

  /**
   * Create the text element
   * @param {boolean} editable - Whether element is editable
   * @returns {HTMLElement}
   */
  createElement(editable = false) {
    const el = super.createElement();

    const textDiv = document.createElement('div');
    textDiv.id = 'textoDiv';
    textDiv.className = 'texto';
    textDiv.textContent = this.content;
    textDiv.style.width = '100%';
    textDiv.style.height = '100%';
    textDiv.style.overflow = 'hidden';
    textDiv.style.textOverflow = 'ellipsis';
    textDiv.style.whiteSpace = 'nowrap';
    textDiv.style.color = this.color;
    textDiv.style.fontSize = this.fontSize;
    textDiv.style.fontFamily = this.fontFamily;

    if (editable) {
      textDiv.style.cursor = 'text';
    }

    this.textElement = textDiv;
    el.appendChild(textDiv);

    return el;
  }

  /**
   * Update text content and styles
   * @param {Object} data
   */
  updateContent(data) {
    if (data.content !== undefined) {
      this.content = data.content;
      if (this.textElement) {
        this.textElement.textContent = data.content;
      }
    }
    if (data.color !== undefined) {
      this.color = data.color;
      if (this.textElement) {
        this.textElement.style.color = data.color;
      }
    }
    if (data.size !== undefined) {
      this.fontSize = data.size;
      if (this.textElement) {
        this.textElement.style.fontSize = data.size;
      }
    }
    if (data.font !== undefined) {
      this.fontFamily = data.font;
      if (this.textElement) {
        this.textElement.style.fontFamily = data.font;
      }
    }
  }

  /**
   * Get text element data
   * @returns {Object}
   */
  getData() {
    return {
      ...super.getData(),
      color: this.color,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
    };
  }
}
