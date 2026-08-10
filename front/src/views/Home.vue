<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { userState } from '../stores/user'

const router = useRouter()

// ---------- 原有数据定义（未做任何修改） ----------
const stageModules = ref([
  {
    id: 'preview',
    name: '寻找文化讨论会',
    color: '#F7D76B',
    tasks: [
      { id: 'write-feel', name: '写写感想', active: true, finished: false, path: '/preview/write-feel' },
      { id: 'fill-blank', name: '初步感悟', active: false, finished: false, path: '/preview/fill-blank' }
    ]
  },
  {
    id: 'warmup',
    name: '重温文化采风',
    color: '#EDF5E6',
    tasks: [
      { id: 'warmup-game', name: '重温文化互动', active: false, finished: false, path: '/warmup/warmup-game' }
    ]
  },
  {
    id: 'method',
    name: '宣传文化大师课',
    color: '#EDF5E6',
    tasks: [
      { id: 'zhaozhouqiao', name: '学习《赵州桥》的表达方法', active: false, finished: false, path: '/method/zhaozhouqiao' },
      { id: 'qingming', name: '学习《一幅名扬中外的画》的表达方法', active: false, finished: false, path: '/method/qingming' }
    ]
  },
  {
    id: 'creation',
    name: '宣传文化演播厅',
    color: '#293320ff',
    tasks: [
      { id: 'talk-culture', name: '讲解优秀文化', active: false, finished: false, path: '/creation/talk-culture' },
      { id: 'create-culture', name: '文化主题创作', active: false, finished: false, path: '/creation/create-culture' }
    ]
  },
  {
    id: 'homework',
    name: '传承文化践行坊',
    color: '#EDF5E6',
    tasks: [
      { id: 'homework-main', name: '传承文化任务', active: false, finished: false, path: '/homework' }
    ]
  }
])

const currentStageId = ref<string | null>(null)


const selectTask = (task: { id: string; name: string; active: boolean; finished: boolean; path: string }) => {
  router.push(task.path)
}

const currentTasks = () => {
  if (currentStageId.value !== 'preview') return []
  return stageModules.value.find(item => item.id === 'preview')?.tasks || []
}

const selectStage = (stageId: string) => {
  // 重温文化采风 - 直接跳转到 WarmupGame 页面
  if (stageId === 'warmup') {
    router.push('/warmup/warmup-game')
    return
  }
  currentStageId.value = currentStageId.value === stageId ? null : stageId
}
const methodTasks = () => {
  return stageModules.value.find(item => item.id === 'method')?.tasks || []
}

const creationTasks = () => {
  return stageModules.value.find(item => item.id === 'creation')?.tasks || []
}

// ========== 自适应缩放相关逻辑（新增） ==========
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

