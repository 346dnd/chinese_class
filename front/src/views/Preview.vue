<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProgressStore } from '@/stores/progress'
import { courseAPI, writeAPI, questionAPI, answerAPI, feedbackAPI } from '@/api'
import { useDigitalHuman } from '@/composables/useDigitalHuman'
import Textarea from '@/components/base/Textarea.vue'
import Input from '@/components/base/Input.vue'
import Button from '@/components/base/Button.vue'
import DigitalHuman from '@/components/business/DigitalHuman.vue'
import FeedbackOverlay from '@/components/business/FeedbackOverlay.vue'
import type { StageDetail, Blank } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const progressStore = useProgressStore()
const { showDigitalHuman, digitalHumanName, digitalHumanMessage, hide, show } = useDigitalHuman()

const stageDetail = ref<StageDetail | null>(null)
const currentTaskIndex = ref(0)
const currentTextIndex = ref(0)

const proudAspect = ref('')
const textConnection = ref('')
const lifeConnection = ref('')
const content = ref('')
const questionContent = ref('')
const questionKeywords = ref('')

const blanks = ref<{ [key: string]: { input: string; correct: boolean; revealed: boolean } }>({})
const isSubmitting = ref(false)
const showFeedback = ref(false)
const feedbackData = ref<{ type: string; script: string; durationMs: number } | null>(null)

const currentTask = computed(() => stageDetail.value?.tasks[currentTaskIndex.value])
const currentText = computed(() => currentTask.value?.texts?.[currentTextIndex.value])
const completedCount = computed(() => progressStore.getCompletedCount())

const loadStage = async () => {
  try {
    const detail = await courseAPI.getStage('preview')
    stageDetail.value = detail
    progressStore.setCurrentStage(detail)
    
    if (detail.texts && detail.texts[0]?.blanks) {
      detail.texts[0].blanks.forEach((blank: Blank) => {
        blanks.value[blank.id] = { input: '', correct: false, revealed: false }
      })
    }
    
    if (detail.digitalHumanPrompt) {
      show('罗罗', detail.digitalHumanPrompt)
    }
  } catch (e) {
    console.error('Failed to load stage:', e)
  }
}

const submitThought = async () => {
  if (!content.value.trim() || !proudAspect.value.trim()) return
  
  isSubmitting.value = true
  try {
    const res = await writeAPI.submit({
      stageId: 'preview',
      taskId: 'write-thought',
      textId: currentText.value?.id || '',
      content: content.value.trim(),
      proudAspect: proudAspect.value.trim(),
      textConnection: textConnection.value.trim(),
      lifeConnection: lifeConnection.value.trim()
    })
    
    if (res.feedback) {
      show('罗罗', res.feedback)
    }
    
    if (res.nextAction === 'next_text') {
      currentTextIndex.value++
      resetThoughtForm()
    } else if (res.nextAction === 'next_task') {
      progressStore.updateProgress('write-thought')
      generateFeedback('write-thought')
    }
  } catch (e) {
    console.error('Submit thought failed:', e)
  } finally {
    isSubmitting.value = false
  }
}

const resetThoughtForm = () => {
  proudAspect.value = ''
  textConnection.value = ''
  lifeConnection.value = ''
  content.value = ''
}

const submitQuestion = async () => {
  if (!questionContent.value.trim()) return
  
  isSubmitting.value = true
  try {
    const res = await questionAPI.submit({
      stageId: 'preview',
      taskId: 'ask-question',
      content: questionContent.value.trim(),
      keywords: questionKeywords.value.split(',').map(k => k.trim()).filter(k => k)
    })
    
    if (res.feedback) {
      show('小小', res.feedback)
    }
    
    if (res.passed) {
      progressStore.updateProgress('ask-question')
      generateFeedback('ask-question')
    }
  } catch (e) {
    console.error('Submit question failed:', e)
  } finally {
    isSubmitting.value = false
  }
}

