<template>
  <div v-if="show" class="completion-container">
    <!-- 完成状态反馈气泡（可关闭） -->
    <div v-if="showBubble" class="completion-feedback-bubble">
      <img src="/image/语音朗读.png" alt="播放" class="bubble-voice-icon" @click="$emit('playAudio')" />
      <div class="feedback-message">{{ message }}</div>
      <span class="bubble-arrow"></span>
    </div>
    <!-- 完成页操作按钮：查看评价 / 回到首页 -->
    <div class="completion-action-bar">
      <button class="completion-action-btn report-btn" @click="$emit('goReport')">
        <img src="/image/矢量 69.png" alt="图标" class="bar-btn-icon" />
        {{ reportText }}
      </button>
      <button v-if="showHome" class="completion-action-btn home-btn" @click="$emit('goHome')">
        <img src="/image/back 1.png" alt="图标" class="bar-btn-icon" />
        {{ homeText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 完成反馈组件：AI反馈气泡 + 查看评价/回到首页按钮
 * 复用于所有含“数字人 + 完成按钮”的内容页（写写感想/初步感悟/聊聊文化/赵州桥/一幅画/重温文化）。
 * 导航逻辑见同目录 useCompletionNav.ts（goToReport→/report，goHome→/）。
 */
withDefaults(
  defineProps<{
    show: boolean
    message?: string
    reportText?: string
    homeText?: string
    showBubble?: boolean
    /** 是否显示「回到首页」按钮（默认 true）。TalkCulture 等页面已有 PageHeader 返回箭头，可传 false 只保留查看评价 */
    showHome?: boolean
  }>(),
  {
    show: false,
    message: '',
    reportText: '查看评价',
    homeText: '回到首页',
    showBubble: true,
    showHome: true,
  },
)

defineEmits<{
  goReport: []
  goHome: []
  playAudio: []
}>()
</script>

<style scoped>
.completion-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 50;
}
.completion-feedback-bubble {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  max-height: 60vh; /* 超长才限高滑动，滚动条隐藏 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.completion-feedback-bubble::-webkit-scrollbar {
  display: none; /* WebKit/Blink 隐藏滚动条 */
}
.bubble-voice-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
}
.feedback-message {
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  white-space: pre-line;
  margin: 0;
}
.completion-action-bar {
  position: relative;
  width: 100%;
  display: flex;
  gap: 12px;
}
.bar-btn-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.completion-action-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.report-btn {
  background: #daa520;
  color: #ffffff;
}
.report-btn:hover {
  background: #c4941c;
}
.home-btn {
  background: #ffffff;
  color: #daa520;
  border: 1px solid #daa520;
}
.home-btn:hover {
  background: #fff8e6;
}
.bubble-arrow {
  position: absolute;
  left: -8px;
  top: 20px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 12px solid #fff;
}
</style>
