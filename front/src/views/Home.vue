<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user'
import { useProgressStore } from '../stores/progress'
import ScaleCanvas from '../components/ScaleCanvas.vue'

const router = useRouter()
const goToReport = () => router.push(`/report?classId=${progressStore.classId || 127}`)
const userStore = useUserStore()
const progressStore = useProgressStore()

// ---------- 阶段导航数据来自 Pinia progress store ----------
const { stageModules } = storeToRefs(progressStore)

const currentStageId = ref<string | null>(null)


const selectTask = (task: { id: string; name: string; active: boolean; finished: boolean; path: string; nodeId?: number; classId?: number }) => {
  const params = new URLSearchParams()
  params.set('classId', String(task.classId ?? 127))
  if (task.nodeId != null) params.set('nodeId', String(task.nodeId))
  const qs = params.toString()
  router.push(qs ? `${task.path}?${qs}` : task.path)
}

// 弹窗锚点：记录被点击按钮在 .stage-nav 内的本地坐标（未缩放）
// 弹窗作为 .stage-nav 的子元素，随按钮组一起缩放/位移，永远出现在按钮正上方
const popupAnchor = ref<{ x: number; y: number } | null>(null)

// 当前激活 stage 的任务列表（统一替代原 currentTasks/methodTasks/creationTasks）
const activeTasks = () => {
  if (!currentStageId.value) return []
  return stageModules.value.find(item => item.id === currentStageId.value)?.tasks || []
}

// 弹窗是否可见（warmup 直接跳转，不弹窗）
const popupVisible = computed(() => !!currentStageId.value && currentStageId.value !== 'warmup')

// 根据当前 stage 选用对应的任务项样式类（保留原三套视觉）
const taskItemClass = computed(() => {
  const id = currentStageId.value
  if (id === 'method') return 'method-popup-item'
  if (id === 'creation') return 'creation-popup-item'
  return 'task-popup-item'
})

const selectStage = (stageId: string, evt?: MouseEvent) => {
  // 重温文化采风 - 直接跳转到 WarmupGame 页面（附带 classId/nodeId 路由参数）
  if (stageId === 'warmup') {
    router.push('/warmup/warmup-game?classId=127&nodeId=19')
    return
  }
  currentStageId.value = currentStageId.value === stageId ? null : stageId
  // 计算被点击按钮在 .stage-nav 内的本地坐标，弹窗据此定位到按钮正上方
  if (currentStageId.value && evt?.currentTarget) {
    const btn = evt.currentTarget as HTMLElement
    const nav = btn.parentElement as HTMLElement
    const x = btn.offsetLeft + btn.offsetWidth / 2
    const y = nav.clientHeight - btn.offsetTop + 10
    popupAnchor.value = { x, y }
  } else {
    popupAnchor.value = null
  }
}

// 阶段「全部完成」判定：该阶段下所有任务均已 finished 才算完成（空阶段不算）
const isStageAllFinished = (stage: { tasks: Array<{ finished: boolean }> }) =>
  stage.tasks.length > 0 && stage.tasks.every((t) => t.finished)

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  // 阶段导航的节点数据来自后端 GET /v1/stu/class/{classId}（修正节点 id + 回填完成态）
  progressStore.loadFromApi(127)
})
</script>

<template>
  <!-- ========== 浮动按钮层｜fixed 贴视口，不受画布缩放/居中影响 ========== -->
  <!-- 右上角：学习报告 / 朋友圈 / 学习小组 -->
  <div class="top-right-btn-group">
    <div class="top-right-btn" @click="goToReport">
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

  <!-- 左下角：阶段导航（贴视口左边约 1cm） -->
  <div class="stage-nav">
    <div
      v-for="stage in stageModules"
      :key="stage.id"
      class="stage-btn"
      :class="{ 'is-active': stage.id === currentStageId, 'is-stage-complete': isStageAllFinished(stage) }"
      @click="selectStage(stage.id, $event)"
    >
      {{ stage.name }}
    </div>

    <!-- 阶段弹窗：作为 .stage-nav 子元素，随按钮一起缩放/位移，永远在按钮正上方 -->
    <Transition name="fade">
      <div
        v-if="popupVisible"
        class="stage-popup"
        :style="{ left: (popupAnchor?.x ?? 0) + 'px', bottom: (popupAnchor?.y ?? 0) + 'px' }"
      >
        <div class="task-popup">
          <div
            v-for="task in activeTasks()"
            :key="task.id"
            class="popup-task-item"
            :class="[taskItemClass, { 'is-active': task.active, 'task-finished': task.finished }]"
            @click="selectTask(task)"
          >
            <img v-if="!task.finished" src="/image/组合 15.png" class="icon-swap" alt="箭头" />
            <img v-if="task.finished" src="/image/矢量 72.png" class="icon-swap" alt="完成对勾" />
            {{ task.name }}
          </div>
        </div>
        <div class="task-popup-arrow"></div>
      </div>
    </Transition>
  </div>

  <ScaleCanvas background="/image/image 19.png">
    <!-- 汉服小小人物 -->
    <img class="avatar-xiaoxiao"
    <!-- 汉服小小人物 -->
    <img class="avatar-xiaoxiao" src="/image/小小_汉服 1.png" alt="小小汉服人物" />
  </ScaleCanvas>
</template>

<style scoped>
/* ===================== 原有全部样式（颜色/数值完全不变） ===================== */

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

/* 阶段弹窗外层容器｜作为 .stage-nav 子元素，定位在被点击按钮正上方（left/bottom 由 JS 注入） */
.stage-popup {
  position: absolute;
  transform: translate(-50%, 0);
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
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

/* 底部阶段导航｜fixed 贴视口左下（约 1cm），跟随画布缩放保持视觉大小一致 */
.stage-nav {
  position: fixed;
  bottom: 50px;
  left: 80px;
  display: flex;
  gap: 30px;
  z-index: 50;
  transform: scale(var(--page-scale, 1));
  transform-origin: bottom left;
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

/* 阶段全完成时：按钮变白偏淡黄、透明度 0.9（完成态优先于 is-active） */
.stage-btn.is-stage-complete {
  background: rgba(255, 250, 235, 0.9);
  color: #854f22;
  border: 0.5px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(179, 176, 176, 0.6);
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

/* 右上角按钮｜fixed 贴视口右上角，远离建筑屋顶装饰；跟随画布缩放保持视觉大小一致 */
.top-right-btn-group {
  position: fixed;
  top: 100px;
  right: 100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  z-index: 50;
  transform: scale(var(--page-scale, 1));
  transform-origin: top right;
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