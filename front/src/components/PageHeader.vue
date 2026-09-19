<template>
  <div class="top-nav" :class="{ 'is-fixed': position === 'fixed', 'is-transparent': transparent }">
    <span class="back-icon" @click="$emit('back')">&lt;</span>
    <span class="nav-title">{{ title }}</span>
    <div class="top-nav-buttons">
      <!--
        新版统一右上角控件：左侧可开关语音播报 + 右侧回看视频。
        当 voiceBroadcast=true 时，PageHeader 内部按设计稿渲染，无需页面再传插槽按钮。
        仍保留默认插槽，用于不需要这套控件的页面。
      -->
      <template v-if="voiceBroadcast">
        <div class="toggle-wrap" @click="$emit('toggleVoice')">
          <div class="toggle-switch" :class="{ active: voiceOn }">
            <div class="toggle-thumb"></div>
          </div>
          <span class="toggle-label">语音播报</span>
        </div>
        <button v-if="showVideo" class="nav-btn nav-btn-orange" @click="$emit('video')">
          <svg class="btn-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
          <span>回看视频</span>
        </button>
      </template>
      <slot v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 统一顶部导航栏（页面最上方标题条）
 * - position='absolute'（默认）：固定在画布（ScaleCanvas / .page-container）内顶部（top:30px，随整页等比缩放）。用于固定画布页。
 * - position='fixed'：贴视口顶部（top:0，left/right:0），脱离文档流、不随画布缩放。用于原生流式页（report / Moments / PromoteCulture 等）。
 * - transparent：去掉背景色（透明），适用于白底流式页（如 report），标题直接浮在页面底色上。
 * - 样式：统一的背景 / 圆角 / 字重 / 字号 / 按钮外观，全站一致
 * - 用法：
 *   <PageHeader :title="标题文本" @back="goBack">
 *     <div class="nav-btn" @click="playVoiceBroadcast">...</div>
 *   </PageHeader>
 * - title：标题文本（必填）；position：定位模式（选填，默认 absolute）；transparent：去背景（选填，默认 false）
 * - back：点击左上角返回箭头时触发，由父页面决定返回逻辑
 * - 默认插槽：右侧操作按钮，结构请使用 .nav-btn（含 .btn-icon 图片）
 */
withDefaults(defineProps<{
  title: string
  position?: 'absolute' | 'fixed'
  transparent?: boolean
  /** 是否启用新版统一右上角控件：语音播报开关 + 回看视频按钮 */
  voiceBroadcast?: boolean
  /** 语音播报开关状态，与父组件的 isPlaying 绑定 */
  voiceOn?: boolean
  /** 是否显示回看视频按钮（默认 true）；部分页面暂无视频可传 false */
  showVideo?: boolean
}>(), {
  /** 回看视频按钮默认显示，沿用各页原交互；仅确实无视频的页才显式传 false */
  showVideo: true
})
defineEmits<{ (e: 'back'): void; (e: 'toggleVoice'): void; (e: 'video'): void }>()
</script>

<style scoped>
.top-nav {
  position: absolute;
  top: 40px;
  left: 40px;
  right: 40px;
  height: 70px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 32px;
  background: rgba(235, 234, 233, 0.5);
  border-radius: 12px;
  color: #4c2102c6;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: 1px;
  z-index: 10;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
}

/* 流式页贴视口顶部模式 */
.top-nav.is-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 24px;
  background: rgba(46, 22, 8, 0.88);
}

/* 去背景模式：标题直接浮在页面底色上（用于白底流式页，如 report）。
   放在 .is-fixed 之后，同特异性后者生效，可覆盖 fixed 的深棕背景。 */
.top-nav.is-transparent {
  background: transparent;
  text-shadow: none;
  border-radius: 0;
  color: #3d1a02;
}
.top-nav.is-fixed.is-transparent {
  background: transparent;
}

.back-icon {
  font-size: 26px;
  cursor: pointer;
  opacity: 0.92;
  transition: opacity 0.2s ease;
}

.back-icon:hover {
  opacity: 1;
}

.nav-title {
  flex: 0 1 auto;
  white-space: nowrap;
}

.top-nav-buttons {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

/* 以下样式作用于父页面通过插槽传入的按钮，以及 PageHeader 内置的语音/视频按钮，统一在此处管理 */
.top-nav :deep(.nav-btn),
.top-nav .nav-btn {
  box-sizing: border-box;
  width: 150px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 14px;
  background: #f7a020;
  color: #ffffff;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: background 0.24s ease;
  border: none;
}

.top-nav :deep(.nav-btn:hover),
.top-nav .nav-btn:hover {
  background: #e08b18;
}

.top-nav :deep(.btn-icon),
.top-nav .btn-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 语音播报开关（与 PromoteCulture 创作页设计稿一致；与回看视频按钮同宽高） */
.toggle-wrap {
  box-sizing: border-box;
  width: 150px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
  user-select: none;
}
.toggle-switch {
  width: 42px;
  height: 22px;
  border-radius: 11px;
  background: #cccccc;
  position: relative;
  transition: 0.25s;
}
.toggle-switch.active {
  background: #f7a020;
}
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  transition: 0.25s;
}
.toggle-switch.active .toggle-thumb {
  transform: translateX(20px);
}
.toggle-label {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  text-shadow: none;
  letter-spacing: 1px;
}
</style>
