<!--
  VideoModal - 可复用的视频回看弹窗
  用法:
    <VideoModal v-model:show="showVideoModal" :url="introVideoUrl" />
  说明:
    - url 为空时弹窗显示"暂无视频"提示
    - 使用 Teleport to body 确保不受画布 transform 影响
    - 点击遮罩或关闭按钮关闭弹窗并暂停视频
-->
<template>
  <Teleport to="body">
    <div v-if="show" class="video-modal-overlay" @click.self="close">
      <div class="video-modal-container">
        <button class="video-modal-close" @click="close" title="关闭">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div v-if="url" class="video-modal-player">
          <video
            ref="videoEl"
            :src="url"
            controls
            autoplay
            class="video-modal-video"
          />
        </div>
        <div v-else class="video-modal-placeholder">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path fill="currentColor" d="M8 5v14l11-7z" />
          </svg>
          <p>暂无视频</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  show: boolean
  url: string
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const videoEl = ref<HTMLVideoElement | null>(null)

const close = () => {
  // 关闭前暂停视频，防止后台继续播放
  if (videoEl.value) {
    videoEl.value.pause()
  }
  emit('update:show', false)
}

// 弹窗打开时自动播放，关闭时暂停
watch(
  () => props.show,
  async (val) => {
    if (val) {
      await nextTick()
      if (videoEl.value && props.url) {
        videoEl.value.play().catch(() => {
          // 自动播放被浏览器拦截时，用户可手动点击播放
        })
      }
    } else if (videoEl.value) {
      videoEl.value.pause()
    }
  }
)
</script>

<style scoped>
.video-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-modal-container {
  position: relative;
  width: 80vw;
  max-width: 960px;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.video-modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.video-modal-close:hover {
  background: rgba(0, 0, 0, 0.8);
}

.video-modal-player {
  width: 100%;
  display: flex;
  justify-content: center;
}

.video-modal-video {
  width: 100%;
  max-height: 80vh;
  display: block;
}

.video-modal-placeholder {
  padding: 80px 40px;
  text-align: center;
  color: #999;
}

.video-modal-placeholder svg {
  color: #666;
  margin-bottom: 12px;
}

.video-modal-placeholder p {
  font-size: 16px;
  margin: 0;
}
</style>
