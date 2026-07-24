<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isVisible = ref(false)

watch(() => props.show, (val) => {
  if (val) {
    isVisible.value = true
    if (props.duration && props.duration > 0) {
      setTimeout(() => {
        emit('close')
      }, props.duration)
    }
  } else {
    isVisible.value = false
  }
})

const close = () => {
  emit('close')
}
</script>

<template>
  <Transition name="toast">
    <div v-if="isVisible" class="toast-container" @click="close">
      <div class="toast toast--{{ type || 'info' }}">
        <span class="toast__message">{{ message }}</span>
        <button class="toast__close" @click.stop="close">×</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 16px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  max-width: 480px;
}

.toast--success {
  background: #e8f5e9;
  color: #2e7d32;
}

.toast--error {
  background: #ffebee;
  color: #c62828;
}

.toast--warning {
  background: #fff8e1;
  color: #ef6c00;
}

.toast--info {
  background: #e3f2fd;
  color: #1565c0;
}

.toast__message {
  font-size: 16px;
  line-height: 1.5;
}

.toast__close {
  font-size: 24px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
