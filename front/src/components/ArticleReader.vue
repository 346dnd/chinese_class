<template>
  <div class="article-wrapper" v-if="visible">
    <div class="article-close-btn" @click="$emit('close')">×</div>
    <div class="article-panel">
      <div class="article-content">
        <div class="article-body" v-html="htmlContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title?: string
  htmlContent: string
}>()
defineEmits(['close'])
</script>

<style scoped>
.article-wrapper {
  position: relative;
  width: fit-content;
  max-width: 100%;
  margin-top: 30px;
}
.article-close-btn {
  position: absolute;
  top: -14px;
  right: -14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  text-align: center;
  line-height: 32px;
  font-size: 18px;
  cursor: pointer;
  z-index: 6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}
.article-close-btn:hover {
  transform: scale(1.1);
}
.article-panel {
  width: 950px;
  max-width: 100%;
  height: 840px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.article-content {
  flex: 1;
}
.article-body {
  font-size: 15px;
  line-height: 2.4;
  color: #444;
}
.article-body :deep(.text-tip) {
  background: #fff8e8;
  padding: 12px 16px;
  border-left: 4px solid #f2bc2b;
  margin: 10px 0 20px;
  font-size: 16px;
  font-family: "";
  color: #555;
}
.article-body :deep(.text-paragraph) {
  font-size: 24px;
  line-height: 2.4;
  text-indent: 2em;
  color: #444;
  font-family: "Microsoft YaHei";
  margin: 2px 0;
}
.article-body :deep(ruby) {
  ruby-position: over;
}
.article-body :deep(rt) {
  font-size: 0.6em;    /* 放大拼音 */
  text-align: center;
  line-height: 3.6;    /* 拼音和汉字拉开距离 */
  color: #333;
  font-family: "Microsoft YaHei";
  margin-top: -18px;    
}

</style>
