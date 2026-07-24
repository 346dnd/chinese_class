<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.loadFromStorage()
})
</script>

<template>
  <router-view />
</template>

<style scoped>
</style>