const validateBlank = async (blankId: string) => {
  const blank = blanks.value[blankId]
  if (!blank.input.trim()) return
  
  try {
    const res = await answerAPI.validateBlank({
      taskId: 'fill-blank',
      textId: currentText.value?.id || '',
      blankId,
      input: blank.input.trim()
    })
    
    if (res.correct) {
      blank.correct = true
    } else if (res.exhausted) {
      blank.revealed = true
      blank.input = res.revealedAnswer || ''
    }
    
    if (res.feedback) {
      show('罗罗', res.feedback)
    }
    
    checkAllBlanksCompleted()
  } catch (e) {
    console.error('Validate blank failed:', e)
  }
}

const checkAllBlanksCompleted = () => {
  const allCompleted = Object.values(blanks.value).every(b => b.correct || b.revealed)
  if (allCompleted) {
    progressStore.updateProgress('fill-blank')
    generateFeedback('fill-blank')
  }
}

const generateFeedback = async (taskId: string) => {
  try {
    const res = await feedbackAPI.generate({
      stageId: 'preview',
      taskId
    })
    feedbackData.value = res
    showFeedback.value = true
  } catch (e) {
    console.error('Generate feedback failed:', e)
  }
}

const closeFeedback = () => {
  showFeedback.value = false
  if (currentTaskIndex.value < (stageDetail.value?.tasks.length || 0) - 1) {
    currentTaskIndex.value++
  } else {
    router.push('/')
  }
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
  <div class="preview">
    <div class="preview__header">
      <button class="preview__back" @click="goBack">← 返回</button>
      <div class="preview__title">寻找文化</div>
      <div class="preview__progress">{{ completedCount + 1 }}/{{ stageDetail?.tasks.length }}</div>
    </div>
    
    <div v-if="currentTask?.type === 'write-thought'" class="preview__task">
      <div v-if="currentText" class="preview__text-selector">
        <span>课文选择:</span>
        <button
          v-for="(text, index) in currentTask.texts"
          :key="text.id"
          class="preview__text-btn"
          :class="{ 'preview__text-btn--active': index === currentTextIndex }"
          @click="currentTextIndex = index"
        >
          {{ text.title }}
        </button>
      </div>
      
      <Input
        v-model="proudAspect"
        placeholder="让我自豪的方面"
        :maxlength="100"
      />
      
      <Textarea
        v-model="textConnection"
        placeholder="联系课文内容"
        :maxlength="200"
      />
      
      <Textarea
        v-model="lifeConnection"
        placeholder="联系生活实际"
        :maxlength="200"
      />
      
      <Textarea
        v-model="content"
        placeholder="写下你的感想"
        :maxlength="200"
      />
      
      <Button
        type="primary"
        :loading="isSubmitting"
        @click="submitThought"
      >
        提交
      </Button>
    </div>
    
    <div v-else-if="currentTask?.type === 'ask-question'" class="preview__task">
      <Textarea
        v-model="questionContent"
        placeholder="提出你的问题"
        :maxlength="500"
      />
      
      <Input
        v-model="questionKeywords"
        placeholder="关键词（用逗号分隔）"
      />
      
      <Button
        type="primary"
        :loading="isSubmitting"
        @click="submitQuestion"
      >
        提交问题
      </Button>
    </div>
    
    <div v-else-if="currentTask?.type === 'fill-blank'" class="preview__task">
      <div v-if="currentText" class="preview__blanks">
        <div v-for="blank in currentText.blanks" :key="blank.id" class="preview__blank">
          <div class="preview__blank-context">
            {{ blank.context }}
          </div>
          <Input
            v-model="blanks[blank.id].input"
            placeholder="请输入答案"
            :disabled="blanks[blank.id].correct || blanks[blank.id].revealed"
            @blur="validateBlank(blank.id)"
          />
        </div>
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
.preview {
  min-height: 100vh;
  background: #fff;
  padding: 20px;
}

.preview__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.preview__back {
  font-size: 18px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
}

.preview__title {
  flex: 1;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.preview__progress {
  font-size: 16px;
  color: #999;
}

.preview__task {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview__text-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.preview__text-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.preview__text-btn--active {
  border-color: #4CAF50;
  background: #e8f5e9;
  color: #4CAF50;
}

.preview__blanks {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview__blank {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview__blank-context {
  font-size: 18px;
  line-height: 1.6;
  color: #333;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}
</style>
