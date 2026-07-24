import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { WSMessage, Message } from '@/types'

export const useWebSocket = () => {
  const userStore = useUserStore()
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const reconnectCount = ref(0)
  const lastSeq = ref(0)
  const processedMessageIds = ref<Set<string>>(new Set())
  const messages = ref<Message[]>([])

  const getReconnectDelay = (count: number): number => {
    const delays = [2000, 4000, 8000, 16000]
    return delays[Math.min(count, delays.length - 1)]
  }

  const connect = () => {
    if (!userStore.studentId) return

    const wsUrl = `ws://localhost:8080/ws?studentId=${userStore.studentId}`
    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      isConnected.value = true
      reconnectCount.value = 0
      sendHeartbeat()
    }

    ws.value.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        
        if (processedMessageIds.value.has(msg.messageId)) {
          return
        }
        processedMessageIds.value.add(msg.messageId)
        
        lastSeq.value = Math.max(lastSeq.value, msg.seq)

        if (msg.type === 'heartbeat') {
          sendHeartbeat()
        } else if (msg.type === 'message') {
          messages.value.push({
            messageId: msg.payload.messageId,
            senderId: msg.payload.senderId,
            senderName: msg.payload.senderName,
            content: msg.payload.content,
            messageType: msg.payload.messageType,
            timestamp: msg.payload.timestamp
          })
        } else if (msg.type === 'sync') {
          msg.payload.messages.forEach((m: Message) => {
            if (!processedMessageIds.value.has(m.messageId)) {
              messages.value.push(m)
              processedMessageIds.value.add(m.messageId)
            }
          })
          lastSeq.value = msg.payload.lastSeq
        }
      } catch (e) {
        console.error('WebSocket message parse error:', e)
      }
    }

    ws.value.onerror = () => {
      isConnected.value = false
    }

    ws.value.onclose = () => {
      isConnected.value = false
      setTimeout(() => {
        reconnectCount.value++
        connect()
      }, getReconnectDelay(reconnectCount.value))
    }
  }

  const sendHeartbeat = () => {
    if (!isConnected.value || !ws.value) return
    
    const heartbeat: WSMessage = {
      type: 'heartbeat',
      messageId: `heartbeat-${Date.now()}`,
      payload: {
        timestamp: new Date().toISOString()
      },
      seq: lastSeq.value + 1
    }
    
    ws.value.send(JSON.stringify(heartbeat))
  }

  const sendMessage = (groupId: string, content: string, messageType: string = 'text') => {
    if (!isConnected.value || !ws.value) return
    
    const messageId = `msg-${Date.now()}`
    
    const msg: WSMessage = {
      type: 'message',
      messageId,
      payload: {
        groupId,
        senderId: userStore.studentId,
        senderName: userStore.name,
        content,
        messageType,
        timestamp: new Date().toISOString()
      },
      seq: lastSeq.value + 1
    }
    
    ws.value.send(JSON.stringify(msg))
    lastSeq.value++
  }

  const reconnect = () => {
    if (ws.value) {
      ws.value.close()
    }
    reconnectCount.value = 0
    connect()
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    if (ws.value) {
      ws.value.close()
    }
  })

  return {
    ws,
    isConnected,
    messages,
    connect,
    sendMessage,
    reconnect
  }
}
