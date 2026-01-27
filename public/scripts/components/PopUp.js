/**
 * PopUp - Notification popup component
 */
export class PopUp {
  constructor() {
    this.timeout = null;
  }

  /**
   * Show a popup message
   * @param {string} message - Message to display
   * @param {boolean} isError - Whether this is an error message
   * @param {number} duration - Duration in milliseconds
   */
  show(message, isError = false, duration = 3000) {
    const popup = document.getElementById('popup');
    const messageElement = document.getElementById('popup-message');

    if (!popup || !messageElement) {
      console.warn('Popup elements not found in DOM');
      return;
    }

    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Set message and style
    messageElement.textContent = message;
    popup.style.backgroundColor = isError ? '#d9534f' : '#5cb85c';

    // Show popup
    popup.classList.remove('hidden');
    popup.classList.add('show');

    // Auto-hide after duration
    this.timeout = setTimeout(() => {
      this.hide();
    }, duration);
  }

  /**
   * Hide the popup
   */
  hide() {
    const popup = document.getElementById('popup');
    if (popup) {
      popup.classList.remove('show');
      popup.classList.add('hidden');
    }
  }

  /**
   * Show a success message
   * @param {string} message
   * @param {number} duration
   */
  success(message, duration = 3000) {
    this.show(message, false, duration);
  }

  /**
   * Show an error message
   * @param {string} message
   * @param {number} duration
   */
  error(message, duration = 3000) {
    this.show(message, true, duration);
  }
}

// Helper function for backwards compatibility
export const showPopup = (message, isError = false) => {
  const popup = new PopUp();
  popup.show(message, isError);
};

// Global popup instance
export const popup = new PopUp();
