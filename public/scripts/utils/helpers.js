/**
 * Frontend helper functions
 */

/**
 * Generate a unique element ID
 * @returns {string}
 */
export const generateElementId = () => {
  return `el-${Date.now()}`;
};

/**
 * Get URL parameters as an object
 * @returns {Object}
 */
export const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Redirect to a URL
 * @param {string} url
 */
export const redirect = (url) => {
  window.location.href = url;
};

/**
 * Debounce a function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle a function
 * @param {Function} func
 * @param {number} limit
 * @returns {Function}
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Parse YouTube video ID from URL
 * @param {string} url
 * @returns {string|null}
 */
export const parseYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Check if URL is a YouTube video
 * @param {string} url
 * @returns {boolean}
 */
export const isYouTubeUrl = (url) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

/**
 * Create an element with attributes
 * @param {string} tag
 * @param {Object} attributes
 * @param {string} content
 * @returns {HTMLElement}
 */
export const createElement = (tag, attributes = {}, content = '') => {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'className') {
      el.className = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  if (content) {
    el.textContent = content;
  }
  return el;
};

/**
 * Wait for a specified time
 * @param {number} ms
 * @returns {Promise}
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
