<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { courseAPI, practiceAPI, feedbackAPI } from '@/api'
import { useDigitalHuman } from '@/composables/useDigitalHuman'
import Textarea from '@/components/base/Textarea.vue'
import Input from '@/components/base/Input.vue'
import Button from '@/components/base/Button.vue'
import DigitalHuman from '@/components/business/DigitalHuman.vue'
import FeedbackOverlay from '@/components/business/FeedbackOverlay.vue'
import type { StageDetail } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const { showDigitalHuman, digitalHumanName, digitalHumanMessage, hide, show } = useDigitalHuman()

const stageDetail = ref<StageDetail | null>(null)
const currentTextIndex = ref(0)

const centerPoint = ref('')
const centralSentence = ref('')
const details = ref('')
const content = ref('')

const isSubmitting = ref(false)
const showFeedback = ref(false)
const feedbackData = ref<{ type: string; script: string; durationMs: number } | null>(null)

const loadStage = async () => {
  try {
    const detail = await courseAPI.getStage('method')
    stageDetail.value = detail
    
    if (detail.digitalHumanPrompt) {
      show('罗罗', detail.digitalHumanPrompt)
    }
  } catch (e) {
    console.error('Failed to load stage:', e)
  }
}

const submitPractice = async () => {
  if (!content.value.trim()) return
  
  isSubmitting.value = true
  try {
    const res = await practiceAPI.submit({
      stageId: 'method',
      taskId: 'method-zhaozhouqiao',
      itemId: 'item-1',
      content: content.value.trim()
    })
    
    if (res.feedback) {
      show('罗罗', res.feedback)
    }
    
    if (res.passed) {
      generateFeedback()
    }
  } catch (e) {
    console.error('Submit practice failed:', e)
  } finally {
    isSubmitting.value = false
  }
}

const generateFeedback = async () => {
  try {
    const res = await feedbackAPI.generate({
      stageId: 'method',
      taskId: 'method-zhaozhouqiao'
    })
    feedbackData.value = res
    showFeedback.value = true
  } catch (e) {
    console.error('Generate feedback failed:', e)
  }
}

const closeFeedback = () => {
  showFeedback.value = false
  router.push('/creation')
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
})
</script>

<template>
  <div class="method">
    <div class="method__header">
      <button class="method__back" @click="goBack">← 返回</button>
      <div class="method__title">宣传有法</div>
    </div>
    
    <div class="method__content">
      <div class="method__text-selector">
        <span>课文选择:</span>
        <button
          v-for="(text, index) in stageDetail?.tasks[0]?.texts"
          :key="text.id"
          class="method__text-btn"
          :class="{ 'method__text-btn--active': index === currentTextIndex }"
          @click="currentTextIndex = index"
        >
          {{ text.title }}
        </button>
      </div>
      
      <div class="method__learning">
        <div class="method__learning-item">
          <span class="method__learning-label">①确定一个意思:</span>
          <Input
            v-model="centerPoint"
            placeholder="例如：美观"
          />
        </div>
        
        <div class="method__learning-item">
          <span class="method__learning-label">②中心句:</span>
          <Input
            v-model="centralSentence"
            placeholder="例如：这座桥不但坚固，而且美观"
          />
        </div>
        
        <div class="method__learning-item">
          <span class="method__learning-label">③写具体:</span>
          <Textarea
            v-model="details"
            placeholder="围绕中心句写具体内容"
            :maxlength="500"
          />
        </div>
      </div>
      
      <div class="method__practice">
        <div class="method__practice-title">练习任务</div>
        <Textarea
          v-model="content"
          placeholder="请围绕一个意思写一段话"
          :maxlength="500"
        />
        
        <Button
          type="primary"
          :loading="isSubmitting"
          @click="submitPractice"
        >
          提交
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
.method {
  min-height: 100vh;
  background: #fff;
  padding: 20px;
}

.method__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.method__back {
  font-size: 18px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
}

.method__title {
  flex: 1;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.method__content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.method__text-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.method__text-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.method__text-btn--active {
  border-color: #4CAF50;
  background: #e8f5e9;
  color: #4CAF50;
}

.method__learning {
  background: #f5f5f5;
  padding: 24px;
  border-radius: 16px;
}

.method__learning-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.method__learning-item:last-child {
  margin-bottom: 0;
}

.method__learning-label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.method__practice {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.method__practice-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
</style>