const homeStyle = ref({
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
  homeStyle.value = {
    transform: `scale(${scaleX}, ${scaleY})`,
    transformOrigin: 'top left',
    width: DESIGN_WIDTH + 'px',
    height: DESIGN_HEIGHT + 'px',
    marginLeft: '0px',
    marginTop: '0px'
  }
}

onMounted(() => {
  if (!userState.isLoggedIn) {
    router.push('/login')
  }
  updateScale() // 初始化缩放
  window.addEventListener('resize', updateScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

<template>
  <div class="scene-home" :style="homeStyle">
    <!-- ========== 右上角功能按钮区域｜垂直3个按钮，沿用原有图片资源 ========== -->
    <div class="top-right-btn-group">
      <div class="top-right-btn">
        <img class="btn-icon" src="/image/报告查询 1.png" alt="报告图标"/>
        学习报告
      </div>
      <div class="top-right-btn" @click="selectTask({ id: 'moments', name: '朋友圈', active: false, finished: false, path: '/moments' })">
        <img class="btn-icon" src="/image/朋友圈 1.png" alt="朋友圈图标"/>
        朋友圈
      </div>
      <div class="top-right-btn">
        <img class="btn-icon" src="/image/group-2-fill 1.png" alt="小组图标"/>
        学习小组
      </div>
    </div>

    <!-- 汉服小小人物 -->
    <img class="avatar-xiaoxiao" src="/image/小小_汉服 1.png" alt="小小汉服人物" />

    <!-- 底部阶段导航【完全保留原有结构、定位、样式，不修改】 -->
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

    <!-- 【原有弹窗 完全原样保留】项目策划会 -->
    <Transition name="fade">
      <div v-if="currentStageId === 'preview'" class="task-popup-wrapper">
        <div class="task-popup">
          <div
            v-for="task in currentTasks()"
            :key="task.id"
            class="task-popup-item"
            :class="{ 'is-active': task.active, 'task-finished': task.finished }"
            @click="selectTask(task)"
          >
            <img v-if="!task.finished" src="/image/组合 15.png" class="icon-swap" alt="箭头"/>
            <img v-if="task.finished" src="/image/矢量 72.png" class="icon-swap" alt="完成对勾"/>
            {{ task.name }}
          </div>
        </div>
        <div class="task-popup-arrow"></div>
      </div>
    </Transition>

    <!-- 宣传文化大师课弹窗 -->
    <Transition name="fade">
      <div v-if="currentStageId === 'method'" class="method-popup-wrapper">
        <div class="task-popup">
          <div
            v-for="task in methodTasks()"
            :key="task.id"
            class="method-popup-item"
            :class="{ 'is-active': task.active, 'task-finished': task.finished }"
            @click="selectTask(task)"
          >
            <img v-if="!task.finished" src="/image/组合 15.png" class="icon-swap" alt="箭头"/>
            <img v-if="task.finished" src="/image/矢量 72.png" class="icon-swap" alt="完成对勾"/>
            {{ task.name }}
          </div>
        </div>
        <div class="task-popup-arrow"></div>
      </div>
    </Transition>

    <!-- 宣传文化演播厅弹窗【修复类名拼写错误】 -->
    <Transition name="fade">
      <div v-if="currentStageId === 'creation'" class="creation-popup-wrapper">
        <div class="task-popup">
          <div
            v-for="task in creationTasks()"
            :key="task.id"
            class="creation-popup-item"
            :class="{ 'is-active': task.active, 'task-finished': task.finished }"
            @click="selectTask(task)"
          >
            <img v-if="!task.finished" src="/image/组合 15.png" class="icon-swap" alt="箭头"/>
            <img v-if="task.finished" src="/image/矢量 72.png" class="icon-swap" alt="完成对勾"/>
            {{ task.name }}
          </div>
        </div>
        <div class="task-popup-arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ===================== 原有全部样式（颜色/数值完全不变） ===================== */
.scene-home {
  width: 1920px;
  height: 1080px;
  background: url('/image/image 19.png') center center / cover no-repeat;
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
  bottom: 160px;
  left: calc(50% - 835px);
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
  border-top: 12px solid rgb(245, 237, 171);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

.task-popup-item.task-finished {
  background: #69d059;
  color: #ffffff;
}

/* 底部阶段导航【完全保留原有left:30%定位】 */
.stage-nav {
  position: absolute;
  bottom: 100px;
  left: 33%;
  transform: translateX(-50%);
  display: flex;
  gap: 30px;
  z-index: 3;
}

.stage-btn {
  height: 48px;
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
  box-shadow: 0 2px 8px rgb(179, 176, 176);
  letter-spacing: 0px;
  border: 0.5px solid rgba(255, 255, 255, 0.8);
}

.stage-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stage-btn.is-active {
  background: rgb(244, 178, 98);
  color: #f7f7f4;
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

/* ===================== 大师课/演播厅弹窗样式（原样保留） ===================== */
.method-popup-wrapper {
  position: absolute;
  bottom: 160px;
  left: 32.5%;
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
.method-popup-item.task-finished {
  background: #69d059;
  color: #fff;
}
.method-popup-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
}

.creation-popup-wrapper {
  position: absolute;
  bottom: 160px;
  left: 43.8%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
}
.creation-popup-item {
  min-width: 200px;
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
.creation-popup-item.task-finished {
  background: #69d059;
  color: #fff;
}
.creation-popup-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
}

.icon-swap {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* ===================== 右上角按钮样式｜垂直排列，原型橙黄色按钮 ===================== */
.top-right-btn-group {
  position: absolute;
  top: 100px;
  right: 200px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  z-index: 10;
}

.top-right-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 170px;
  height: 55px;
  padding: 0 16px;
  background: #eb9604;
  color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgb(23, 22, 22);
  font-size: 20px;
  cursor: pointer;
  border: 0.5px solid rgba(255, 220, 120, 0.9);
  transition: all 0.22s ease;
  white-space: nowrap;
}
.top-right-btn:hover {
  background: #FFBC38;
  transform: translateY(-2px);
}
.btn-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
</style>