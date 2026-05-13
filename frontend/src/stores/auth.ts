import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../types/index.js';
import { authApi } from '../api/index.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const role = computed(() => user.value?.role ?? null);

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    token.value = res.data.token;
    user.value = res.data.user;
    localStorage.setItem('token', res.data.token);
  }

  async function fetchMe() {
    if (!token.value) return;
    try {
      const res = await authApi.me();
      user.value = res.data.user as unknown as User;
    } catch {
      logout();
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  return { token, user, isAuthenticated, role, login, fetchMe, logout };
});
