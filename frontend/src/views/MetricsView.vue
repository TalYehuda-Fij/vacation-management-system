<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { metricsApi } from '../api/index.js';
import type { EmployeeMetric, MyMetric } from '../types/index.js';
import AppSidebar from '../components/AppSidebar.vue';

const auth = useAuthStore();

const employeeMetrics = ref<EmployeeMetric[]>([]);
const myMetric = ref<MyMetric | null>(null);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    if (auth.role === 'validator') {
      const res = await metricsApi.getAll();
      employeeMetrics.value = res.data;
    } else {
      const res = await metricsApi.getMine();
      myMetric.value = res.data;
    }
  } finally {
    loading.value = false;
  }
});

// Donut chart helpers (requester)
const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const donutData = computed(() => {
  const m = myMetric.value;
  if (!m) return null;

  const quotaFraction = Math.min(m.daysTaken, m.quota) / m.maxAllowed;
  const overdraftFraction = Math.max(0, m.daysTaken - m.quota) / m.maxAllowed;

  return {
    quotaDash: quotaFraction * CIRCUMFERENCE,
    overdraftDash: overdraftFraction * CIRCUMFERENCE,
    quotaOffset: 0,
    overdraftOffset: -(quotaFraction * CIRCUMFERENCE),
    emptyOffset: -((quotaFraction + overdraftFraction) * CIRCUMFERENCE),
    pct: Math.round((m.daysTaken / m.quota) * 100),
  };
});

// Bar chart helpers (validator)
function barWidth(metric: EmployeeMetric): number {
  return Math.min((metric.daysTaken / metric.maxAllowed) * 100, 100);
}

function quotaLinePos(metric: EmployeeMetric): number {
  return (metric.quota / metric.maxAllowed) * 100;
}

function barColor(metric: EmployeeMetric): string {
  if (metric.daysTaken > metric.quota) return 'var(--color-danger)';
  if (metric.daysTaken >= metric.quota * 0.8) return 'var(--color-warning)';
  return 'var(--color-success)';
}

function statusLabel(m: EmployeeMetric): string {
  if (m.daysTaken > m.quota) return `${m.daysTaken - m.quota}d over quota`;
  if (m.daysRemaining === 0) return 'Quota reached';
  return `${m.daysRemaining}d remaining`;
}
</script>

