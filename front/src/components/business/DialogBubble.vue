<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  message: {
    senderName: string
    content: string
    senderId?: string
  }
}>()

const userStore = useUserStore()

const isSelf = computed(() => {
  return props.message.senderId === userStore.studentId || 
         props.message.senderName === userStore.name
})
</script>

<template>
  <div class="dialog-bubble" :class="{ 'dialog-bubble--self': isSelf }">
    <div class="dialog-bubble__sender">{{ message.senderName }}</div>
    <div class="dialog-bubble__content">
      {{ message.content }}
    </div>
  </div>
</template>

<style scoped>
.dialog-bubble {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}

.dialog-bubble--self {
  align-items: flex-end;
  margin-left: auto;
}

.dialog-bubble__sender {
  font-size: 14px;
  color: #999;
  padding: 0 8px;
}

.dialog-bubble__content {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 16px;
  line-height: 1.5;
  word-break: break-word;
}

.dialog-bubble:not(.dialog-bubble--self) .dialog-bubble__content {
  background: #f5f5f5;
  color: #333;
  border-top-left-radius: 4px;
}

.dialog-bubble--self .dialog-bubble__content {
  background: #4CAF50;
  color: #fff;
  border-top-right-radius: 4px;
}
</style>
