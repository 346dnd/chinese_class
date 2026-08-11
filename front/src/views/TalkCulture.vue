<template>
  <div class="page-container" :style="pageStyle">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">&lt;</span>
      <span class="nav-title">宣传文化：讲解优秀文化</span>
      <div class="top-nav-buttons">
        <div class="nav-btn" @click="mockVoice">
          <img src="/image/语音 1.png" alt="语音播报" class="btn-icon" />
          开启语音
        </div>
        <div class="nav-btn" @click="mockVideo">
          <img src="/image/视频 2.png" alt="回看视频" class="btn-icon" />
          回看视频
        </div>
      </div>
    </div>

    <!-- 场景人物区域：完成状态提升整体层级 -->
    <div class="scene-characters-wrap" :class="{ 'scene-high-z': isAllCompleted }">
      <!-- 中间屏幕：外国女孩 -->
      <div class="foreign-girl-area">
        <div class="foreign-bubble">
          <span class="bubble-text">{{ foreignGirlTalk }}</span>
          <img
            src="/image/语音朗读.png"
            alt="播放"
            class="bubble-voice-icon-right"
            @click="playForeignBubbleAudio"
          />
          <span class="bubble-arrow-bottom"></span>
        </div>
        <img
          src="/image/外国女孩 1.png"
          alt="外国女孩"
          class="foreign-girl-img"
        />
      </div>

      <!-- 右侧：罗罗汉服数字人（完成页也保留，对齐写写感想） -->
      <div class="digital-human-area" :class="{ 'completed-above-overlay': isAllCompleted }">
        <!-- 数字人图片 始终显示 -->
        <img
          src="/image/罗罗_汉服.psd 1 .png"
          alt="罗罗汉服数字人"
          class="digital-human-img"
          :class="{ 'complete-human-size': isAllCompleted }"
        />
        <!-- 气泡+操作按钮容器（完成页也保留，对齐写写感想结构） -->
        <div class="bubble-action-wrap" v-if="talkText || isAllCompleted">
          <!-- 普通对话气泡 -->
          <div
            class="human-talk-bubble"
            :class="{ expanded: isBubbleExpanded }"
            v-if="!isAllCompleted"
          >
            <img
              src="/image/语音朗读.png"
              alt="播放"
              class="bubble-voice-icon-left"
              @click="playBubbleAudio"
            />
            <span class="bubble-text">{{ talkText }}</span>
            <!-- 气泡箭头在右侧，指向数字人 -->
            <span class="bubble-arrow-right"></span>
          </div>

          <!-- 完成状态反馈气泡 -->
          <div class="completion-feedback-bubble" v-if="isAllCompleted">
            <div class="feedback-message">{{ completionMessage }}</div>
            <span class="bubble-arrow-right"></span>
          </div>

          <!-- 完成页操作按钮（对齐写写感想 completion-action-bar） -->
          <div class="completion-action-bar" v-if="isAllCompleted">
            <button class="completion-action-btn report-btn" @click="goToReport">
              <img src="/image/矢量 69.png" alt="图标" class="bar-btn-icon" />
              查看评价
            </button>
            <button class="completion-action-btn home-btn" @click="goHome">
              <img src="/image/back 1.png" alt="图标" class="bar-btn-icon" />
              回到首页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 左下角答题区域 -->
    <div class="bottom-input-area" ref="rightContainerRef" :class="{ 'complete-mode': isAllCompleted }">
      <!-- 历史作答记录 -->
      <div class="history-answer-list" v-if="historyAnswerList.length > 0">
        <div
          v-for="(record, qIdx) in historyAnswerList"
          :key="'history-' + qIdx"
          class="history-item-block"
        >
          <!-- 你的作品：标签同色无边框，卡片加深色边框 -->
          <div class="stu-answer-card" :class="record.isFinalPass ? 'card-correct' : 'card-wrong'">
            <div class="card-tag">你的作品</div>
            <div class="stu-content-text">{{ record.stuContent }}</div>
          </div>

          <!-- 参考范文：标签同色无边框，卡片加深色边框 -->
          <div v-if="record.showOptContent" class="ai-ref-card">
            <div class="ai-ref-label">参考范文</div>
            <div class="ai-ref-text">{{ record.aiOptContent }}</div>
          </div>
        </div>
      </div>

      <!-- 输入交互区：未完成时显示 -->
      <div class="input-operation-wrap" v-if="!isAllCompleted">
        <div class="feel-input-box">
          <textarea
            class="feel-input"
            v-model="userInput"
            :class="{
              'input-invalid': currentSubmitStatus === 'wrong',
              'has-content': !isInputEmpty,
              'text-red': currentSubmitStatus === 'wrong'
            }"
            placeholder="输入你的文化宣传文案..."
          ></textarea>
          <div class="func-btn-group">
            <button class="func-btn" @click="handleVoice">
              <img src="/image/矢量 62.png" alt="语音" class="func-icon-img" />
              <span class="func-text">语音</span>
            </button>
            <button class="func-btn" @click="handlePhoto">
              <img src="/image/矢量 65.png" alt="拍照" class="func-icon-img" />
              <span class="func-text">拍照</span>
            </button>
            <input
              ref="photoInputRef"
              type="file"
              accept="image/*"
              capture="environment"
              style="display: none"
              @change="onPhotoCapture"
            />
          </div>
        </div>
        <div class="submit-btn-wrap">
          <button
            class="submit-btn"
            :class="{ 'submit-disabled': isInputEmpty }"
            :disabled="isInputEmpty"
            @click="handleSubmit"
          >
            {{ currentAttempts >= 2 ? '结束任务' : '发送' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 完成全屏遮罩 -->
    <div class="completion-overlay" v-if="isAllCompleted"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const photoInputRef = ref<HTMLInputElement | null>(null)
const rightContainerRef = ref<HTMLElement | null>(null)

// ========== 基础适配配置 ==========
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080
const pageStyle = ref({
  transform: 'scale(1)',
  transformOrigin: 'top left',
  width: DESIGN_WIDTH + 'px',
  height: DESIGN_HEIGHT + 'px',
  marginLeft: '0px',
  marginTop: '0px'
})
const updateScale = () => {
  const scaleX = window.innerWidth / DESIGN_WIDTH
  const scaleY = window.innerHeight / DESIGN_HEIGHT
  pageStyle.value = {
    transform: `scale(${scaleX}, ${scaleY})`,
    transformOrigin: 'top left',
    width: DESIGN_WIDTH + 'px',
    height: DESIGN_HEIGHT + 'px',
    marginLeft: '0px',
    marginTop: '0px'
  }
}

// ========== 页面文案 ==========
const foreignGirlTalk = ref('Hello! Let us learn excellent traditional Chinese culture together~')
const talkText = ref('同学，请你撰写一段优秀传统文化宣传文案，介绍文化特色与生活意义吧。')
const isBubbleExpanded = ref(true)
const hasInitPlay = ref(false)

// ========== 答题核心数据 ==========
const userInput = ref('')
const isInputEmpty = computed(() => userInput.value.trim() === '')

const currentAttempts = ref(0)
const currentSubmitStatus = ref('')
const historyAnswerList = reactive<Array<{
  stuContent: string
  aiOptContent: string
  isFinalPass: boolean
  showOptContent: boolean
}>>([])

// 完成标记：答对 或 提交满3次强制结束
const isAllCompleted = computed(() => {
  return historyAnswerList.some(item => item.isFinalPass) || currentAttempts.value >= 3
})

// 完成页反馈文案
const completionMessage = computed(() => {
  const last = historyAnswerList.at(-1)
  if (!last) return ''
  return last.isFinalPass
    ? '恭喜你完成本次文化宣传文案创作，整体内容完整、立意清晰，继续加油哦！'
    : '本次作答已完成，参考范文可以帮助你优化文案，记得多多练习~'
})

// ========== mock方法 ==========
const playAudio = (text: string) => {
  console.log('播放语音文本：', text)
}
const playForeignBubbleAudio = () => {
  foreignGirlTalk.value && playAudio(foreignGirlTalk.value)
}
const playBubbleAudio = () => {
  isBubbleExpanded.value = true
  talkText.value && playAudio(talkText.value)
}
const mockVoice = () => console.log('开启语音播报')
const mockVideo = () => console.log('回看数字人讲解视频')

// AI批改模拟
const mockValidateAnswer = async (content: string): Promise<{
  isPass: boolean
  aiOptText: string
}> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const isPass = content.trim().length >= 30
      const optText = isPass
        ? `${content}，补充延伸：该传统文化承载千年生活智慧，日常传承可丰富精神生活、增强文化认同感。`
        : '文案内容较短，请补充文化具体亮点、现实价值两部分内容，完善宣传逻辑。'
      resolve({ isPass, aiOptText: optText })
    }, 600)
  })
}

