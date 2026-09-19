<template>
  <div class="page-bg"></div>
  <div class="page-wrapper">
    <!-- 顶部栏 -->
    <header class="top-bar">
      <button
        @click="goHome"
        class="back-btn"
        title="返回首页"
      >
        <svg viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
      <span class="top-title">宣传文化</span>
    </header>

    <div class="main-layout">
      <!-- 左侧功能菜单 -->
      <aside class="sidebar">
        <div
          v-for="group in menuGroups"
          :key="group.title"
          class="menu-group"
        >
          <h3 class="menu-group-title">{{ group.title }}</h3>
          <div class="menu-items">
            <button
              v-for="item in group.items"
              :key="item.route"
              @click="handleMenu(item)"
              class="menu-btn"
            >
              {{ item.name }}
            </button>
          </div>
        </div>
      </aside>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <!-- 任务提示框 -->
        <div class="bubble" :class="{ speaking: isSpeaking }">
            <button class="speaker-btn" @click="speakBubble" title="朗读">
              <img src="/image/语音朗读.png" alt="朗读图标" />
            </button>
            <p class="bubble-text">{{ bubbleText }}</p>
        </div>

        <!-- 角色 -->
        <div class="character character-1">
          <img src="/image/罗罗_汉服 1.png" alt="罗罗" />
        </div>
        <div class="character character-2">
          <img src="/image/外国女孩 1.png" alt="外国女孩" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useAudioPlayer } from '../../composables/useAudioPlayer'
const router = useRouter()
const bubbleText = ref('节目最后，请在左边栏目中选择一种你喜欢的方式，为米娅也准备一份带有我们文化特色的礼物吧。')

// TTS 语音播报：调后端 POST /api/utils/tts 接口
const { isPlaying: isSpeaking, playAudio } = useAudioPlayer()

function speakBubble() {
  playAudio(bubbleText.value)
}

interface MenuItem {
  name: string
  route: string
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: 'AI视觉设计中心',
    items: [
      { name: '创作手绘', route: 'HandcopyCreation' },
      { name: '创作海报', route: 'Post' },
    ],
  },
  {
    title: '文艺创作中心',
    items: [
      { name: '创作古诗', route: 'Poem' },
      { name: '创作现代诗', route: 'Poem' },
      { name: '创作小剧本', route: 'CreatePlay' },
    ],
  },
  {
    title: '学校中医未病治疗中心',
    items: [
      { name: '参观了解中医', route: 'TcmWorkshop' },
    ],
  },
  {
    title: '以上方式都不适合我',
    items: [
      { name: '我有其他想法', route: 'CreateIdea' },
    ],
  },
]

function goHome() {
  router.push({ name: 'Home' })
}

function handleMenu(item: MenuItem) {
  router.push({ name: item.route })
}
</script>

<style scoped>
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('/image/image 123.png') no-repeat center center;
  background-size: cover;
}

.page-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  z-index: 1;
}

/* 顶部栏 */
.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 16px;
}

.top-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.back-btn:hover {
  background: #fff;
  transform: scale(1.08);
}

.back-btn svg {
  width: 24px;
  height: 24px;
  color: #374151;
  fill: none;
  stroke: currentColor;
}

/* 主布局 */
.main-layout {
  position: relative;
  z-index: 5;
  display: flex;
  height: calc(100vh - 90px);
  padding: 0 24px;
  gap: 24px;
}

/* ========== 侧边栏样式 ========== */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(4px);
}

.menu-group {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.menu-group-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-btn {
  padding: 8px 12px;
  background: #f59e0b;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-btn:hover {
  background: #d97706;
}

/* ========== 内容区域样式 ========== */
.content-area {
  flex: 1;
  position: relative;
}

.bubble {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid #e07a06;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  max-width: 300px;
  padding: 16px 52px 18px 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  position: absolute;
  flex-shrink: 0;
  margin-top: 30%;
  bottom: 250px;
  right: 350px;
}

.bubble-text {
  font-size: 15px;
  line-height: 1.72;
  color: #333333;
  margin: 0;
}

.speaker-btn {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 34px;
  height: 34px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent; /* 清除按钮默认灰色背景 */
  padding: 0; /* 清除浏览器自带padding，这就是那个方块！ */
  outline: none;
}
.character {
  position: absolute;
  z-index: 5;
}

.character img {
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

.character-1 {
  right: 10%;
  bottom: 8%;
}

.character-1 img {
  height: 450px;
  width: auto;
  bottom: 5%;
  right: 10%;
}

.character-2 {
  position: absolute;
  bottom: 35%;
  right: 52%;
}

.character-2 img {
  height: 180px;
}
</style>
