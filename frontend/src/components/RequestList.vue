<script setup lang="ts">
import type { VacationRequest } from '../types/index.js';
import RequestRow from './RequestRow.vue';

defineProps<{ requests: VacationRequest[] }>();
</script>

<template>
  <div class="card request-list">
    <h2 class="list-title">My Requests</h2>
    <div v-if="requests.length === 0" class="empty">No requests yet.</div>
    <table v-else class="request-table">
      <thead>
        <tr>
          <th>Start</th>
          <th>End</th>
          <th>Reason</th>
          <th>Status</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>
        <RequestRow v-for="req in requests" :key="req.id" :request="req" />
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.list-title { font-size: 1.1rem; font-weight: 600; margin-bottom: var(--space-4); }

.request-table {
  width: 100%;
  border-collapse: collapse;
}

.request-table th {
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding: var(--space-2) var(--space-4);
  border-bottom: 2px solid var(--color-border);
}

.empty {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  padding: var(--space-4) 0;
}

@media (max-width: 640px) {
  .request-table thead { display: none; }
  .request-table tbody { display: flex; flex-direction: column; gap: var(--space-2); }
}
</style>
