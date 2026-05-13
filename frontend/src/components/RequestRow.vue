<script setup lang="ts">
import type { VacationRequest } from '../types/index.js';
import StatusBadge from './StatusBadge.vue';

defineProps<{ request: VacationRequest }>();
</script>

<template>
  <tr class="request-row">
    <td>{{ request.startDate }}</td>
    <td>{{ request.endDate }}</td>
    <td>{{ request.reason ?? '—' }}</td>
    <td><StatusBadge :status="request.status" /></td>
    <td class="comments-cell">
      <span v-if="request.status === 'rejected' && request.comments" class="reject-comment">
        {{ request.comments }}
      </span>
      <span v-else>—</span>
    </td>
  </tr>
</template>

<style scoped>
.request-row td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
  vertical-align: middle;
}

.reject-comment {
  color: var(--color-danger);
  font-style: italic;
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .request-row {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-3);
    padding: var(--space-3);
  }
  .request-row td {
    border: none;
    padding: var(--space-1) 0;
  }
}
</style>
