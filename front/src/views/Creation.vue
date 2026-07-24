<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { courseAPI, chatAPI, feedbackAPI } from '@/api'
import { useDigitalHuman } from '@/composables/useDigitalHuman'
import Textarea from '@/components/base/Textarea.vue'
import Button from '@/components/base/Button.vue'
import DialogBubble from '@/components/business/DialogBubble.vue'
import DigitalHuman from '@/components/business/DigitalHuman.vue'
import FeedbackOverlay from '@/components/business/FeedbackOverlay.vue'
import type { StageDetail } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const { showDigitalHuman, digitalHumanName, digitalHumanMessage, hide, show } = useDigitalHuman()

const stageDetail = ref<StageDetail | null>(null)
const chatMessages = ref<{ senderName: string; content: string; senderId?: string }[]>([])
const inputMessage = ref('')
const isChatting = ref(false)
const showPolish = ref(false)
const polishResult = ref<{ original: string; polished: string } | null>(null)
const creationOptions = ref([
  { id: 'essay', name: '说一段话 ★ (必选)', completed: false },
  { id: 'handcraft', name: '做一张手抄报', completed: false },
  { id: 'poster', name: '做一张海报', completed: false },
  { id: 'poem', name: '写一首诗', completed: false },
  { id: 'script', name: '写一个小剧本', completed: false },
  { id: 'visit', name: '参观中医治未病中心', completed: false },
  { id: 'custom', name: '自己喜欢的方式', completed: false }
])

const showFeedback = ref(false)
const feedbackData = ref<{ type: string; script: string; durationMs: number } | null>(null)

const canSelectOtherOptions = computed(() => {
  return creationOptions.value[0].completed
})

const loadStage = async () => {
  try {
    const detail = await courseAPI.getStage('creation')
    stageDetail.value = detail
    
    if (detail.digitalHumanPrompt) {
      show('罗罗', detail.digitalHumanPrompt)
    }
  } catch (e) {
    console.error('Failed to load stage:', e)
  }
}

const sendChat = async () => {
  if (!inputMessage.value.trim() || isChatting.value) return
  
  const userMsg = {
    senderName: userStore.name,
    content: inputMessage.value.trim(),
    senderId: userStore.studentId
  }
  chatMessages.value.push(userMsg)
  inputMessage.value = ''
  isChatting.value = true
  
  try {
    const res = await chatAPI.chat({
      stageId: 'creation',
      taskId: 'creation',
      message: userMsg.content
    })
    
    const aiMsg = {
      senderName: '伊森',
      content: res.reply
    }
    chatMessages.value.push(aiMsg)
    
    if (res.feedback) {
      show('罗罗', res.feedback)
    }
  } catch (e) {
    console.error('Chat failed:', e)
  } finally {
    isChatting.value = false
  }
}

const finishChat = async () => {
  try {
    const res = await chatAPI.polish({
      stageId: 'creation',
      taskId: 'creation'
    })
    polishResult.value = res
    showPolish.value = true
    creationOptions.value[0].completed = true
  } catch (e) {
    console.error('Polish failed:', e)
  }
}

const selectCreationOption = async (optionId: string) => {
  try {
    const res = await chatAPI.creation({
      stageId: 'creation',
      taskId: 'creation',
      action: 'create',
      optionId
    })
    
    const option = creationOptions.value.find(o => o.id === optionId)
    if (option) {
      option.completed = true
    }
    
    if (res.nextAction === 'next_task') {
      generateFeedback()
    }
  } catch (e) {
    console.error('Creation option failed:', e)
  }
}

const skipCreation = async () => {
  try {
    await chatAPI.creation({
      stageId: 'creation',
      taskId: 'creation',
      action: 'skip'
    })
    generateFeedback()
  } catch (e) {
    console.error('Skip creation failed:', e)
  }
}

const generateFeedback = async () => {
  try {
    const res = await feedbackAPI.generate({
      stageId: 'creation',
      taskId: 'creation'
    })
    feedbackData.value = res
    showFeedback.value = true
  } catch (e) {
    console.error('Generate feedback failed:', e)
  }
}

const closeFeedback = () => {
  showFeedback.value = false
  router.push('/chat')
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
  <div class="creation">
    <div class="creation__header">
      <button class="creation__back" @click="goBack">← 返回</button>
      <div class="creation__title">宣传文化</div>
      <div class="creation__progress">已完成: {{ creationOptions.filter(o => o.completed).length }}/3</div>
    </div>
    
    <div v-if="!showPolish" class="creation__chat">
      <div class="creation__chat-messages">
        <DialogBubble
          v-for="(msg, index) in chatMessages"
          :key="index"
          :message="msg"
        />
      </div>
      
      <div class="creation__chat-input">
        <Textarea
          v-model="inputMessage"
          placeholder="请围绕一个意思说一段话"
          :rows="2"
          :maxlength="500"
        />
        <div class="creation__chat-actions">
          <Button type="secondary" @click="finishChat">完成对话</Button>
          <Button type="primary" :loading="isChatting" @click="sendChat">发送</Button>
        </div>
      </div>
    </div>
    
    <div v-else class="creation__polish">
      <div class="creation__polish-title">AI 批改对比</div>
      <div class="creation__polish-content">
        <div class="creation__polish-item">
          <div class="creation__polish-label">我的版本</div>
          <div class="creation__polish-text">{{ polishResult?.original }}</div>
        </div>
        <div class="creation__polish-item">
          <div class="creation__polish-label">AI 润色版</div>
          <div class="creation__polish-text creation__polish-text--polished">{{ polishResult?.polished }}</div>
        </div>
      </div>
      
      <div class="creation__options">
        <div class="creation__options-title">创作方式选择</div>
        <button
          v-for="option in creationOptions"
          :key="option.id"
          class="creation__option-btn"
          :class="{ 
            'creation__option-btn--completed': option.completed,
            'creation__option-btn--disabled': !canSelectOtherOptions && option.id !== 'essay'
          }"
          :disabled="!canSelectOtherOptions && option.id !== 'essay'"
          @click="selectCreationOption(option.id)"
        >
          <span>{{ option.name }}</span>
          <span v-if="option.completed" class="creation__option-check">✓</span>
        </button>
      </div>
      
      <Button type="secondary" @click="skipCreation">跳过创作</Button>
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
.creation {
  min-height: 100vh;
  background: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.creation__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.creation__back {
  font-size: 18px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
}

.creation__title {
  flex: 1;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.creation__progress {
  font-size: 16px;
  color: #999;
}

.creation__chat {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.creation__chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 16px;
}

.creation__chat-input {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.creation__chat-actions {
  display: flex;
  gap: 12px;
}

.creation__polish {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.creation__polish-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.creation__polish-content {
  display: flex;
  gap: 20px;
}

.creation__polish-item {
  flex: 1;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
}

.creation__polish-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.creation__polish-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.creation__polish-text--polished {
  color: #4CAF50;
}

.creation__options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.creation__options-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.creation__option-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.creation__option-btn--completed {
  border-color: #4CAF50;
  background: #e8f5e9;
}

.creation__option-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.creation__option-check {
  color: #4CAF50;
  font-weight: bold;
}
</style>
