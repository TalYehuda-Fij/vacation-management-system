<script setup lang="ts">
import { useRequestsStore } from './stores/requests.js';

const store = useRequestsStore();
</script>

<template>
  <RouterView />
  <Transition name="toast">
    <div
      v-if="store.toast"
      class="toast"
      :class="store.toast.type === 'error' ? 'toast--error' : 'toast--success'"
    >
      {{ store.toast.message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast--success { background: var(--color-success); }
.toast--error   { background: var(--color-danger); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>
