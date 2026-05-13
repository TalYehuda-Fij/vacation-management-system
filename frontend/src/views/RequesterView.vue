<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRequestsStore } from '../stores/requests.js';
import type { RequestStatus } from '../types/index.js';
import AppSidebar from '../components/AppSidebar.vue';
import RequestForm from '../components/RequestForm.vue';
import RequestList from '../components/RequestList.vue';
import RequestRow from '../components/RequestRow.vue';

const store = useRequestsStore();

type Tab = RequestStatus | 'all';
const activeTab = ref<Tab>('all');

const tabs: { label: string; value: Tab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const filtered = computed(() => {
  if (activeTab.value === 'all') return store.myRequests;
  return store.myRequests.filter((r) => r.status === activeTab.value);
});

onMounted(() => store.fetchMine());
</script>

<template>
  <div class="layout">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">My Vacation Requests</h1>
      </div>

      <RequestForm />

      <div class="card list-card">
        <div class="list-header">
          <h2 class="list-title">Request History</h2>
          <div class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="tab"
              :class="{ 'tab--active': activeTab === tab.value }"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
              <span class="tab-count">
                {{
                  tab.value === 'all'
                    ? store.myRequests.length
                    : store.myRequests.filter((r) => r.status === tab.value).length
                }}
              </span>
            </button>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="empty">No {{ activeTab === 'all' ? '' : activeTab }} requests.</div>
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
            <RequestRow v-for="req in filtered" :key="req.id" :request="req" />
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: var(--space-6) var(--space-6);
  overflow-y: auto;
  max-width: 900px;
}

.page-header { margin-bottom: var(--space-5); }
.page-title { font-size: 1.4rem; font-weight: 700; }

.list-card { padding: 0; overflow: hidden; }

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.list-title { font-size: 1rem; font-weight: 600; }

.tabs { display: flex; gap: var(--space-1); }

.tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  background: none;
  color: var(--color-text-muted);
  transition: all 0.15s;
}
.tab:hover { background: var(--color-bg); color: var(--color-text); }
.tab--active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.tab-count {
  background: rgba(255,255,255,0.25);
  border-radius: 999px;
  padding: 0 6px;
  font-size: 0.75rem;
  min-width: 18px;
  text-align: center;
}
.tab:not(.tab--active) .tab-count {
  background: var(--color-border);
  color: var(--color-text-muted);
}

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

.empty {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .layout { flex-direction: column; }
  .main-content { padding: var(--space-4); }
  .list-header { flex-direction: column; align-items: flex-start; }
  .tabs { flex-wrap: wrap; }
  .request-table thead { display: none; }
}
</style>
