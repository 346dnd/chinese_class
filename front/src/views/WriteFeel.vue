<template>
  <div class="page-container">
    <!-- 顶部返回导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">&lt;</span>
      <span class="nav-title">寻找文化：写写感想</span>
    </div>

    <!-- 数字人区域 -->
    <div class="digital-human-area">
      <img
        src="/image/小小_汉服 1.png"
        alt="数字人"
        class="digital-human-img"
      />
    </div>

    <!-- 课文标签切换 -->
    <div class="tab-wrapper">
      <div
        v-for="tabName in tabList"
        :key="tabName"
        class="tab-item"
        :class="{ active: activeTab === tabName }"
        @click="switchArticleTab(tabName)"
      >
        {{ tabName }}
      </div>
      <div class="modal-close-icon" @click="goBack">×</div>
    </div>

    <!-- 右侧容器（弹窗 + 提交按钮） -->
    <div class="right-container">
      <div class="write-feel-modal">
      <h3 class="modal-title">写写感想 <span class="voice-icon">🔊</span></h3>

      <p class="guide-desc">
        <template v-if="currentArticle.id === 'paper'">
          这三篇课文都写到了中华优秀传统文化的内容，在《纸的发明》里，是哪些方面让你自豪？《赵州桥》《一幅名扬中外的画》又分别是哪些方面让你自豪？请把特别让你自豪的这些方面写下来，记得都能够联系相应的课文内容和生活实际想法。
        </template>
        <template v-else-if="currentArticle.id === 'bridge'">
          在《赵州桥》里，哪些方面让你感到自豪？
        </template>
        <template v-else-if="currentArticle.id === 'painting'">
          《一幅名扬中外的画》哪些细节让你感到自豪？
        </template>
      </p>

      <!-- 绿色只读框 -->
      <div class="readonly-green-box" v-if="currentArticle.hintText1">
        {{ currentArticle.hintText1 }}
      </div>
      <div class="readonly-green-box small" v-if="currentArticle.hintText2">
        {{ currentArticle.hintText2 }}
      </div>

      <!-- 输入框（内含语音/拍照按钮） -->
      <div class="input-wrapper">
        <div class="feel-input-box">
          <textarea
            v-model="userInputFeel"
            class="feel-input"
            placeholder="输入你的理由..."
            :disabled="inputDisabled"
          ></textarea>
          <!-- 输入框右下角功能按钮 -->
          <div class="func-btn-group">
            <button
              class="func-btn"
              @click="handleVoice"
              :disabled="inputDisabled"
              title="语音"
            >
              <span class="func-icon">🎤语音</span>
            </button>
            <button
              class="func-btn"
              @click="handlePhoto"
              :disabled="inputDisabled"
              title="拍照"
            >
              <span class="func-icon">📷拍照</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      <!-- 提交按钮（在白色弹窗外部下方） -->
      <button
        class="submit-btn"
        @click="submitFeel"
        :disabled="inputDisabled"
      >
        ⇧ 提交
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tabList = ref<string[]>(['纸的发明', '赵州桥', '一幅名扬中外的画'])
const activeTab = ref<string>('纸的发明')

const articles = reactive({
  paper: {
    id: 'paper',
    hintText1: '在《纸的发明》中，是哪些让你感到自豪？',
    hintText2: '这是学生输入的文字信息，这里的文字只是为了让学生可以看到前面的课文输入的内容，只可以查看，不可以重新修改。'
  },
  bridge: {
    id: 'bridge',
    hintText1: '在《赵州桥》，是哪些让你感到自豪？',
    hintText2: ''
  },
  painting: {
    id: 'painting',
    hintText1: '在《一幅名扬中外的画》里，是哪些细节让你感到自豪？',
    hintText2: ''
  }
})

const currentArticle = ref(articles.paper)

// 用户输入
const userInputFeel = ref('')
const inputDisabled = ref(false)

/**
 * 加载文章内容
 */
const loadArticleContent = (tabName: string) => {
  const mapping: Record<string, keyof typeof articles> = {
    '纸的发明': 'paper',
    '赵州桥': 'bridge',
    '一幅名扬中外的画': 'painting'
  }
  const key = mapping[tabName]
  if (key) {
    currentArticle.value = articles[key]
    userInputFeel.value = ''
  }
}

