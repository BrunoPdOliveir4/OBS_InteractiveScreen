import { Element } from './Element.js';

/**
 * ImageElement - Image element component
 */
export class ImageElement extends Element {
  constructor(data) {
    super({ ...data, type: 'imagem' });
    this.imageElement = null;
  }

  /**
   * Create the image element
   * @returns {HTMLElement}
   */
  createElement() {
    const el = super.createElement();

    const img = document.createElement('img');
    img.src = this.content;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.alt = 'Image element';

    img.onerror = () => {
      img.src = '';
      img.alt = 'Failed to load image';
    };

    this.imageElement = img;
    el.appendChild(img);

    return el;
  }

  /**
   * Update image source
   * @param {string} src
   */
  setSource(src) {
    this.content = src;
    if (this.imageElement) {
      this.imageElement.src = src;
    }
  }
}
