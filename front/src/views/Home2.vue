<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const stageModules = ref([
  {
    id: 'preview',
    name: '寻找文化',
    color: '#409EFF',
    children: [
      { id: 'write-feel', name: '写写感想', active: true },
      { id: 'fill-blank', name: '初步感悟', active: false }
    ]
  },
  {
    id: 'warmup',
    name: '重温文化',
    color: '#4A6B29',
    children: [
      { id: 'warmup-game', name: '重温文化', active: false }
    ]
  },
  {
    id: 'method',
    name: '宣传有法',
    color: '#5B21B6',
    children: [
      { id: 'zhaozhouqiao', name: '赵州桥', active: false },
      { id: 'qingming', name: '一副名扬中外的画', active: false }
    ]
  },
  {
    id: 'creation',
    name: '宣传文化',
    color: '#9333EA',
    children: [
      { id: 'creation-main', name: '宣传文化', active: false }
    ]
  },
  {
    id: 'homework',
    name: '传承文化',
    color: '#EA580C',
    children: [
      { id: 'homework-main', name: '传承文化', active: false }
    ]
  }
])

// 点击子卡片跳转对应任务页
const selectTask = (stageId: string, taskId: string) => {
  router.push(`/${stageId}?taskId=${taskId}`)
}

onMounted(() => {
  // 保留登录校验，无UI展示
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<template>
  <div class="home">
    <!-- 汉服小小人物 固定右下角 -->
    <img class="home__avatar-xiaoxiao" src="/image/小小_汉服 1.png" alt="小小汉服人物" />
      <!-- 仅保留核心模块卡片区，完全匹配设计图 -->
    <div class="home__modules">
      <!-- 第一行：寻找文化、重温文化、宣传有法 -->
      <div class="home__modules-row">
        <div
          v-for="module in stageModules.slice(0, 3)"
          :key="module.id"
          class="home__module-card"
        >
          <!-- 模块彩色标题栏 -->
          <div
            class="home__module-title"
            :style="{ backgroundColor: module.color }"
          >
            {{ module.name }}
          </div>
          <!-- 子任务卡片 -->
          <div class="home__module-children">
            <div
              v-for="child in module.children"
              :key="child.id"
              class="home__child-card"
              :class="{ 'is-active': child.active }"
              @click="selectTask(module.id, child.id)"
            >
              {{ child.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行：宣传文化、传承文化（左对齐） -->
      <div class="home__modules-row home__modules-row--bottom">
        <div
          v-for="module in stageModules.slice(3)"
          :key="module.id"
          class="home__module-card"
        >
          <div
            class="home__module-title"
            :style="{ backgroundColor: module.color }"
          >
            {{ module.name }}
          </div>
          <div class="home__module-children">
            <div
              v-for="child in module.children"
              :key="child.id"
              class="home__child-card"
              :class="{ 'is-active': child.active }"
              @click="selectTask(module.id, child.id)"
            >
              {{ child.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  width: 100%;
  /* 引入背景图 - 使用url()函数 */
  background: url('/image/image 19.png') center center / contain no-repeat;
    display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 80px;
  box-sizing: border-box;
  /* 开启相对定位，用于内部人物绝对定位 */
  position: relative;
  overflow: hidden;
}

/* 汉服小小人物 右下角固定 */
.home__avatar-xiaoxiao {
  position: absolute;
  right: 500px;
  bottom: 60px;
  height: 330px;
  width: auto;
  pointer-events: none;
  user-select: none;
  /* 保持图片质量，不放大超过原始尺寸 */
  image-rendering: -webkit-optimize-contrast;
}

/* 模块卡片总容器 */
.home__modules {
  width: 100%;
  max-width: 1300px;
  display: flex;
  flex-direction: column;
  gap: 100px;
  z-index: 2;
}

/* 卡片行 - 统一居中对齐 */
.home__modules-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 60px;
}

.home__modules-row--bottom {
  margin-left: 150px;
  justify-content: left;
  gap: 20px;
}

.home__module-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: auto;
  min-width: 160px;
  /* 固定总高度：标题48px + 间距16px + 子卡片150px = 214px */
  height: 214px;
}

/* 模块彩色标题栏 - 固定高度 */
.home__module-title {
  height: 48px;
  line-height: 48px;
  text-align: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  border-radius: 2px;
  user-select: none;
  flex-shrink: 0;
}

/* 子卡片容器 - 固定高度 */
.home__module-children {
  display: flex;
  gap: 24px;
  height: 150px;
  align-items: flex-start;
  flex: 1;
}

/* 子任务卡片 - 固定尺寸 */
.home__child-card {
  width: 160px;
  height: 150px;
  background: #39bc34;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border-radius: 2px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  user-select: none;
  flex-shrink: 0;
  text-align: center;
  padding: 0 8px;
  box-sizing: border-box;
}

.home__child-card:active {
  opacity: 0.8;
}

/* 已激活卡片高亮蓝色 */
.home__child-card.is-active {
  background: #409EFF;
}
</style>