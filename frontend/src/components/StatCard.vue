<script setup lang="ts">
defineProps<{
  label: string;
  value: number;
  total: number;
  accent: string;
}>();
</script>

<template>
  <div class="stat-card card">
    <div class="stat-top">
      <span class="stat-label">{{ label }}</span>
      <span class="stat-value" :style="{ color: accent }">{{ value }}</span>
    </div>
    <div class="stat-bar-bg">
      <div
        class="stat-bar-fill"
        :style="{ width: total > 0 ? `${Math.round((value / total) * 100)}%` : '0%', background: accent }"
      />
    </div>
    <div class="stat-pct">
      {{ total > 0 ? Math.round((value / total) * 100) : 0 }}% of total
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-bar-bg {
  height: 4px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.stat-pct {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
