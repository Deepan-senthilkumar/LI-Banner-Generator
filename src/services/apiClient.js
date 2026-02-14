import monitoringService from './monitoringService';

const DEFAULT_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS || 12000);

const withTimeout = async (promise, timeoutMs = DEFAULT_TIMEOUT) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
  return Promise.race([promise, timeout]);
};

const parseResponse = async (response) => {
  let payload = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const detail = typeof payload === 'object' && payload !== null
      ? payload.detail || payload.message || JSON.stringify(payload)
      : String(payload || 'Request failed');
    const err = new Error(detail);
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  return payload;
};

const request = async (url, options = {}) => {
  const method = options.method || 'GET';
  try {
    const response = await withTimeout(fetch(url, options), options.timeoutMs);
    return await parseResponse(response);
  } catch (error) {
    monitoringService.logError(error, { method, url });
    throw error;
  }
};

const apiClient = {
  request,

  get(url, options = {}) {
    return request(url, { ...options, method: 'GET' });
  },

  post(url, body, options = {}) {
    return request(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
    });
  },
};

export default apiClient;
