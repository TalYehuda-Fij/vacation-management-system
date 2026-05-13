<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useRequestsStore } from '../stores/requests.js';
import RequestForm from '../components/RequestForm.vue';
import RequestList from '../components/RequestList.vue';

const auth = useAuthStore();
const store = useRequestsStore();

onMounted(() => store.fetchMine());
</script>

<template>
  <div class="layout">
    <header class="topnav">
      <span class="topnav-brand">Vacation Management</span>
      <div class="topnav-user">
        <span>{{ auth.user?.name }}</span>
        <button class="btn btn-ghost" @click="auth.logout(); $router.push('/login')">
          Sign out
        </button>
      </div>
    </header>

    <main class="main-content">
      <RequestForm />
      <RequestList :requests="store.myRequests" />
    </main>
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }

.topnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.topnav-brand { font-weight: 700; font-size: 1.1rem; color: var(--color-primary); }
.topnav-user { display: flex; align-items: center; gap: var(--space-4); font-size: 0.9rem; }

.main-content {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

@media (max-width: 640px) {
  .topnav { padding: var(--space-3) var(--space-4); }
}
</style>
