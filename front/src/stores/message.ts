import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message } from '@/types'

export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>([])
  const currentGroupId = ref('')
  const processedMessageIds = ref<Set<string>>(new Set())

  const setGroupId = (groupId: string) => {
    currentGroupId.value = groupId
    messages.value = []
  }

  const addMessage = (msg: Message) => {
    if (processedMessageIds.value.has(msg.messageId)) {
      return
    }
    messages.value.push(msg)
    processedMessageIds.value.add(msg.messageId)
    setTimeout(() => {
      processedMessageIds.value.delete(msg.messageId)
    }, 5 * 60 * 1000)
  }

  const addMessages = (msgs: Message[]) => {
    msgs.forEach(msg => addMessage(msg))
  }

  const clearMessages = () => {
    messages.value = []
  }

  const getMessages = (): Message[] => {
    return messages.value
  }

  const getUnreadCount = (): number => {
    return messages.value.length
  }

  return {
    messages,
    currentGroupId,
    processedMessageIds,
    setGroupId,
    addMessage,
    addMessages,
    clearMessages,
    getMessages,
    getUnreadCount
  }
})
