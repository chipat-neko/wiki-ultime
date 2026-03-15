import { CacheManager, CACHE_KEYS } from '../core/CacheManager.js';

const DEFAULT_TIMEOUT = 15000;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') throw new ApiError('Request timed out', 408);
    throw err;
  }
}

class ApiServiceClass {
  constructor() {
    this._headers = { 'Content-Type': 'application/json' };
    this._interceptors = { request: [], response: [] };
  }

  setHeader(key, value) {
    this._headers[key] = value;
    return this;
  }

  removeHeader(key) {
    delete this._headers[key];
    return this;
  }

  addRequestInterceptor(fn) {
    this._interceptors.request.push(fn);
    return this;
  }

  addResponseInterceptor(fn) {
    this._interceptors.response.push(fn);
    return this;
  }

  async _applyRequestInterceptors(config) {
    let c = config;
    for (const fn of this._interceptors.request) {
      c = await fn(c);
    }
    return c;
  }

  async _applyResponseInterceptors(response) {
    let r = response;
    for (const fn of this._interceptors.response) {
      r = await fn(r);
    }
    return r;
  }

  async request(url, options = {}) {
    const config = await this._applyRequestInterceptors({
      url,
      method: options.method || 'GET',
      headers: { ...this._headers, ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined,
      timeout: options.timeout || DEFAULT_TIMEOUT,
    });

    const fetchOptions = {
      method: config.method,
      headers: config.headers,
    };
    if (config.body) fetchOptions.body = config.body;

    const res = await fetchWithTimeout(config.url, fetchOptions, config.timeout);

    if (!res.ok) {
      let errorData;
      try { errorData = await res.json(); } catch { errorData = null; }
      throw new ApiError(`HTTP ${res.status}: ${res.statusText}`, res.status, errorData);
    }

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    const processed = await this._applyResponseInterceptors(data);
    return processed;
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, body, options = {}) {
    return this.request(url, { ...options, method: 'POST', body });
  }

  async put(url, body, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * GET with LRU cache support.
   * @param {string} url
   * @param {string} cacheKey
   * @param {number} ttl - milliseconds
   */
  async getCached(url, cacheKey, ttl) {
    return CacheManager.getOrFetch(cacheKey, () => this.get(url), ttl);
  }
}

export const ApiService = new ApiServiceClass();
export { ApiError };
export default ApiService;