// OCR拍照模拟
const recognizeOCR = async (file: File): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => resolve('OCR识别结果，可手动修改文案内容'), 800)
  })
}

// ========== 交互逻辑 ==========
const handleSubmit = async () => {
  if (isInputEmpty.value) return
  currentAttempts.value += 1
  const res = await mockValidateAnswer(userInput.value)

  const needShowOpt = res.isPass || currentAttempts.value >= 3
  const recordItem = {
    stuContent: userInput.value,
    aiOptContent: res.aiOptText,
    isFinalPass: res.isPass,
    showOptContent: needShowOpt
  }
  historyAnswerList.push(recordItem)

  if (res.isPass) {
    currentSubmitStatus.value = 'correct'
    setTimeout(() => playAudio(`恭喜作答合格，优化范文解读：${res.aiOptText}`), 1000)
  } else {
    currentSubmitStatus.value = 'wrong'
    if (currentAttempts.value >= 3) {
      recordItem.isFinalPass = true
      setTimeout(() => playAudio(`本次作答待优化，参考范文讲解：${res.aiOptText}`), 1000)
    }
  }

  userInput.value = ''
  nextTick(() => {
    if (rightContainerRef.value) {
      rightContainerRef.value.scrollTop = 0
    }
  })
}

const handleVoice = () => console.log('唤起语音输入')
const handlePhoto = () => photoInputRef.value?.click()
const onPhotoCapture = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const ocrRes = await recognizeOCR(file)
  userInput.value = ocrRes
  target.value = ''
}

