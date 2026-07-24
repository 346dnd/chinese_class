<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  seconds: number
  autoStart?: boolean
}>()

const emit = defineEmits<{
  (e: 'timeout'): void
  (e: 'tick', remaining: number): void
}>()

const remaining = ref(props.seconds)
let timer: number | null = null

const formattedTime = computed(() => {
  const mins = Math.floor(remaining.value / 60)
  const secs = remaining.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const progress = computed(() => {
  return (remaining.value / props.seconds) * 100
})

const start = () => {
  if (timer) clearInterval(timer)
  remaining.value = props.seconds
  timer = window.setInterval(() => {
    if (remaining.value > 0) {
      remaining.value--
      emit('tick', remaining.value)
    } else {
      stop()
      emit('timeout')
    }
  }, 1000)
}

const stop = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const reset = () => {
  stop()
  remaining.value = props.seconds
}

watch(() => props.seconds, (val) => {
  remaining.value = val
})

onMounted(() => {
  if (props.autoStart) {
    start()
  }
})

onUnmounted(() => {
  stop()
})

defineExpose({ start, stop, reset, remaining })
</script>

<template>
  <div class="countdown">
    <div class="countdown__progress">
      <div class="countdown__progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
    <div class="countdown__time">{{ formattedTime }}</div>
  </div>
</template>

<style scoped>
.countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.countdown__progress {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.countdown__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #FFC107, #F44336);
  transition: width 1s linear;
}

.countdown__time {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  font-family: 'Courier New', monospace;
}
</style>
