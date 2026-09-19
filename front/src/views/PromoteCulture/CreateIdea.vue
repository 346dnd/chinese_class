<template>
  <div class="page-bg"></div>
  <PageHeader :title="title" @back="goBack" position="fixed" />
  <div class="placeholder-page">
    <div class="placeholder-content">
      <h2>{{ title }}</h2>
      <p>此页面正在开发中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
const router = useRouter()
const title = '表达自己的想法'

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: url('/image/image 16.png') no-repeat center center;
  background-size: cover;
}
.placeholder-page {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
}

.placeholder-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 16px;
}

p {
  color: #666;
  margin-bottom: 24px;
}
</style>
