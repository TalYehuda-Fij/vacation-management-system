<script setup lang="ts">
import type { RequestStatus } from '../types/index.js';

defineProps<{ status: RequestStatus }>();
</script>

<template>
  <span class="status-badge" :class="`status-badge--${status}`">
    {{ status }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge--pending  { background: #fef3c7; color: var(--color-warning); }
.status-badge--approved { background: #dcfce7; color: var(--color-success); }
.status-badge--rejected { background: #fee2e2; color: var(--color-danger); }
</style>
