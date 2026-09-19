<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  width: 100%;
  height: 100%;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  /* 兜底背景：最底层永不露白。各页的 .page-bg / .bg-layer（fixed 满屏 cover）
     或 Login 自带容器会盖住它；仅在首屏绘制瞬间、路由切换间隙或某页背景图
     加载失败时短暂可见，用深色墨底替代默认白底，杜绝“白边”。 */
  background: #1a1410;
}
#app {
  width: 100%;
  height: 100%;
  /* 外层弹性容器：把各页面（1920×1080 等比缩放后的画布）在视口内居中充满，
     取代原先写死尺寸导致的变形/溢出问题 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* 与 html/body 同源兜底，保证路由切换空档也不露白 */
  background: #1a1410;
}
</style>
