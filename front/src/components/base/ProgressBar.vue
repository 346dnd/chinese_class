<script setup lang="ts">
import type { Stage } from '@/types'

defineProps<{
  stages: Stage[]
  currentStageId?: string
}>()

const emit = defineEmits<{
  (e: 'select', stageId: string): void
}>()

const getStageProgress = (stage: Stage, stages: Stage[]): number => {
  const index = stages.findIndex(s => s.id === stage.id)
  return ((index + 1) / stages.length) * 100
}
</script>

<template>
  <div class="progress-bar">
    <div class="progress-bar__track">
      <div
        class="progress-bar__fill"
        :style="{ width: currentStageId ? `${getStageProgress(stages.find(s => s.id === currentStageId)!, stages)}%` : '0%' }"
      ></div>
    </div>
    <div class="progress-bar__stages">
      <button
        v-for="stage in stages"
        :key="stage.id"
        class="progress-bar__stage"
        :class="{ 'progress-bar__stage--active': stage.id === currentStageId }"
        @click="emit('select', stage.id)"
      >
        <span class="progress-bar__stage-number">{{ stage.order }}</span>
        <span class="progress-bar__stage-name">{{ stage.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  padding: 20px;
}

.progress-bar__track {
  position: relative;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 24px;
}

.progress-bar__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-bar__stages {
  display: flex;
  justify-content: space-between;
}

.progress-bar__stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.progress-bar__stage:active {
  transform: scale(0.95);
}

.progress-bar__stage-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.progress-bar__stage--active .progress-bar__stage-number {
  background: #4CAF50;
  color: #fff;
}

.progress-bar__stage-name {
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

.progress-bar__stage--active .progress-bar__stage-name {
  color: #4CAF50;
  font-weight: bold;
}
</style>
