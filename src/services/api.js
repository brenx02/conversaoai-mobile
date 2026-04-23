/**
 * ConversãoAI Mobile — API Service
 * Axios com interceptors: auth + refresh automático + retry
 */
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.conversaoai.com.br/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,  // 30s timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Request ID para rastreamento
    config.headers['X-Request-ID'] = `mob-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR (auto refresh) ─────────────────────────────────
let isRefreshing  = false;
let failedQueue   = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se 401 e não é tentativa de refresh nem de login
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        // Enfileira a requisição
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Importação lazy para evitar circular dependency
        const { useAuthStore } = require('../store/auth.store');
        const newToken = await useAuthStore.getState().silentRefresh();
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Token expirado — faz logout
        const { useAuthStore } = require('../store/auth.store');
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Formata o erro
    const apiError = {
      message:    error.response?.data?.message || error.message || 'Erro desconhecido',
      error:      error.response?.data?.error   || 'UNKNOWN_ERROR',
      status:     error.response?.status,
      upgrade:    error.response?.data?.upgrade || false,
      errors:     error.response?.data?.errors  || [],
    };

    return Promise.reject(apiError);
  }
);

// ─── HELPERS ──────────────────────────────────────────────────────────────

export const aiAPI = {
  // Chat
  createSession:    (data)  => api.post('/ai/chat/session', data),
  chat:             (data)  => api.post('/ai/chat', data),

  // Análises
  analyzeCreative:  (data)  => api.post('/ai/analyze/creative', data),
  analyzePage:      (data)  => api.post('/ai/analyze/landing-page', data),
  analyzeTraffic:   (data)  => api.post('/ai/analyze/traffic', data),
  abTest:           (data)  => api.post('/ai/analyze/ab-test', data),

  // Geração
  generateCopy:     (data)  => api.post('/ai/generate/copy', data),
  createCampaign:   (data)  => api.post('/ai/create/campaign', data),
  validateIdea:     (data)  => api.post('/ai/validate/idea', data),
};

export const authAPI = {
  login:        (data)  => api.post('/auth/login', data),
  register:     (data)  => api.post('/auth/register', data),
  loginGoogle:  (data)  => api.post('/auth/google', data),
  me:           ()      => api.get('/auth/me'),
  refresh:      (data)  => api.post('/auth/refresh', data),
  logout:       (data)  => api.post('/auth/logout', data),
};

export const analysisAPI = {
  list:        (params) => api.get('/analyses', { params }),
  getById:     (id)     => api.get(`/analyses/${id}`),
  delete:      (id)     => api.delete(`/analyses/${id}`),
  toggleFav:   (id)     => api.patch(`/analyses/${id}/favorite`),
  favorites:   ()       => api.get('/analyses/favorites'),
};

export const copyAPI = {
  list:        (params) => api.get('/copies', { params }),
  getById:     (id)     => api.get(`/copies/${id}`),
  delete:      (id)     => api.delete(`/copies/${id}`),
  toggleFav:   (id)     => api.patch(`/copies/${id}/favorite`),
};

export const billingAPI = {
  getPlans:      ()         => api.get('/billing/plans'),
  subscribe:     (data)     => api.post('/billing/subscribe', data),
  cancel:        ()         => api.post('/billing/cancel'),
  portal:        ()         => api.post('/billing/portal'),
  usage:         ()         => api.get('/billing/usage'),
};

export const userAPI = {
  updateProfile: (data)    => api.patch('/users/profile', data),
  changePassword:(data)    => api.patch('/users/password', data),
  deleteAccount: ()        => api.delete('/users/account'),
  registerDevice:(data)    => api.post('/users/devices', data),
};

export default api;