<template>
  <div class="layout">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">Metrics — {{ myMetric?.year ?? employeeMetrics[0]?.year ?? new Date().getFullYear() }}</h1>
        <p class="page-subtitle">Annual vacation day usage · 20-day quota · up to 4 days overdraft allowed</p>
      </div>

      <div v-if="loading" class="empty">Loading…</div>

      <!-- VALIDATOR: bar chart per employee -->
      <div v-else-if="auth.role === 'validator'" class="card chart-card">
        <h2 class="chart-title">Employee Vacation Usage</h2>
        <div v-if="employeeMetrics.length === 0" class="empty">No employee data.</div>
        <div v-else class="bar-chart">
          <div v-for="m in employeeMetrics" :key="m.id" class="bar-row">
            <div class="bar-label">
              <span class="emp-name">{{ m.name }}</span>
              <span class="emp-days" :style="{ color: barColor(m) }">
                {{ m.daysTaken }} / {{ m.quota }} days
              </span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: barWidth(m) + '%', background: barColor(m) }"
              />
              <!-- quota line -->
              <div
                class="quota-line"
                :style="{ left: quotaLinePos(m) + '%' }"
                title="20-day quota"
              />
            </div>
            <span class="bar-status" :style="{ color: barColor(m) }">
              {{ statusLabel(m) }}
            </span>
          </div>

          <div class="bar-legend">
            <span class="legend-item">
              <span class="legend-dot" style="background: var(--color-success)" /> On track
            </span>
            <span class="legend-item">
              <span class="legend-dot" style="background: var(--color-warning)" /> Near quota
            </span>
            <span class="legend-item">
              <span class="legend-dot" style="background: var(--color-danger)" /> Over quota
            </span>
            <span class="legend-item">
              <span class="legend-line" /> 20-day limit
            </span>
          </div>
        </div>
      </div>

      <!-- REQUESTER: donut chart -->
      <div v-else-if="myMetric" class="requester-grid">
        <div class="card donut-card">
          <h2 class="chart-title">My Usage</h2>
          <div class="donut-wrapper">
            <svg :width="RADIUS * 2 + 32" :height="RADIUS * 2 + 32" class="donut-svg">
              <g :transform="`translate(${RADIUS + 16}, ${RADIUS + 16})`">
                <!-- background track -->
                <circle
                  :r="RADIUS"
                  fill="none"
                  stroke="var(--color-border)"
                  stroke-width="14"
                />
                <!-- quota used (green/warning) -->
                <circle
                  v-if="donutData && donutData.quotaDash > 0"
                  :r="RADIUS"
                  fill="none"
                  :stroke="myMetric.daysTaken >= myMetric.quota * 0.8 ? 'var(--color-warning)' : 'var(--color-success)'"
                  stroke-width="14"
                  stroke-linecap="round"
                  :stroke-dasharray="`${donutData.quotaDash} ${CIRCUMFERENCE}`"
                  :stroke-dashoffset="donutData.quotaOffset"
                  transform="rotate(-90)"
                />
                <!-- overdraft used (red) -->
                <circle
                  v-if="donutData && donutData.overdraftDash > 0"
                  :r="RADIUS"
                  fill="none"
                  stroke="var(--color-danger)"
                  stroke-width="14"
                  stroke-linecap="round"
                  :stroke-dasharray="`${donutData.overdraftDash} ${CIRCUMFERENCE}`"
                  :stroke-dashoffset="donutData.overdraftOffset"
                  transform="rotate(-90)"
                />
              </g>
            </svg>
            <div class="donut-center">
              <span class="donut-value">{{ myMetric.daysTaken }}</span>
              <span class="donut-label">of {{ myMetric.quota }} days</span>
            </div>
          </div>
        </div>

        <div class="card stats-breakdown">
          <h2 class="chart-title">Breakdown</h2>
          <div class="breakdown-row">
            <span class="breakdown-label">Days taken</span>
            <span class="breakdown-value">{{ myMetric.daysTaken }}</span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-label">Quota</span>
            <span class="breakdown-value">{{ myMetric.quota }}</span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-label">Remaining</span>
            <span
              class="breakdown-value"
              :style="{ color: myMetric.daysRemaining < 0 ? 'var(--color-danger)' : 'var(--color-success)' }"
            >
              {{ myMetric.daysRemaining }}
            </span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-label">Max overdraft</span>
            <span class="breakdown-value">{{ myMetric.maxAllowed - myMetric.quota }} days</span>
          </div>
          <div class="breakdown-row">
            <span class="breakdown-label">Overdraft used</span>
            <span
              class="breakdown-value"
              :style="{ color: myMetric.daysTaken > myMetric.quota ? 'var(--color-danger)' : 'var(--color-text-muted)' }"
            >
              {{ Math.max(0, myMetric.daysTaken - myMetric.quota) }}
            </span>
          </div>

          <div
            class="quota-status"
            :class="{
              'quota-status--ok': myMetric.daysTaken <= myMetric.quota * 0.8,
              'quota-status--warn': myMetric.daysTaken > myMetric.quota * 0.8 && myMetric.daysTaken <= myMetric.quota,
              'quota-status--over': myMetric.daysTaken > myMetric.quota,
            }"
          >
            {{
              myMetric.daysTaken > myMetric.quota
                ? `${myMetric.daysTaken - myMetric.quota} day(s) into overdraft`
                : myMetric.daysTaken === myMetric.quota
                ? 'Quota reached'
                : `${myMetric.daysRemaining} day(s) remaining`
            }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout { display: flex; min-height: 100vh; }

.main-content {
  flex: 1;
  padding: var(--space-6);
  min-width: 0;
}

.page-header { margin-bottom: var(--space-6); }
.page-title { font-size: 1.4rem; font-weight: 700; }
.page-subtitle { color: var(--color-text-muted); font-size: 0.875rem; margin-top: var(--space-1); }

.empty { color: var(--color-text-muted); padding: var(--space-6); text-align: center; }

/* --- Bar chart (validator) --- */
.chart-card { max-width: 860px; }
.chart-title { font-size: 1rem; font-weight: 600; margin-bottom: var(--space-5); }

.bar-chart { display: flex; flex-direction: column; gap: var(--space-5); }

.bar-row { display: grid; grid-template-columns: 220px 1fr 120px; align-items: center; gap: var(--space-4); }

.bar-label { display: flex; flex-direction: column; gap: 2px; }
.emp-name { font-size: 0.9rem; font-weight: 500; }
.emp-days { font-size: 0.78rem; font-weight: 600; }

.bar-track {
  position: relative;
  height: 14px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: visible;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
  min-width: 2px;
}

.quota-line {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  background: #374151;
  border-radius: 1px;
}

.bar-status { font-size: 0.78rem; font-weight: 500; white-space: nowrap; }

.bar-legend {
  display: flex;
  gap: var(--space-5);
  flex-wrap: wrap;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-2);
}

.legend-item { display: flex; align-items: center; gap: var(--space-2); font-size: 0.78rem; color: var(--color-text-muted); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-line { width: 14px; height: 2px; background: #374151; border-radius: 1px; flex-shrink: 0; }

/* --- Donut chart (requester) --- */
.requester-grid {
  display: flex;
  gap: var(--space-5);
  align-items: flex-start;
  flex-wrap: wrap;
}

.donut-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.donut-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-svg { display: block; }

.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.donut-value { font-size: 2.2rem; font-weight: 700; line-height: 1; }
.donut-label { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px; }

.stats-breakdown {
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
}
.breakdown-row:last-of-type { border-bottom: none; }
.breakdown-label { color: var(--color-text-muted); }
.breakdown-value { font-weight: 600; }

.quota-status {
  margin-top: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}
.quota-status--ok   { background: #dcfce7; color: var(--color-success); }
.quota-status--warn { background: #fef3c7; color: var(--color-warning); }
.quota-status--over { background: #fee2e2; color: var(--color-danger); }

@media (max-width: 640px) {
  .layout { flex-direction: column; }
  .main-content { padding: var(--space-4); }
  .bar-row { grid-template-columns: 1fr; gap: var(--space-2); }
  .bar-status { text-align: right; }
  .requester-grid { flex-direction: column; }
}
</style>
