<script setup lang="ts">
defineProps<{
  type?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    class="btn"
    :class="[
      `btn--${type || 'primary'}`,
      `btn--${size || 'md'}`
    ]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="btn__spinner"></span>
    <span class="btn__text"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
  min-height: 48px;
}

.btn:active:not(:disabled) {
  transform: scale(0.98);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: #fff;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #43a047, #388e3c);
}

.btn--secondary {
  background: #fff;
  color: #333;
  border: 2px solid #e0e0e0;
}

.btn--secondary:hover:not(:disabled) {
  border-color: #4CAF50;
  color: #4CAF50;
}

.btn--danger {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: #fff;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #d32f2f, #c62828);
}

.btn--ghost {
  background: transparent;
  color: #666;
}

.btn--ghost:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.btn--sm {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 40px;
}

.btn--md {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 48px;
}

.btn--lg {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 56px;
}

.btn__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn--secondary .btn__spinner {
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: #333;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
