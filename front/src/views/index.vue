<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProgressStore } from '@/stores/progress'

const router = useRouter()
const userStore = useUserStore()
const progressStore = useProgressStore()

// 阶段详情数据
const stageDetail = ref<any>(null)
const currentTaskIndex = ref(0)
const currentTextIndex = ref(0)

// 表单数据
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

// 计算属性
const currentTask = computed(() => stageDetail.value?.tasks?.[currentTaskIndex.value])
const currentText = computed(() => currentTask.value?.texts?.[currentTextIndex.value])

// 加载阶段数据（模拟）
const loadStage = async () => {
  try {
    // 模拟接口数据
    stageDetail.value = {
      id: 'preview',
      name: '寻找文化',
      tasks: [
        {
          type: 'write-thought',
          name: '写写感想',
          texts: [
            {
              id: 'paper_invent',
              title: '纸的发明',
              blanks: []
            },
            {
              id: 'zhaozhou_bridge',
              title: '赵州桥',
              blanks: []
            },
            {
              id: 'qingming_map',
              title: '一幅名扬中外的画',
              blanks: []
            }
          ]
        },
        {
          type: 'ask-question',
          name: '提出问题'
        },
        {
          type: 'fill-blank',
          name: '填空练习',
          texts: [
            {
              id: 'fill-blank-1',
              title: '填空练习',
              blanks: [
                { id: 'blank1', context: '造纸术是由____改进的。', answer: '蔡伦' },
                { id: 'blank2', context: '赵州桥位于____省。', answer: '河北' }
              ]
            }
          ]
        }
      ]
    }
    
    // 初始化填空数据
    if (stageDetail.value.tasks[2]?.texts?.[0]?.blanks) {
      stageDetail.value.tasks[2].texts[0].blanks.forEach((blank: any) => {
        blanks.value[blank.id] = { input: '', correct: false, revealed: false }
      })
    }
  } catch (e) {
    console.error('Failed to load stage:', e)
  }
}

// 提交感想
const submitThought = async () => {
  if (!content.value.trim() || !proudAspect.value.trim()) {
    alert('请填写必填项')
    return
  }
  
  isSubmitting.value = true
  try {
    setTimeout(() => {
      isSubmitting.value = false
      if (currentTextIndex.value < (currentTask.value?.texts?.length || 1) - 1) {
        currentTextIndex.value++
        resetThoughtForm()
      } else {
        progressStore.updateProgress('write-thought')
        generateFeedback('write-thought')
      }
    }, 500)
  } catch (e) {
    console.error('Submit thought failed:', e)
    isSubmitting.value = false
  }
}

const resetThoughtForm = () => {
  proudAspect.value = ''
  textConnection.value = ''
  lifeConnection.value = ''
  content.value = ''
}

// 提交问题
const submitQuestion = async () => {
  if (!questionContent.value.trim()) {
    alert('请填写问题')
    return
  }
  
  isSubmitting.value = true
  try {
    setTimeout(() => {
      isSubmitting.value = false
      progressStore.updateProgress('ask-question')
      generateFeedback('ask-question')
    }, 500)
  } catch (e) {
    console.error('Submit question failed:', e)
    isSubmitting.value = false
  }
}

// 验证填空
const validateBlank = async (blankId: string) => {
  const blank = blanks.value[blankId]
  if (!blank.input.trim()) return
  
  const taskBlanks = currentText.value?.blanks
  const matchingBlank = taskBlanks?.find((b: any) => b.id === blankId)
  
  if (matchingBlank && blank.input.trim() === matchingBlank.answer) {
    blank.correct = true
  } else {
    // 错误时显示提示
    alert('答案不正确，请再试一次')
  }
  
  checkAllBlanksCompleted()
}

const checkAllBlanksCompleted = () => {
  const allCompleted = Object.values(blanks.value).every(b => b.correct || b.revealed)
  if (allCompleted) {
    progressStore.updateProgress('fill-blank')
    generateFeedback('fill-blank')
  }
}

