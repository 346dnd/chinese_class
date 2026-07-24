<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
  script: string
  type: string
  durationMs: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isVisible = ref(false)
const isPlaying = ref(false)
const progress = ref(0)
const currentText = ref('')
let progressTimer: number | null = null
let textTimer: number | null = null

const startPlaying = () => {
  if (!props.script) return
  
  isPlaying.value = true
  progress.value = 0
  currentText.value = ''
  
  const progressInterval = props.durationMs / 100
  progressTimer = window.setInterval(() => {
    progress.value += 1
    if (progress.value >= 100) {
      stopPlaying()
    }
  }, progressInterval)
  
  let index = 0
  const textInterval = props.durationMs / props.script.length
  textTimer = window.setInterval(() => {
    if (index < props.script.length) {
      currentText.value += props.script[index]
      index++
    }
  }, textInterval)
}

const stopPlaying = () => {
  isPlaying.value = false
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (textTimer) {
    clearInterval(textTimer)
    textTimer = null
  }
  setTimeout(() => {
    emit('close')
  }, 500)
}

watch(() => props.show, (val) => {
  if (val) {
    isVisible.value = true
    setTimeout(() => {
      startPlaying()
    }, 500)
  } else {
    isVisible.value = false
    stopPlaying()
  }
})

onUnmounted(() => {
  stopPlaying()
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="feedback-overlay">
      <div class="feedback-overlay__content">
        <div class="feedback-overlay__type">{{ type === 'audio' ? '🎵' : '🎬' }}</div>
        <div class="feedback-overlay__text">{{ currentText }}</div>
        <div class="feedback-overlay__progress">
          <div class="feedback-overlay__progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="feedback-overlay__hint">播放中，不可跳过</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.feedback-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 60px;
  max-width: 80%;
}

.feedback-overlay__type {
  font-size: 80px;
}

.feedback-overlay__text {
  font-size: 24px;
  color: #fff;
  line-height: 1.8;
  text-align: center;
}

.feedback-overlay__progress {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.feedback-overlay__progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.1s linear;
}

.feedback-overlay__hint {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
