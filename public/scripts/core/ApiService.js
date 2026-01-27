/**
 * ApiService - HTTP API wrapper
 */
export class ApiService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<any>}
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @param {Object} options - Fetch options
   * @returns {Promise<any>}
   */
  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Make a DELETE request
   * @param {string} url - Request URL
   * @param {Object} data - Request body
   * @param {Object} options - Fetch options
   * @returns {Promise<any>}
   */
  async delete(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'DELETE',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Make an HTTP request
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<any>}
   */
  async request(url, options = {}) {
    const fullUrl = this.baseUrl + url;

    try {
      const response = await fetch(fullUrl, options);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

// Global API service instance
export const apiService = new ApiService();
