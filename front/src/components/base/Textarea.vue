<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  rows?: number
  maxlength?: number
  disabled?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const charCount = computed(() => props.modelValue.length)

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const focus = () => {
  textareaRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="textarea-wrapper">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows || 4"
      :maxlength="maxlength"
      :disabled="disabled"
      class="textarea"
      :class="{ 'textarea--error': error }"
      @input="handleInput"
      @focus="emit('focus')"
      @blur="emit('blur')"
    ></textarea>
    <div class="textarea__footer">
      <span v-if="maxlength" class="textarea__count">
        {{ charCount }}/{{ maxlength }}
      </span>
    </div>
    <span v-if="error" class="textarea__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.textarea {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.6;
  transition: all 0.3s ease;
  background: #fff;
  resize: vertical;
  min-height: 120px;
}

.textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.textarea:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.textarea--error {
  border-color: #f44336;
}

.textarea__footer {
  display: flex;
  justify-content: flex-end;
}

.textarea__count {
  font-size: 14px;
  color: #999;
}

.textarea__error {
  font-size: 14px;
  color: #f44336;
}
</style>
