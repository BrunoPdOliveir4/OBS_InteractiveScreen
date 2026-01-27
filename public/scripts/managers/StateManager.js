/**
 * StateManager - Manages local state and localStorage operations
 */
export class StateManager {
  constructor() {
    this.state = {};
  }

  /**
   * Get a value from state
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set a value in state
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    this.state[key] = value;
  }

  /**
   * Delete a value from state
   * @param {string} key
   */
  delete(key) {
    delete this.state[key];
  }

  /**
   * Clear all state
   */
  clear() {
    this.state = {};
  }

  /**
   * Get value from localStorage
   * @param {string} key
   * @returns {string|null}
   */
  getLocal(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  }

  /**
   * Set value in localStorage
   * @param {string} key
   * @param {string} value
   */
  setLocal(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  }

  /**
   * Remove value from localStorage
   * @param {string} key
   */
  removeLocal(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }

  /**
   * Get JSON value from localStorage
   * @param {string} key
   * @returns {*}
   */
  getLocalJSON(key) {
    const value = this.getLocal(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Error parsing JSON from localStorage:', e);
      }
    }
    return null;
  }

  /**
   * Set JSON value in localStorage
   * @param {string} key
   * @param {*} value
   */
  setLocalJSON(key, value) {
    try {
      this.setLocal(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error stringifying JSON for localStorage:', e);
    }
  }

  /**
   * Get URL parameters
   * @returns {URLSearchParams}
   */
  getUrlParams() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Get a specific URL parameter
   * @param {string} name
   * @returns {string|null}
   */
  getUrlParam(name) {
    return this.getUrlParams().get(name);
  }

  /**
   * Get the current user's login from localStorage
   * @returns {string|null}
   */
  getCurrentUser() {
    return this.getLocal('login');
  }

  /**
   * Get the access token from localStorage
   * @returns {string|null}
   */
  getAccessToken() {
    return this.getLocal('access_token');
  }

  /**
   * Save user credentials to localStorage
   * @param {string} login
   * @param {string} accessToken
   */
  saveCredentials(login, accessToken) {
    this.setLocal('login', login);
    this.setLocal('access_token', accessToken);
  }

  /**
   * Clear user credentials from localStorage
   */
  clearCredentials() {
    this.removeLocal('login');
    this.removeLocal('access_token');
  }
}

export const stateManager = new StateManager();
