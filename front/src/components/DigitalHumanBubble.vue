<template>
  <div class="digital-human-area">
    <img :src="image" alt="数字人" class="digital-human-img" />
    <div class="bubble-action-wrap" v-if="talkText">
      <div class="human-talk-bubble" :class="{ expanded: isExpanded }">
        <span class="bubble-text">{{ talkText }}</span>
        <img
          src="/image/语音朗读.png"
          alt="播放"
          class="bubble-voice-icon"
          @click="$emit('playBubbleAudio')"
        />
        <span class="bubble-arrow"></span>
      </div>
      <slot name="feedback" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 数字人气泡组件
 * 复用于：写写感想、初步感悟、赵州桥、一幅名扬中外的画、讲解文化、文化采风
 */
defineProps<{
  talkText: string
  isExpanded?: boolean
  image?: string
}>()

defineEmits<{
  playBubbleAudio: []
}>()
</script>

<style scoped>
.digital-human-area {
  position: absolute;
  left: 80px;
  bottom: 20px;
}
.digital-human-img {
  width: 180px;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
}
.bubble-action-wrap {
  position: absolute;
  left: 190px;
  top: 20px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 19px; /* 0.5cm */
}
.human-talk-bubble {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.bubble-text {
  flex: 1;
  max-height: 60vh; /* 不固定长度：短文自适应，超长才限高滑动，滚动条隐藏 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  transition: max-height 0.3s ease;
}
.bubble-text::-webkit-scrollbar {
  display: none; /* WebKit/Blink 隐藏滚动条 */
}
.human-talk-bubble.expanded .bubble-text {
  max-height: none;
}
.bubble-voice-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  object-fit: contain;
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
