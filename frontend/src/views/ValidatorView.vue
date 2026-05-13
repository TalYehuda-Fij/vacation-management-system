<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRequestsStore } from '../stores/requests.js';
import { requestsApi } from '../api/index.js';
import type { RequestStatus, RequestStats, VacationRequest } from '../types/index.js';
import AppSidebar from '../components/AppSidebar.vue';
import StatCard from '../components/StatCard.vue';
import ActivityFeed from '../components/ActivityFeed.vue';
import StatusBadge from '../components/StatusBadge.vue';
import RejectDialog from '../components/RejectDialog.vue';

const store = useRequestsStore();

const activeFilter = ref<RequestStatus | undefined>('pending');
const rejectTargetId = ref<string | null>(null);
const stats = ref<RequestStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
const activity = ref<VacationRequest[]>([]);

async function load(status?: RequestStatus) {
  activeFilter.value = status;
  await store.fetchAll({ status, page: 1, pageSize: 20 });
}

async function refreshStats() {
  const [statsRes, activityRes] = await Promise.all([
    requestsApi.getStats(),
    requestsApi.getActivity(),
  ]);
  stats.value = statsRes.data;
  activity.value = activityRes.data;
}

onMounted(async () => {
  await Promise.all([load('pending'), refreshStats()]);
});

async function handleApprove(id: string) {
  await store.approve(id);
  await refreshStats();
}

function openReject(id: string) {
  rejectTargetId.value = id;
}

async function handleReject(comment: string) {
  if (!rejectTargetId.value) return;
  await store.reject(rejectTargetId.value, comment);
  rejectTargetId.value = null;
  await refreshStats();
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
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
      </div>

      <!-- Stat Cards -->
      <div class="stats-row">
        <StatCard label="Total" :value="stats.total" :total="stats.total" accent="#2563eb" />
        <StatCard label="Pending" :value="stats.pending" :total="stats.total" accent="#d97706" />
        <StatCard label="Approved" :value="stats.approved" :total="stats.total" accent="#16a34a" />
        <StatCard label="Rejected" :value="stats.rejected" :total="stats.total" accent="#dc2626" />
      </div>

      <!-- Table + Activity side by side -->
      <div class="content-row">
        <div class="table-section">
          <div class="card table-card">
            <div class="table-header">
              <h2 class="table-title">Vacation Requests</h2>
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
                      <button class="btn btn-success btn-sm" @click="handleApprove(req.id)">Approve</button>
                      <button class="btn btn-danger btn-sm" @click="openReject(req.id)">Reject</button>
                    </div>
                    <span v-else class="comments-text">{{ req.comments ?? '—' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="store.pagination.totalPages > 1" class="pagination">
              <button
                class="btn btn-ghost"
                :disabled="store.pagination.page === 1"
                @click="store.fetchAll({ status: activeFilter, page: store.pagination.page - 1 })"
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
          </div>
        </div>

        <ActivityFeed :items="activity" />
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
.layout { display: flex; min-height: 100vh; }

.main-content {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
  min-width: 0;
}

.page-header { margin-bottom: var(--space-5); }
.page-title { font-size: 1.4rem; font-weight: 700; }

/* Stat cards */
.stats-row {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

/* Table + activity */
.content-row {
  display: flex;
  gap: var(--space-5);
  align-items: flex-start;
}

.table-section { flex: 1; min-width: 0; }

.table-card { padding: 0; overflow: hidden; }

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.table-title { font-size: 1rem; font-weight: 600; }

.filter-chips { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.filter-chip {
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.82rem;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.15s;
  color: var(--color-text-muted);
}
.filter-chip--active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

.request-table { width: 100%; border-collapse: collapse; }
.request-table th {
  text-align: left;
  font-size: 0.78rem;
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
  font-size: 0.875rem;
  vertical-align: middle;
}
.request-row:last-child td { border-bottom: none; }

.action-btns { display: flex; gap: var(--space-2); }
.btn-sm { padding: var(--space-1) var(--space-3); font-size: 0.8rem; }
.comments-text { color: var(--color-text-muted); font-size: 0.82rem; font-style: italic; }
.empty { padding: var(--space-6); text-align: center; color: var(--color-text-muted); }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-4);
  font-size: 0.875rem;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 900px) {
  .content-row { flex-direction: column; }
}

@media (max-width: 640px) {
  .layout { flex-direction: column; }
  .main-content { padding: var(--space-4); }
  .stats-row { gap: var(--space-3); }
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
