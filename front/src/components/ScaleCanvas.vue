<script setup lang="ts">
/**
 * ScaleCanvas —— 全局共享的「屏幕自适应画布」。
 *
 * 把 Home 页面验证过的「自适应缩放」方案抽成单一组件，其它固定画布页（1920×1080 设计稿）
 * 直接调用本组件即可，无需每页重复声明 .page-bg / .page-container / useScale。
 *
 * 设计目标（与 Home 完全一致，同时满足）：
 *  - 背景完整覆盖、填满屏幕、永不留白边；
 *  - 1920×1080 内容画布用 cover 单值等比缩放，整块一定铺满整个视口、覆盖整个页面、保持比例位置；
 *  - 背景层由 .sc-page-bg 的 CSS background-size:cover 单独满屏（与内容缩放解耦），非 16:9 视口只露背景、不留白；
 *  - 任意视口比例下拉伸缩窗口都不拉伸变形（单值等比，非 16:9 仅裁掉画布边缘装饰）；
 *  - 背景层与内容缩放解耦：.sc-page-bg 固定满屏，内容层 .sc-page-canvas 缩放，互不干扰。
 *
 * 用法：
 *   <ScaleCanvas background="/image/xxx.png">
 *     <!-- 全部画布内容（1920×1080 设计坐标内的绝对定位元素） -->
 *     <template #overlay>
 *       <!-- 可选：视口级浮动层（贴边按钮/完成态遮罩等），不被画布缩放影响，
 *            自身用 transform: scale(var(--page-scale)) 跟随视觉大小 -->
 *     </template>
 *   </ScaleCanvas>
 */
import { useScale } from '../composables/useScale'

const props = withDefaults(
  defineProps<{
    /** 背景图 url；留空则背景透明（透出 #app 兜底深色），不会露白 */
    background?: string
    /** 是否自动挂载 resize 监听并初次计算缩放；需自定义时机（如 WarmupGame）时传 false，经 ref 调 updateScale */
    autoScale?: boolean
  }>(),
  {
    background: '',
    autoScale: true
  }
)

const { pageStyle, updateScale } = useScale(props.autoScale)

// 暴露给需要手动触发缩放的页面（如 WarmupGame 在加载完成后才调用）
defineExpose({ updateScale })
</script>

<template>
  <!-- 固定满屏背景层：与画布缩放解耦，永远 100% 覆盖、不留白边 -->
  <div
    class="sc-page-bg"
    :style="background ? { backgroundImage: `url('${background}')` } : undefined"
  ></div>

  <!-- 1920×1080 设计稿画布：cover 等比缩放铺满整个视口 -->
  <div class="sc-page-canvas" :style="pageStyle">
    <!-- 安全区：按 --crop-x/--crop-y 收进被 cover 裁掉的设计稿边缘，任意比例下内容都不被裁 -->
    <div class="sc-safe-area">
      <slot />
    </div>
  </div>

  <!-- 视口级浮动层（贴边按钮 / 完成态遮罩等）：不被画布缩放影响，经 --page-scale 跟随视觉大小 -->
  <slot name="overlay" />
</template>

<style scoped>
.sc-page-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  /* 兜底深色：图片未加载/地址失效时也不露白 */
  background-color: #1a1410;
}
.sc-page-canvas {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1;
  overflow: hidden;
  box-sizing: border-box;
}
/* 安全区：把画布内容收进 cover 不会裁掉的中心区域。
   --crop-x/--crop-y 由 useScale 按视口比例写入（设计稿像素），16:9 时为 0 无影响。
   所有绝对定位的子元素因此相对安全区定位，贴边内容自动内移、永不被裁。 */
.sc-safe-area {
  position: absolute;
  top: var(--crop-y, 0px);
  left: var(--crop-x, 0px);
  right: var(--crop-x, 0px);
  bottom: var(--crop-y, 0px);
}
</style>
