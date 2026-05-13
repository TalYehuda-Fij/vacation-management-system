<script setup lang="ts">
import type { VacationRequest } from '../types/index.js';

defineProps<{ items: VacationRequest[] }>();

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
</script>

<template>
  <div class="card activity-feed">
    <h3 class="feed-title">Recent Activity</h3>
    <div v-if="items.length === 0" class="empty">No activity yet.</div>
    <ul v-else class="feed-list">
      <li v-for="item in items" :key="item.id" class="feed-item">
        <span class="feed-dot" :class="`feed-dot--${item.status}`" />
        <div class="feed-body">
          <span class="feed-name">{{ item.user?.name ?? 'Unknown' }}</span>
          <span class="feed-action">
            's request was
            <strong :class="item.status === 'approved' ? 'text-success' : 'text-danger'">
              {{ item.status }}
            </strong>
          </span>
          <div class="feed-meta">
            {{ item.startDate }} – {{ item.endDate }}
            <span class="feed-time">· {{ timeAgo(item.reviewedAt) }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.activity-feed {
  width: 280px;
  flex-shrink: 0;
  align-self: flex-start;
}

.feed-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.feed-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.feed-item {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.feed-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}
.feed-dot--approved { background: var(--color-success); }
.feed-dot--rejected { background: var(--color-danger); }

.feed-body { font-size: 0.85rem; line-height: 1.4; }
.feed-name { font-weight: 600; color: var(--color-text); }
.feed-action { color: var(--color-text-muted); }

.text-success { color: var(--color-success); }
.text-danger  { color: var(--color-danger); }

.feed-meta {
  margin-top: var(--space-1);
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.feed-time { color: #9ca3af; }
.empty { font-size: 0.875rem; color: var(--color-text-muted); }

@media (max-width: 900px) {
  .activity-feed { width: 100%; }
}
</style>
