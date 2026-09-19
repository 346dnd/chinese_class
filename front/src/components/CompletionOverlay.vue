<template>
  <!-- 全屏黑色半透明遮罩：仅在完成态(show=true)时渲染 -->
  <div v-if="show" class="completion-mask"></div>
  <!-- 完成态舞台：与 1920×1080 画布同尺寸、同缩放、同居中，确保数字人/按钮位置与画布一致。
       默认按 show 控制；仅 WarmupGame 这类「游戏内容也放在插槽里」的页面用 always-render 强制常驻。
       其余页面(如 ZZQ/TalkCulture)插槽放的是完成态专属内容，必须在 show=false 时隐藏，避免提前显示。 -->
  <div v-if="show || alwaysRender" class="completion-stage">
    <div class="completion-stage-canvas">
      <!-- 安全区：与画布内容层一致，按 --crop-x/--crop-y 收进被裁边缘 -->
      <div class="sc-safe-area">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 完成态遮罩 + 数字人舞台
 * 复用于所有含“数字人 + 完成按钮”的内容页。
 * 关键点：遮罩与舞台都放在被 transform 缩放的 .page-container 之外（由页面根节点直接引用），
 * 因此 position:fixed 能真正覆盖整个视口，且舞台用 --page-scale 同步缩放，重叠在画布之上。
 */
defineProps<{
  show: boolean
  /** 默认 false：舞台仅在 show 时渲染（完成态内容不提前显示）。
      true：舞台始终渲染，供「游戏内容也放在插槽里」的页面（如 WarmupGame）使用。 */
  alwaysRender?: boolean
}>()
</script>

<style scoped>
.completion-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 300vw;
  height: 300vh;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1000;
}
.completion-stage {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  /* 舞台本身不拦截鼠标，仅内部内容（数字人/按钮）可点 */
  pointer-events: none;
}
.completion-stage > * {
  pointer-events: auto;
}
.completion-stage-canvas {
  position: relative;
  width: 1920px;
  height: 1080px;
  transform: scale(var(--page-scale, 1));
  transform-origin: center center;
}
/* 安全区：与 ScaleCanvas 的 .sc-safe-area 一致，保证数字人/按钮等贴边内容不被 cover 裁掉 */
.sc-safe-area {
  position: absolute;
  top: var(--crop-y, 0px);
  left: var(--crop-x, 0px);
  right: var(--crop-x, 0px);
  bottom: var(--crop-y, 0px);
}
</style>
