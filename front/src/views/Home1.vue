<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const stageModules = ref([
  {
    id: 'preview',
    name: '寻找文化讨论会',
    color: '#F7D76B',
    tasks: [
      { id: 'write-feel', name: '写写感想', active: true, finished: false },
      { id: 'fill-blank', name: '初步感悟', active: false, finished: false }
    ]
  },
  {
    id: 'warmup',
    name: '重温文化采风',
    color: '#EDF5E6',
    tasks: [
      { id: 'warmup-game', name: '重温文化互动', active: false, finished: false }
    ]
  },
  {
    id: 'method',
    name: '编剧大师课',
    color: '#EDF5E6',
    tasks: [
      { id: 'zhaozhouqiao', name: '学习《赵州桥》的表达方法', active: false, finished: false },
      { id: 'qingming', name: '学习《一幅名扬中外的画》的表达方法', active: false, finished: false }
    ]
  },
  {
    id: 'creation',
    name: '节目制作工坊',
    color: '#EDF5E6',
    tasks: [
      { id: 'creation-main', name: '宣传文化创作', active: false, finished: false }
    ]
  },
  {
    id: 'homework',
    name: '下期预告',
    color: '#EDF5E6',
    tasks: [
      { id: 'homework-main', name: '传承文化任务', active: false, finished: false }
    ]
  }
])

const currentStageId = ref<string | null>(null)

const selectStage = (stageId: string) => {
  currentStageId.value = currentStageId.value === stageId ? null : stageId
}

const selectTask = (stageId: string, taskId: string) => {
  // 任务ID到路由的映射
  const routeMap: Record<string, string> = {
    'write-feel': '/preview/write-feel',
    'fill-blank': '/preview/fill-blank',
    'zhaozhouqiao': '/method/zhaozhouqiao',
    'qingming': '/method/qingming'
  }
  const targetRoute = routeMap[taskId] || `/${stageId}`
  router.push(targetRoute)
}

// 原有函数完全不动，只给preview使用
const currentTasks = () => {
  if (currentStageId.value !== 'preview') return []
  return stageModules.value.find(item => item.id === 'preview')?.tasks || []
}

// 新增：获取编剧大师课任务
const methodTasks = () => {
  return stageModules.value.find(item => item.id === 'method')?.tasks || []
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<template>
  <div class="scene-home">
    <!-- 汉服小小人物 -->
    <img class="avatar-xiaoxiao" src="/小小_汉服 1.png" alt="小小汉服人物" />

    <!-- 底部阶段导航 -->
    <div class="stage-nav">
      <div
        v-for="stage in stageModules"
        :key="stage.id"
        class="stage-btn"
        :class="{ 'is-active': stage.id === currentStageId }"
        @click="selectStage(stage.id)"
      >
        {{ stage.name }}
      </div>
    </div>

    <!-- 【原有弹窗 完全原样保留，无任何修改】项目策划会 弹出任务按钮组 -->
    <Transition name="fade">
      <div v-if="currentStageId === 'preview'" class="task-popup-wrapper">
        <!-- 肉色背景框 -->
        <div class="task-popup">
          <div
            v-for="task in currentTasks()"
            :key="task.id"
            class="task-popup-item"
            :class="{ 'is-active': task.active, 'task-finished': task.finished }"
            @click="selectTask('preview', task.id)"
          >
            {{ task.name }}
          </div>
        </div>
        <!-- 倒三角指向项目策划会 -->
        <div class="task-popup-arrow"></div>
      </div>
    </Transition>

    <!-- 【全新新增】编剧大师课弹窗 -->
    <Transition name="fade">
      <div v-if="currentStageId === 'method'" class="method-popup-wrapper">
        <div class="task-popup">
          <div
            v-for="task in methodTasks()"
            :key="task.id"
            class="method-popup-item"
            :class="{ 'task-finished': task.finished }"
            @click="selectTask('method', task.id)"
          >
            <span>⇨</span>
            {{ task.name }}
          </div>
        </div>
        <div class="task-popup-arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ===================== 下方全部原有样式 一字未改 ===================== */
.scene-home {
  min-height: 100vh;
  width: 100%;
  background: url('/image 19.png') center center / cover no-repeat;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* 汉服小小人物 - 居中偏左 */
.avatar-xiaoxiao {
  position: absolute;
  left: 27%;
  bottom: 90px;
  height: 420px;
  width: auto;
  pointer-events: none;
  user-select: none;
  z-index: 2;
  image-rendering: -webkit-optimize-contrast;
}

/* 弹出框外层容器 - 定位在项目策划会正上方 */
.task-popup-wrapper {
  position: absolute;
  bottom: 96px;  /* 底部导航(40px) + 导航高度(40px) + 间距(10px) */
  /* 项目策划会按钮位置：导航居中，第一个按钮左侧 */
  left: calc(50% - 685px);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
}

/* 肉色背景框 */
.task-popup {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 17px 20px;
  background: rgba(245, 222, 195, 0.85);
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
}

/* 倒三角指向项目策划会 */
.task-popup-arrow {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 12px solid rgba(245, 222, 195, 0.85);
}

.task-popup-item {
  width: 130px;
  height: 44px;
  line-height: 44px;
  background: #f7f6f4;
  color: #7b521c;
  border-radius: 15px;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 1px;
}

.task-popup-item:hover {
  background: #f5f7fa;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.task-popup-item.is-active {
  background: #f6f3f1;
  color: #6d4e0b;
  box-shadow: 0 4px 16px rgba(74, 144, 217, 0.3);
}

/* 新增：原有任务完成变绿色 */
.task-popup-item.task-finished {
  background: #69d059;
  color: #ffffff;
}

/* 底部阶段导航 */
.stage-nav {
  position: absolute;
  bottom: 40px;
  left: 34%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  z-index: 3;
}

.stage-btn {
  height: 44px;
  line-height: 44px;
  padding: 0 36px;
  background: rgba(243, 231, 194, 0.6);
  color: #854f22;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  letter-spacing: 0px;
  border: 0.5px solid rgba(255, 255, 255, 0.8);
}

.stage-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stage-btn.is-active {
  /* 透明偏肉色 */
  background: rgb(244, 178, 98);
  color: #8B6914;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(245, 222, 195, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* ===================== 下方全部为新增样式，原有样式完全不动 ===================== */
.method-popup-wrapper {
  position: absolute;
  bottom: 96px;
  left: 36%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
}

.method-popup-item {
  min-width: 350px;
  padding: 12px 19px;
  background: #ffffff;
  color: #070707;
  border-radius: 15px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
/* 任务完成绿色 */
.method-popup-item.task-finished {
  background: #69d059;
  color: #fff;
}
.method-popup-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
}
</style>