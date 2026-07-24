import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course, StageDetail, Progress } from '@/types'

export const useProgressStore = defineStore('progress', () => {
  const course = ref<Course | null>(null)
  const currentStage = ref<StageDetail | null>(null)
  const progress = ref<Progress>({
    currentTaskIndex: 0,
    completedTaskIds: []
  })

  const setCourse = (c: Course) => {
    course.value = c
  }

  const setCurrentStage = (stage: StageDetail) => {
    currentStage.value = stage
    progress.value = stage.progress
  }

  const updateProgress = (taskId: string) => {
    if (!progress.value.completedTaskIds.includes(taskId)) {
      progress.value.completedTaskIds.push(taskId)
    }
    if (currentStage.value) {
      const taskIndex = currentStage.value.tasks.findIndex(t => t.id === taskId)
      if (taskIndex >= 0) {
        progress.value.currentTaskIndex = taskIndex + 1
      }
    }
  }

  const resetProgress = () => {
    progress.value = {
      currentTaskIndex: 0,
      completedTaskIds: []
    }
  }

  const isTaskCompleted = (taskId: string): boolean => {
    return progress.value.completedTaskIds.includes(taskId)
  }

  const getCompletedCount = (): number => {
    return progress.value.completedTaskIds.length
  }

  return {
    course,
    currentStage,
    progress,
    setCourse,
    setCurrentStage,
    updateProgress,
    resetProgress,
    isTaskCompleted,
    getCompletedCount
  }
})