// ========== 导航跳转 ==========
const goBack = () => router.push('/')
const goToReport = () => router.push('/report')
const goHome = () => router.push('/')

// 首次进入自动播放
const initFirstPlay = async () => {
  if (hasInitPlay.value) return
  hasInitPlay.value = true
  playAudio(foreignGirlTalk.value)
  setTimeout(() => {
    playAudio(talkText.value)
  }, 3000)
}

// ========== 生命周期 ==========
onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
  initFirstPlay()
})
onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

<style scoped>
.page-container {
  width: 1920px;
  height: 1080px;
  background: url('/image/image 125.png') no-repeat center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
}

/* ========== 顶部导航栏 ========== */
.top-nav {
  position: absolute;
  top: 30px;
  left: 60px;
  right: 60px;
  height: 65px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 25px;
  background: rgba(245, 244, 243, 0.45);
  border-radius: 12px;
  color: #4e1b05ed;
  font-weight: 900;
  font-size: 25px;
  z-index: 20;
}
.back-icon {
  font-size: 22px;
  cursor: pointer;
}
.top-nav-buttons {
  margin-left: auto;
  display: flex;
  gap: 12px;
}
.nav-btn {
  width: 120px;
  height: 35px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: rgb(220, 137, 29);
  color: #fff;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 300;
  letter-spacing: 1px;
  box-shadow: 0 2px 4px rgba(118, 117, 117, 0.647);
  cursor: pointer;
}
.btn-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* ========== 场景人物区域 ========== */
.scene-characters-wrap {
  position: absolute;
  top: 120px;
  left: 0;
  right: 0;
  bottom: 320px;
  z-index: 5;
}
/* 完成状态提升整体层级，确保内部所有元素在遮罩上方 */
.scene-high-z {
  z-index: 15;
}

