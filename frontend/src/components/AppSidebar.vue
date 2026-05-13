<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();
const collapsed = ref(false);

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <div class="sidebar-header">
      <span class="sidebar-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span v-if="!collapsed" class="sidebar-brand">Vacation Mgmt</span>
      <button class="collapse-btn" @click="collapsed = !collapsed" aria-label="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-if="auth.role === 'requester'"
        to="/requests"
        class="nav-item"
        active-class="nav-item--active"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span v-if="!collapsed" class="nav-label">My Requests</span>
      </RouterLink>

      <RouterLink
        v-if="auth.role === 'validator'"
        to="/dashboard"
        class="nav-item"
        active-class="nav-item--active"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span v-if="!collapsed" class="nav-label">Dashboard</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">{{ auth.user?.name?.charAt(0) ?? '?' }}</div>
        <div v-if="!collapsed" class="user-details">
          <span class="user-name">{{ auth.user?.name }}</span>
          <span class="user-role">{{ auth.user?.role }}</span>
        </div>
      </div>
      <button v-if="!collapsed" class="btn btn-ghost signout-btn" @click="logout">Sign out</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: #1e2a3a;
  color: #c8d6e5;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.2s ease;
}

.sidebar--collapsed { width: 60px; }

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-4);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  min-height: 60px;
  overflow: hidden;
}

.sidebar--collapsed .sidebar-header {
  justify-content: center;
  padding: var(--space-4) var(--space-2);
  gap: 0;
}

.sidebar-logo { color: #4e9af1; flex-shrink: 0; }
.sidebar--collapsed .sidebar-logo { display: none; }
.sidebar-brand { font-weight: 700; font-size: 0.95rem; color: #fff; white-space: nowrap; flex: 1; }

.collapse-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #8fa3b8;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.sidebar--collapsed .collapse-btn { margin-left: 0; }
.collapse-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }

.sidebar-nav {
  flex: 1;
  padding: var(--space-4) var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-sm);
  color: #8fa3b8;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.sidebar--collapsed .nav-item { justify-content: center; padding: var(--space-3) var(--space-2); }
.nav-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
.nav-item--active { background: rgba(78,154,241,0.15); color: #4e9af1; }

.nav-label { overflow: hidden; }

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.user-info { display: flex; align-items: center; gap: var(--space-3); }
.sidebar--collapsed .user-info { justify-content: center; }

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #4e9af1;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-details { display: flex; flex-direction: column; overflow: hidden; }
.user-name { font-size: 0.85rem; color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.75rem; color: #8fa3b8; text-transform: capitalize; }

.signout-btn {
  width: 100%;
  font-size: 0.8rem;
  color: #8fa3b8;
  border-color: rgba(255,255,255,0.1);
  justify-content: center;
}
.signout-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); }

@media (max-width: 640px) {
  .sidebar {
    width: 100%;
    min-height: unset;
    flex-direction: row;
    align-items: center;
    padding: 0 var(--space-4);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .sidebar-header { border: none; padding: var(--space-3) 0; flex: 1; }
  .sidebar-nav { flex-direction: row; padding: var(--space-2) 0; flex: unset; }
  .sidebar-footer { flex-direction: row; align-items: center; border: none; padding: var(--space-3) 0; }
  .user-details, .signout-btn { display: none; }
}
</style>
