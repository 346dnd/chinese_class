<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { courseAPI } from '@/api'
import { useDigitalHuman } from '@/composables/useDigitalHuman'
import Button from '@/components/base/Button.vue'
import DigitalHuman from '@/components/business/DigitalHuman.vue'

const router = useRouter()
const userStore = useUserStore()
const { showDigitalHuman, digitalHumanName, digitalHumanMessage, hide, show } = useDigitalHuman()

const waterLevel = ref(0)
const showQuestion = ref(false)
const selectedAnswer = ref('')
const isCorrect = ref(false)
const showResult = ref(false)

const loadStage = async () => {
  try {
    const detail = await courseAPI.getStage('warmup')
    if (detail.digitalHumanPrompt) {
      show('罗罗', detail.digitalHumanPrompt)
    }
  } catch (e) {
    console.error('Failed to load stage:', e)
  }
}

const clickWater = () => {
  if (showQuestion.value) return
  
  waterLevel.value += 25
  
  if (waterLevel.value >= 100) {
    showQuestion.value = true
  }
}

const selectAnswer = (answer: string) => {
  selectedAnswer.value = answer
}

const submitAnswer = () => {
  if (!selectedAnswer.value) return
  
  isCorrect.value = selectedAnswer.value === '1'
  showResult.value = true
  
  const message = isCorrect.value 
    ? '选择正确，恭喜你得到学校科创馆参观券！' 
    : '选择错误。洪水冲击力很大，大桥有可能被冲毁；而小桥洞让洪水分流，从而减少它的冲击力。'
  
  setTimeout(() => {
    show('罗罗', message)
  }, 500)
}

const goNext = () => {
  router.push('/method')
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
  <div class="warmup">
    <div class="warmup__header">
      <button class="warmup__back" @click="goBack">← 返回</button>
      <div class="warmup__title">重温文化</div>
    </div>
    
    <div class="warmup__game">
      <div class="warmup__game-area">
        <div class="warmup__river">
          <div 
            class="warmup__water" 
            :style="{ height: `${waterLevel}%` }"
          ></div>
          <div class="warmup__bridge">
            <div class="warmup__bridge-hole warmup__bridge-hole--large"></div>
            <div class="warmup__bridge-hole warmup__bridge-hole--small"></div>
            <div class="warmup__bridge-hole warmup__bridge-hole--small"></div>
            <div class="warmup__bridge-hole warmup__bridge-hole--small"></div>
            <div class="warmup__bridge-hole warmup__bridge-hole--small"></div>
          </div>
        </div>
        
        <button 
          v-if="!showQuestion"
          class="warmup__click-btn"
          @click="clickWater"
        >
          点击河水
        </button>
        
        <div v-else class="warmup__question">
          <div class="warmup__question-text">
            如果没有小桥洞，大水有可能冲毁大桥吗？
          </div>
          <div class="warmup__options">
            <button 
              class="warmup__option"
              :class="{ 'warmup__option--selected': selectedAnswer === '1', 'warmup__option--correct': showResult && isCorrect && selectedAnswer === '1' }"
              @click="selectAnswer('1')"
            >
              1. 有可能
            </button>
            <button 
              class="warmup__option"
              :class="{ 'warmup__option--selected': selectedAnswer === '2', 'warmup__option--wrong': showResult && !isCorrect && selectedAnswer === '2' }"
              @click="selectAnswer('2')"
            >
              2. 不可能
            </button>
          </div>
          <Button
            v-if="!showResult"
            type="primary"
            @click="submitAnswer"
          >
            提交答案
          </Button>
          <Button
            v-else
            type="primary"
            @click="goNext"
          >
            继续
          </Button>
        </div>
      </div>
      
      <div class="warmup__hint">提示：点击河水，水位会上涨。请一步步点击河水，直至弹出问题，并回答。</div>
    </div>
    
    <DigitalHuman
      :show="showDigitalHuman"
      :name="digitalHumanName"
      :message="digitalHumanMessage"
      @close="hide"
    />
  </div>
</template>

<style scoped>
.warmup {
  min-height: 100vh;
  background: #fff;
  padding: 20px;
}

.warmup__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.warmup__back {
  font-size: 18px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
}

.warmup__title {
  flex: 1;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.warmup__game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.warmup__game-area {
  width: 100%;
  max-width: 500px;
  height: 400px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.warmup__river {
  width: 100%;
  height: 100%;
  background: #e3f2fd;
  position: relative;
}

.warmup__water {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #42a5f5, #1565c0);
  transition: height 0.5s ease;
}

.warmup__bridge {
  position: absolute;
  bottom: 50%;
  left: 10%;
  right: 10%;
  height: 60px;
  background: #8d6e63;
  border-radius: 8px;
}

.warmup__bridge-hole {
  position: absolute;
  bottom: -100%;
  background: #e3f2fd;
}

.warmup__bridge-hole--large {
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 150px;
  border-radius: 50% 50% 0 0;
}

.warmup__bridge-hole--small {
  width: 40px;
  height: 80px;
  border-radius: 50% 50% 0 0;
}

.warmup__bridge-hole--small:nth-child(2) { left: 15%; }
.warmup__bridge-hole--small:nth-child(3) { left: 30%; }
.warmup__bridge-hole--small:nth-child(4) { right: 30%; }
.warmup__bridge-hole--small:nth-child(5) { right: 15%; }

.warmup__click-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 32px;
  font-size: 18px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.warmup__question {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 24px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.warmup__question-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.warmup__options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warmup__option {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: #fff;
  cursor: pointer;
  text-align: left;
}

.warmup__option--selected {
  border-color: #4CAF50;
  background: #e8f5e9;
}

.warmup__option--correct {
  border-color: #4CAF50;
  background: #e8f5e9;
}

.warmup__option--wrong {
  border-color: #f44336;
  background: #ffebee;
}

.warmup__hint {
  font-size: 14px;
  color: #999;
  text-align: center;
}
</style>