/* 中间外国女孩 */
.foreign-girl-area {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.foreign-girl-img {
  width: 80px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
}
.foreign-bubble {
  position: relative;
  width: 340px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #7c4403;
  border-radius: 12px;
  padding: 14px 40px 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  margin-bottom: 12px;
}
.bubble-voice-icon-right {
  position: absolute;
  right: 12px;
  top: 14px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  object-fit: contain;
}
.bubble-arrow-bottom {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -10px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #ffffff;
}

/* 右侧罗罗数字人 */
.digital-human-area {
  position: absolute;
  right: 100px;
  bottom: -120px;
  display: flex;
  gap: 14px;
  align-items: flex-end;
}
.digital-human-img {
  width: 160px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
  transition: width 0.3s ease;
}
.digital-human-img.complete-human-size {
  width: 130px;
}

/* 气泡+操作按钮容器 */
.bubble-action-wrap {
  position: absolute;
  right: 180px;
  bottom: 60px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 19px;
}
.human-talk-bubble {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px 14px 40px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.bubble-voice-icon-left {
  position: absolute;
  left: 12px;
  top: 14px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  object-fit: contain;
}
.bubble-text {
  flex: 1;
  max-height: 72px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.human-talk-bubble.expanded .bubble-text {
  max-height: none;
}
/* 气泡箭头在右侧，指向数字人 */
.bubble-arrow-right {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid #ffffff;
}

.completion-feedback-bubble {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.feedback-message {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  white-space: pre-line;
  margin: 0;
}

/* 完成页操作按钮栏 */
.completion-action-bar {
  position: relative;
  width: 100%;
  display: flex;
  gap: 12px;
}
.completion-action-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.bar-btn-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.report-btn {
  background: #daa520;
  color: #ffffff;
}
.report-btn:hover {
  background: #c4941c;
}
.home-btn {
  background: #ffffff;
  color: #daa520;
  border: 1px solid #daa520;
}
.home-btn:hover {
  background: #fff8e6;
}

/* ========== 左下角答题区域 ========== */
.bottom-input-area {
  position: absolute;
  left: 80px;
  bottom: 60px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}
.bottom-input-area.complete-mode {
  z-index: 12;
}

/* 历史作答列表 */
.history-answer-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 260px;
  overflow-y: auto;
  width: 520px;
}
.history-item-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

/* 你的作品卡片 */
.stu-answer-card {
  position: relative;
  border-radius: 12px;
  padding: 14px 18px;
  border-width: 2px;
  border-style: solid;
  width: 100%;
  box-sizing: border-box;
}
.card-correct {
  background: #62bd4b;
  border-color: #2e881a;
  color: #fff;
}
.card-wrong {
  background: #f4baba;
  border-color: #b42020;
  color: #b42020;
}
.card-tag {
  position: absolute;
  top: -10px;
  right: 16px;
  background: inherit;
  color: inherit;
  border: none;
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
}
.stu-content-text {
  font-size: 15px;
  line-height: 1.6;
}

/* 参考范文卡片 */
.ai-ref-card {
  position: relative;
  background: #fff9cc;
  border: 2px solid #c9b044;
  border-radius: 12px;
  padding: 12px 18px;
  width: 100%;
  box-sizing: border-box;
}
.ai-ref-label {
  position: absolute;
  top: -10px;
  right: 16px;
  background: #fff9cc;
  color: #947000;
  border: none;
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
}
.ai-ref-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-top: 4px;
}

/* 输入操作区 */
.input-operation-wrap {
  width: 520px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.feel-input-box {
  position: relative;
}
.feel-input {
  width: 100%;
  min-height: 120px;
  border: 1.5px solid #b8c8f0;
  border-radius: 14px;
  padding: 14px 140px 14px 16px;
  font-size: 16px;
  resize: none;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.3s, color 0.3s;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.95);
}
.feel-input.has-content {
  border-color: #daa520;
}
.feel-input.input-invalid {
  border-color: red;
}
.text-red {
  color: red;
}
.func-btn-group {
  position: absolute;
  right: 12px;
  bottom: 14px;
  display: flex;
  gap: 10px;
}
.func-btn {
  padding: 6px 14px;
  border: 1px solid #eff1f5;
  background: #fff;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.func-text {
  color: #daa520;
}
.func-icon-img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.submit-btn-wrap {
  display: flex;
  justify-content: flex-start;
}
.submit-btn {
  width: 130px;
  height: 44px;
  border: none;
  border-radius: 22px;
  background: #daa520;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.submit-btn.submit-disabled {
  background: #e3e1e1;
  cursor: not-allowed;
  color: #b2afaf;
}

/* 完成遮罩 */
.completion-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 11;
}
.digital-human-area.completed-above-overlay {
  z-index: 16;
}
</style>