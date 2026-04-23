/**
 * ConversãoAI Mobile — Auth Store (Zustand)
 * Gerencia autenticação com SecureStore
 */
import { create }      from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api              from '../services/api';

const KEYS = {
  ACCESS:  'cai_access_token',
  REFRESH: 'cai_refresh_token',
  USER:    'cai_user',
};

export const useAuthStore = create((set, get) => ({
  user:            null,
  accessToken:     null,
  refreshToken:    null,
  isAuthenticated: false,
  isLoading:       true,

  // ─── INITIALIZE (restaura sessão) ──────────────────────────────────────
  initialize: async () => {
    try {
      const [access, refresh, userStr] = await Promise.all([
        SecureStore.getItemAsync(KEYS.ACCESS),
        SecureStore.getItemAsync(KEYS.REFRESH),
        SecureStore.getItemAsync(KEYS.USER),
      ]);

      if (access && refresh && userStr) {
        const user = JSON.parse(userStr);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        set({ user, accessToken: access, refreshToken: refresh, isAuthenticated: true });

        // Tenta renovar o token em background
        get().silentRefresh().catch(() => {});
      }
    } catch (e) {
      console.warn('Auth init error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── LOGIN ─────────────────────────────────────────────────────────────
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    await get()._persist(accessToken, refreshToken, user);
    return user;
  },

  // ─── REGISTER ──────────────────────────────────────────────────────────
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { accessToken, refreshToken, user } = response.data;
    await get()._persist(accessToken, refreshToken, user);
    return user;
  },

  // ─── GOOGLE LOGIN ───────────────────────────────────────────────────────
  loginWithGoogle: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    const { accessToken, refreshToken, user } = response.data;
    await get()._persist(accessToken, refreshToken, user);
    return user;
  },

  // ─── LOGOUT ────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      const { refreshToken } = get();
      await api.post('/auth/logout', { refreshToken }).catch(() => {});
    } finally {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.ACCESS),
        SecureStore.deleteItemAsync(KEYS.REFRESH),
        SecureStore.deleteItemAsync(KEYS.USER),
      ]);
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    }
  },

  // ─── SILENT REFRESH ────────────────────────────────────────────────────
  silentRefresh: async () => {
    const { refreshToken } = get();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken: newAccess, refreshToken: newRefresh } = response.data;

    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS,  newAccess),
      SecureStore.setItemAsync(KEYS.REFRESH, newRefresh),
    ]);

    api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
    set({ accessToken: newAccess, refreshToken: newRefresh });
    return newAccess;
  },

  // ─── UPDATE USER ────────────────────────────────────────────────────────
  updateUser: async (updates) => {
    const user = { ...get().user, ...updates };
    await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user));
    set({ user });
  },

  // ─── INTERNAL PERSIST ──────────────────────────────────────────────────
  _persist: async (accessToken, refreshToken, user) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS,  accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH, refreshToken),
      SecureStore.setItemAsync(KEYS.USER,    JSON.stringify(user)),
    ]);
    set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
  },
}));
