<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRequestsStore } from '../stores/requests.js';

const store = useRequestsStore();

const startDate = ref('');
const endDate = ref('');
const reason = ref('');
const error = ref('');
const loading = ref(false);

const isValid = computed(
  () => startDate.value && endDate.value && endDate.value >= startDate.value,
);

async function submit() {
  if (!isValid.value) {
    error.value = 'End date must be on or after start date.';
    return;
  }
  error.value = '';
  loading.value = true;
  try {
    await store.createRequest({
      start_date: startDate.value,
      end_date: endDate.value,
      reason: reason.value || undefined,
    });
    startDate.value = '';
    endDate.value = '';
    reason.value = '';
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: { code?: string } } } };
    if (e.response?.data?.error?.code === 'DATE_OVERLAP') {
      error.value = 'These dates overlap with an existing request.';
    } else {
      error.value = 'Failed to submit request. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="card request-form">
    <h2 class="form-title">New Vacation Request</h2>
    <form @submit.prevent="submit">
      <div class="form-row">
        <div class="field">
          <label for="start-date">Start date</label>
          <input id="start-date" v-model="startDate" type="date" required />
        </div>
        <div class="field">
          <label for="end-date">End date</label>
          <input id="end-date" v-model="endDate" type="date" required :min="startDate" />
        </div>
      </div>
      <div class="field">
        <label for="reason">Reason <span class="optional">(optional)</span></label>
        <input id="reason" v-model="reason" type="text" placeholder="Holiday, medical, etc." />
      </div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <button type="submit" class="btn btn-primary" :disabled="loading || !isValid">
        {{ loading ? 'Submitting…' : 'Submit request' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.request-form { margin-bottom: var(--space-6); }
.form-title { font-size: 1.1rem; font-weight: 600; margin-bottom: var(--space-4); }
.form-row { display: flex; gap: var(--space-4); }
.form-row .field { flex: 1; }
.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-4); }
.field label { font-size: 0.875rem; font-weight: 500; }
.field input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  outline: none;
}
.field input:focus { border-color: var(--color-primary); }
.optional { color: var(--color-text-muted); font-weight: 400; font-size: 0.8rem; }
.error-msg { color: var(--color-danger); font-size: 0.875rem; margin-bottom: var(--space-3); }

@media (max-width: 640px) {
  .form-row { flex-direction: column; }
}
</style>
