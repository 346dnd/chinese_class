<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  placeholder?: string
  type?: string
  maxlength?: number
  disabled?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="input-wrapper">
    <input
      ref="inputRef"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      class="input"
      :class="{ 'input--error': error }"
      @input="handleInput"
      @focus="emit('focus')"
      @blur="emit('blur')"
    />
    <span v-if="error" class="input__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.5;
  transition: all 0.3s ease;
  background: #fff;
  min-height: 48px;
}

.input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.input--error {
  border-color: #f44336;
}

.input__error {
  font-size: 14px;
  color: #f44336;
}
</style>
