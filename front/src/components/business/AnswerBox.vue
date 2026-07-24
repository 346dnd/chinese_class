<script setup lang="ts">
import { ref, computed } from 'vue'
import Input from '@/components/base/Input.vue'
import Button from '@/components/base/Button.vue'

const props = defineProps<{
  question: string
  options?: string[]
  type?: 'text' | 'choice'
  correctAnswer?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', answer: string): void
}>()

const selectedOption = ref('')
const textAnswer = ref('')
const isSubmitting = ref(false)

const answer = computed(() => {
  if (props.type === 'choice') {
    return selectedOption.value
  }
  return textAnswer.value
})

const submit = () => {
  if (!answer.value || isSubmitting.value) return
  isSubmitting.value = true
  emit('submit', answer.value)
  setTimeout(() => {
    isSubmitting.value = false
  }, 1000)
}
</script>

<template>
  <div class="answer-box">
    <div class="answer-box__question">{{ question }}</div>
    
    <div v-if="type === 'choice' && options" class="answer-box__options">
      <button
        v-for="(option, index) in options"
        :key="index"
        class="answer-box__option"
        :class="{ 'answer-box__option--selected': selectedOption === option }"
        :disabled="disabled"
        @click="selectedOption = option"
      >
        {{ option }}
      </button>
    </div>
    
    <div v-else class="answer-box__input">
      <Input
        v-model="textAnswer"
        :placeholder="correctAnswer ? '请输入答案' : '请输入你的答案'"
        :disabled="disabled"
      />
    </div>
    
    <Button
      :disabled="!answer || disabled"
      :loading="isSubmitting"
      class="answer-box__submit"
      @click="submit"
    >
      提交答案
    </Button>
  </div>
</template>

<style scoped>
.answer-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.answer-box__question {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  line-height: 1.5;
}

.answer-box__options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-box__option {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.answer-box__option:hover:not(:disabled) {
  border-color: #4CAF50;
}

.answer-box__option--selected {
  border-color: #4CAF50;
  background: #e8f5e9;
}

.answer-box__option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.answer-box__submit {
  margin-top: 12px;
}
</style>