// 切换标签
const switchArticleTab = (tabName: string) => {
  if (tabName === activeTab.value) return
  activeTab.value = tabName
  loadArticleContent(tabName)
}

/**
 * 语音按钮
 */
const handleVoice = () => {
  alert('语音功能：后续接入接口')
}

/**
 * 拍照按钮
 */
const handlePhoto = () => {
  alert('拍照功能：后续接入接口')
}

// 提交并下一篇
const submitFeel = () => {
  if (!userInputFeel.value.trim()) {
    alert('请填写感想内容')
    return
  }

  const currentIndex = tabList.value.indexOf(activeTab.value)
  if (currentIndex < tabList.value.length - 1) {
    switchArticleTab(tabList.value[currentIndex + 1])
  } else {
    alert('已是最后一篇课文，提交成功！')
    goBack()
  }
}

const goBack = () => router.push('/')

onMounted(() => {
  loadArticleContent(activeTab.value)
})
</script>

<style scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  background: url('/image 110.png') no-repeat center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
}

/* 数字人区域 */
.digital-human-area {
  position: absolute;
  left: 180px;
  bottom: 20px;
  z-index: 5;
}
.digital-human-img {
  width: 180px;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.25));
}

/* 顶部导航栏 严格匹配原型 */
.top-nav {
  position: absolute;
  top: 30px;
  left: 30px;
  right: 30px;
  height: 54px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 25px;
  background: rgba(35, 25, 16, 0.45);
  border-radius: 12px;
  color: #ffffff;
  font-size: 18px;
  z-index: 10;
}
.back-icon {
  font-size: 22px;
  cursor: pointer;
}

/* 顶部标签栏 */
.tab-wrapper {
  position: absolute;
  top: 110px;
  left: 40px;
  display: flex;
  align-items: center;
  background: rgba(240, 239, 238, 0.3);
  border-radius: 12px;
  border: 1px solid rgb(250, 248, 247,0.5);
  padding: 6px 14px;
  gap: 8px;
  z-index: 10;
}
.tab-item {
  padding: 8px 22px;
  height: 38px;
  background: #ffffff;
  border-radius: 20px;
  font-size: 16px;
  line-height: 20px;
  color: #333;
  cursor: pointer;
  border: 1px solid #ddd;
}
.tab-item.active {
  background: #3668e8;
  color: #fff;
  border-color: #3668e8;
}
.modal-close-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  text-align: center;
  line-height: 32px;
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
}

/* 右侧容器：弹窗 + 提交按钮 */
.right-container {
  position: absolute;
  top: 120px;
  right: 30px;
  width: 540px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

/* 右侧白色弹窗 高度精确适配内容 */
.write-feel-modal {
  width: 100%;
  background: rgba(255, 255, 255, 0.89);
  border-radius: 18px;
  padding: 24px 26px 22px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #111;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.voice-icon {
  font-size: 16px;
}

.guide-desc {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 14px;
}

/* 绿色只读输入框 */
.readonly-green-box {
  color: #111;
  padding: 4px 0px;
  border-radius: 12px;
  font-size: 16px;
  margin-bottom: 8px;
}
.readonly-green-box.small {
  padding: 14px 14px;
  background: #97e37a;
  font-size: 14px;
  color: #ffffff;
}

/* 感想输入框 */
.input-wrapper {
  margin-top: 6px;
}
.feel-input-box {
  position: relative;
}
.feel-input {
  width: 100%;
  min-height: 90px;
  border: 1.5px solid #b8c8f0;
  box-shadow: 0 0 10px rgba(4, 111, 232, 0.25);
  border-radius: 14px;
  padding: 14px 60px 14px 14px;
  font-size: 16px;
  resize: none;
  outline: none;
  line-height: 1.5;
}

/* 语音拍照按钮组 右下角内嵌 */
.func-btn-group {
  position: absolute;
  right: 10px;
  bottom: 15px;
  display: flex;
  gap: 10px;
}
.func-btn {
  padding: 5px 14px;
  border: 1px solid #eff1f5;
  background: #fff;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 提交按钮（白色弹窗外部下方） */
.submit-btn {
  width: 100%;
  height: 52px;
  background: #2a53b8;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.25s;
  animation: slideDown 0.3s ease;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(42, 83, 184, 0.4);
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>