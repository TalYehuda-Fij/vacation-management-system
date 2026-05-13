<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits<{
  confirm: [comment: string];
  cancel: [];
}>();

const comment = ref('');
const canSubmit = computed(() => comment.value.trim().length > 0);

function confirm() {
  if (!canSubmit.value) return;
  emit('confirm', comment.value.trim());
  comment.value = '';
}

function cancel() {
  comment.value = '';
  emit('cancel');
}
</script>

<template>
  <div class="dialog-overlay" @click.self="cancel">
    <div class="dialog card">
      <h3 class="dialog-title">Reject Request</h3>
      <p class="dialog-desc">Please provide a reason for rejection.</p>
      <div class="field">
        <label for="reject-comment">Comment <span class="required">*</span></label>
        <textarea
          id="reject-comment"
          v-model="comment"
          rows="3"
          placeholder="Reason for rejection…"
        />
      </div>
      <div class="dialog-actions">
        <button class="btn btn-ghost" @click="cancel">Cancel</button>
        <button class="btn btn-danger" :disabled="!canSubmit" @click="confirm">Reject</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: var(--space-4);
}

.dialog {
  width: 100%;
  max-width: 480px;
}

.dialog-title { font-size: 1.1rem; font-weight: 600; margin-bottom: var(--space-2); }
.dialog-desc { color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: var(--space-4); }

.field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-4); }
.field label { font-size: 0.875rem; font-weight: 500; }
.field textarea {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  resize: vertical;
  outline: none;
}
.field textarea:focus { border-color: var(--color-primary); }
.required { color: var(--color-danger); }

.dialog-actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
</style>
