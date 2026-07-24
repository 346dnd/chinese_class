<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'
import { groupAPI } from '@/api'
import { useWebSocket } from '@/composables/useWebSocket'
import Textarea from '@/components/base/Textarea.vue'
import Button from '@/components/base/Button.vue'
import Countdown from '@/components/base/Countdown.vue'
import DialogBubble from '@/components/business/DialogBubble.vue'

const router = useRouter()
const userStore = useUserStore()
const messageStore = useMessageStore()

const { isConnected, messages, sendMessage } = useWebSocket()

const currentGroupId = ref('')
const groupMembers = ref(['张三', '李四', '王五'])
const inputContent = ref('')
const isSending = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const countdownSeconds = ref(120)
const countdownRef = ref<InstanceType<typeof Countdown> | null>(null)

const loadMessages = async () => {
  if (!currentGroupId.value) return
  
  try {
    const res = await groupAPI.getMessages({
      groupId: currentGroupId.value,
      page: 1,
      pageSize: 20
    })
    messageStore.addMessages(res.messages)
  } catch (e) {
    console.error('Load messages failed:', e)
  }
}

const handleSendMessage = async () => {
  if (!inputContent.value.trim() || isSending.value) return
  
  isSending.value = true
  
  try {
    if (isConnected.value) {
      sendMessage(currentGroupId.value, inputContent.value.trim())
    } else {
      await groupAPI.sendMessage({
        groupId: currentGroupId.value,
        content: inputContent.value.trim(),
        messageType: 'text'
      })
    }
    
    inputContent.value = ''
  } catch (e) {
    console.error('Send message failed:', e)
  } finally {
    isSending.value = false
  }
}

const handleCountdownTimeout = () => {
  router.push('/homework')
}

watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  currentGroupId.value = 'group-' + Date.now()
  messageStore.setGroupId(currentGroupId.value)
  loadMessages()
  
  if (countdownRef.value) {
    countdownRef.value.start()
  }
})
</script>

<template>
  <div class="chat-room">
    <div class="chat-room__header">
      <button class="chat-room__back" @click="goBack">← 返回</button>
      <div class="chat-room__title">小组交流</div>
      <Countdown
        ref="countdownRef"
        :seconds="countdownSeconds"
        @timeout="handleCountdownTimeout"
      />
    </div>
    
    <div class="chat-room__members">
      <span>组员列表:</span>
      <span v-for="member in groupMembers" :key="member" class="chat-room__member">
        {{ member }}
      </span>
    </div>
    
    <div ref="messagesContainer" class="chat-room__messages">
      <DialogBubble
        v-for="(msg, index) in messages"
        :key="index"
        :message="msg"
      />
    </div>
    
    <div class="chat-room__input">
      <Textarea
        v-model="inputContent"
        placeholder="输入消息..."
        :rows="2"
        :maxlength="500"
      />
      <Button type="primary" :loading="isSending" @click="handleSendMessage">
        发送
      </Button>
    </div>
  </div>
</template>

<style scoped>
.chat-room {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.chat-room__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.chat-room__back {
  font-size: 18px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
}

.chat-room__title {
  flex: 1;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.chat-room__members {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f5f5f5;
  flex-wrap: wrap;
}

.chat-room__member {
  background: #e0e0e0;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
}

.chat-room__messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-room__input {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
