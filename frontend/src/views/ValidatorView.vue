<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useRequestsStore } from '../stores/requests.js';
import type { RequestStatus } from '../types/index.js';
import StatusBadge from '../components/StatusBadge.vue';
import RejectDialog from '../components/RejectDialog.vue';

const auth = useAuthStore();
const store = useRequestsStore();

const activeFilter = ref<RequestStatus | undefined>('pending');
const rejectTargetId = ref<string | null>(null);

async function load(status?: RequestStatus) {
  activeFilter.value = status;
  await store.fetchAll({ status, page: 1, pageSize: 20 });
}

onMounted(() => load('pending'));

async function handleApprove(id: string) {
  await store.approve(id);
}

function openReject(id: string) {
  rejectTargetId.value = id;
}

async function handleReject(comment: string) {
  if (!rejectTargetId.value) return;
  await store.reject(rejectTargetId.value, comment);
  rejectTargetId.value = null;
}

const filters: { label: string; value: RequestStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];
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
      <div class="dashboard-header">
        <h1 class="dashboard-title">All Requests</h1>
        <div class="filter-chips">
          <button
            v-for="f in filters"
            :key="String(f.value)"
            class="filter-chip"
            :class="{ 'filter-chip--active': activeFilter === f.value }"
            @click="load(f.value)"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <div class="card table-card">
        <div v-if="store.loading" class="empty">Loading…</div>
        <div v-else-if="store.allRequests.length === 0" class="empty">No requests found.</div>
        <table v-else class="request-table">
          <thead>
            <tr>
              <th>Requester</th>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in store.allRequests" :key="req.id" class="request-row">
              <td>{{ req.user?.name ?? '—' }}</td>
              <td>{{ req.startDate }}</td>
              <td>{{ req.endDate }}</td>
              <td>{{ req.reason ?? '—' }}</td>
              <td><StatusBadge :status="req.status" /></td>
              <td>
                <div v-if="req.status === 'pending'" class="action-btns">
                  <button class="btn btn-success btn-sm" @click="handleApprove(req.id)">
                    Approve
                  </button>
                  <button class="btn btn-danger btn-sm" @click="openReject(req.id)">
                    Reject
                  </button>
                </div>
                <span v-else class="comments-text">{{ req.comments ?? '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="store.pagination.totalPages > 1" class="pagination">
        <button
          class="btn btn-ghost"
          :disabled="store.pagination.page === 1"
          @click="load(activeFilter)"
        >
          Previous
        </button>
        <span>Page {{ store.pagination.page }} of {{ store.pagination.totalPages }}</span>
        <button
          class="btn btn-ghost"
          :disabled="store.pagination.page === store.pagination.totalPages"
          @click="store.fetchAll({ status: activeFilter, page: store.pagination.page + 1 })"
        >
          Next
        </button>
      </div>
    </main>

    <RejectDialog
      v-if="rejectTargetId"
      @confirm="handleReject"
      @cancel="rejectTargetId = null"
    />
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
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}
.dashboard-title { font-size: 1.4rem; font-weight: 700; }

.filter-chips { display: flex; gap: var(--space-2); }
.filter-chip {
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.85rem;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.15s;
}
.filter-chip--active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.table-card { padding: 0; overflow: hidden; }
.request-table { width: 100%; border-collapse: collapse; }
.request-table th {
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--color-border);
}
.request-row td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
  vertical-align: middle;
}
.request-row:last-child td { border-bottom: none; }

.action-btns { display: flex; gap: var(--space-2); }
.btn-sm { padding: var(--space-1) var(--space-3); font-size: 0.8rem; }

.comments-text { color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; }
.empty { padding: var(--space-6); text-align: center; color: var(--color-text-muted); }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-5);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .dashboard-header { flex-direction: column; align-items: flex-start; }
  .request-table thead { display: none; }
  .request-table tbody tr {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-3);
    padding: var(--space-3);
  }
  .request-table tbody tr td { border: none; padding: var(--space-1) 0; }
}
</style>