// 生成反馈
const generateFeedback = async (_taskId: string) => {
  feedbackData.value = {
    type: 'success',
    script: '恭喜你完成了任务！继续加油！',
    durationMs: 3000
  }
  showFeedback.value = true
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
      <div class="preview__progress" v-if="stageDetail">
        {{ Math.min(currentTaskIndex + 1, stageDetail.tasks.length) }}/{{ stageDetail.tasks.length }}
      </div>
    </div>
    
    <!-- 写写感想任务 -->
    <div v-if="currentTask?.type === 'write-thought'" class="preview__task">
      <div v-if="currentTask.texts" class="preview__text-selector">
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
      
      <div class="preview__form-group">
        <label>让我自豪的方面</label>
        <input
          v-model="proudAspect"
          placeholder="请输入让你自豪的方面"
          maxlength="100"
          class="preview__input"
        />
      </div>
      
      <div class="preview__form-group">
        <label>联系课文内容</label>
        <textarea
          v-model="textConnection"
          placeholder="请联系课文内容说明"
          maxlength="200"
          class="preview__textarea"
        ></textarea>
      </div>
      
      <div class="preview__form-group">
        <label>联系生活实际</label>
        <textarea
          v-model="lifeConnection"
          placeholder="请联系生活实际说明"
          maxlength="200"
          class="preview__textarea"
        ></textarea>
      </div>
      
      <div class="preview__form-group">
        <label>写下你的感想</label>
        <textarea
          v-model="content"
          placeholder="请写下你的感想"
          maxlength="200"
          class="preview__textarea"
        ></textarea>
      </div>
      
      <button
        class="preview__submit-btn"
        :disabled="isSubmitting"
        @click="submitThought"
      >
        {{ isSubmitting ? '提交中...' : '提交' }}
      </button>
    </div>
    
    <!-- 提出问题任务 -->
    <div v-else-if="currentTask?.type === 'ask-question'" class="preview__task">
      <div class="preview__form-group">
        <label>提出你的问题</label>
        <textarea
          v-model="questionContent"
          placeholder="请提出你的问题"
          maxlength="500"
          class="preview__textarea"
        ></textarea>
      </div>
      
      <div class="preview__form-group">
        <label>关键词（用逗号分隔）</label>
        <input
          v-model="questionKeywords"
          placeholder="例如：造纸术,蔡伦,东汉"
          class="preview__input"
        />
      </div>
      
      <button
        class="preview__submit-btn"
        :disabled="isSubmitting"
        @click="submitQuestion"
      >
        {{ isSubmitting ? '提交中...' : '提交问题' }}
      </button>
    </div>
    
    <!-- 填空练习任务 -->
    <div v-else-if="currentTask?.type === 'fill-blank'" class="preview__task">
      <div v-if="currentText?.blanks" class="preview__blanks">
        <div v-for="blank in currentText.blanks" :key="blank.id" class="preview__blank">
          <div class="preview__blank-context">
            {{ blank.context }}
          </div>
          <input
            v-model="blanks[blank.id].input"
            placeholder="请输入答案"
            class="preview__input"
            :disabled="blanks[blank.id].correct"
            @blur="validateBlank(blank.id)"
          />
          <span v-if="blanks[blank.id].correct" class="preview__correct-mark">✓ 正确</span>
        </div>
      </div>
    </div>
    
    <!-- 反馈弹窗 -->
    <div v-if="showFeedback && feedbackData" class="preview__feedback">
      <div class="preview__feedback-content">
        <p>{{ feedbackData.script }}</p>
        <button @click="closeFeedback">继续</button>
      </div>
    </div>
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
  max-width: 700px;
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
  border-color: #409EFF;
  background: #ecf5ff;
  color: #409EFF;
}

.preview__form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview__form-group label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.preview__input {
  padding: 10px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.preview__input:focus {
  border-color: #409EFF;
}

.preview__textarea {
  padding: 10px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.preview__textarea:focus {
  border-color: #409EFF;
}

.preview__submit-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  background: #409EFF;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  align-self: flex-end;
}

.preview__submit-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
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

.preview__correct-mark {
  color: #67c23a;
  font-size: 14px;
}

.preview__feedback {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview__feedback-content {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.preview__feedback-content p {
  font-size: 18px;
  margin-bottom: 20px;
}

.preview__feedback-content button {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #409EFF;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}
</style>