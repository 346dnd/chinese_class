<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { courseAPI, homeworkAPI, feedbackAPI } from '@/api'
import { useDigitalHuman } from '@/composables/useDigitalHuman'
import Textarea from '@/components/base/Textarea.vue'
import Button from '@/components/base/Button.vue'
import DigitalHuman from '@/components/business/DigitalHuman.vue'
import FeedbackOverlay from '@/components/business/FeedbackOverlay.vue'
import type { HomeworkRecommendResponse } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const { showDigitalHuman, digitalHumanName, digitalHumanMessage, hide, show } = useDigitalHuman()

const recommendData = ref<HomeworkRecommendResponse | null>(null)
const selectedTask = ref('')
const content = ref('')
const isSubmitting = ref(false)
const showFeedback = ref(false)
const feedbackData = ref<{ type: string; script: string; durationMs: number } | null>(null)

const loadStage = async () => {
  try {
    const detail = await courseAPI.getStage('homework')
    if (detail.digitalHumanPrompt) {
      show('罗罗', detail.digitalHumanPrompt)
    }
  } catch (e) {
    console.error('Failed to load stage:', e)
  }
}

const getRecommend = async () => {
  try {
    const res = await homeworkAPI.recommend({
      stageId: 'homework',
      taskId: 'homework'
    })
    recommendData.value = res
  } catch (e) {
    console.error('Get recommend failed:', e)
  }
}

const submitHomework = async () => {
  if (!content.value.trim()) return
  
  isSubmitting.value = true
  try {
    const res = await homeworkAPI.submit({
      stageId: 'homework',
      taskId: 'homework',
      content: content.value.trim(),
      creationType: selectedTask.value || 'essay'
    })
    
    if (res.feedback) {
      show('罗罗', res.feedback)
    }
    
    if (res.passed) {
      generateFeedback()
    }
  } catch (e) {
    console.error('Submit homework failed:', e)
  } finally {
    isSubmitting.value = false
  }
}

const generateFeedback = async () => {
  try {
    const res = await feedbackAPI.generate({
      stageId: 'homework',
      taskId: 'homework'
    })
    feedbackData.value = res
    showFeedback.value = true
  } catch (e) {
    console.error('Generate feedback failed:', e)
  }
}

const closeFeedback = () => {
  showFeedback.value = false
  router.push('/profile')
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  loadStage()
  getRecommend()
})
</script>

<template>
  <div class="homework">
    <div class="homework__header">
      <button class="homework__back" @click="goBack">← 返回</button>
      <div class="homework__title">传承文化</div>
    </div>
    
    <div v-if="recommendData" class="homework__content">
      <div class="homework__level">
        <span class="homework__level-label">推荐等级:</span>
        <span class="homework__level-value">{{ recommendData.level === 'advanced' ? '高级' : '基础' }}</span>
      </div>
      
      <div class="homework__title-card">
        <div class="homework__title-text">{{ recommendData.title }}</div>
      </div>
      
      <div class="homework__required">
        <div class="homework__required-label">必选任务:</div>
        <div class="homework__required-text">{{ recommendData.requiredTask }}</div>
      </div>
      
      <div class="homework__optional">
        <div class="homework__optional-label">选做任务:</div>
        <div class="homework__optional-list">
          <button
            v-for="task in recommendData.optionalTasks"
            :key="task"
            class="homework__optional-btn"
            :class="{ 'homework__optional-btn--selected': selectedTask === task }"
            @click="selectedTask = task"
          >
            {{ task }}
          </button>
        </div>
      </div>
      
      <div class="homework__submit-area">
        <Textarea
          v-model="content"
          placeholder="请完成作业内容"
          :maxlength="1000"
        />
        
        <Button
          type="primary"
          :loading="isSubmitting"
          @click="submitHomework"
        >
          提交作业
        </Button>
      </div>
    </div>
    
    <DigitalHuman
      :show="showDigitalHuman"
      :name="digitalHumanName"
      :message="digitalHumanMessage"
      @close="hide"
    />
    
    <FeedbackOverlay
      v-if="feedbackData"
      :show="showFeedback"
      :type="feedbackData.type"
      :script="feedbackData.script"
      :duration-ms="feedbackData.durationMs"
      @close="closeFeedback"
    />
  </div>
</template>

<style scoped>
.homework {
  min-height: 100vh;
  background: #fff;
  padding: 20px;
}

.homework__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.homework__back {
  font-size: 18px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
}

.homework__title {
  flex: 1;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.homework__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.homework__level {
  display: flex;
  align-items: center;
  gap: 12px;
}

.homework__level-label {
  font-size: 16px;
  color: #666;
}

.homework__level-value {
  font-size: 16px;
  font-weight: bold;
  color: #4CAF50;
}

.homework__title-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 16px;
}

.homework__title-text {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-align: center;
}

.homework__required {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
}

.homework__required-label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.homework__required-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.homework__optional {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.homework__optional-label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.homework__optional-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.homework__optional-btn {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.homework__optional-btn--selected {
  border-color: #4CAF50;
  background: #e8f5e9;
  color: #4CAF50;
}

.homework__submit-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
