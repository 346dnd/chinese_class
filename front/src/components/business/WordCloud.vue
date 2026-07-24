<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { WordCloudItem } from '@/types'

const props = defineProps<{
  words: WordCloudItem[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

const renderWordCloud = () => {
  const canvas = canvasRef.value
  if (!canvas || !props.words.length) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const width = canvas.width
  const height = canvas.height
  
  ctx.clearRect(0, 0, width, height)
  
  const maxCount = Math.max(...props.words.map(w => w.count))
  
  const colors = [
    '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
    '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'
  ]
  
  const usedPositions: { x: number; y: number; width: number; height: number }[] = []
  
  const checkCollision = (x: number, y: number, width: number, height: number): boolean => {
    return usedPositions.some(pos => {
      return !(x + width < pos.x || x > pos.x + pos.width ||
               y + height < pos.y || y > pos.y + pos.height)
    })
  }
  
  props.words.forEach((word, index) => {
    const fontSize = Math.max(16, Math.min(48, (word.count / maxCount) * 48 + 16))
    ctx.font = `bold ${fontSize}px Arial`
    const textWidth = ctx.measureText(word.word).width
    const textHeight = fontSize * 1.2
    
    let x: number, y: number
    let attempts = 0
    const maxAttempts = 100
    
    do {
      x = Math.random() * (width - textWidth)
      y = Math.random() * (height - textHeight)
      attempts++
    } while (checkCollision(x, y, textWidth, textHeight) && attempts < maxAttempts)
    
    if (attempts < maxAttempts) {
      usedPositions.push({ x, y, width: textWidth, height: textHeight })
      
      const color = colors[index % colors.length]
      ctx.fillStyle = color
      
      ctx.globalAlpha = 0.8 + Math.random() * 0.2
      ctx.fillText(word.word, x, y + fontSize)
      ctx.globalAlpha = 1
    }
  })
}

watch(() => props.words, () => {
  renderWordCloud()
}, { deep: true })

onMounted(() => {
  renderWordCloud()
})
</script>

<template>
  <div class="word-cloud">
    <canvas
      ref="canvasRef"
      width="600"
      height="400"
      class="word-cloud__canvas"
    ></canvas>
  </div>
</template>

<style scoped>
.word-cloud {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #fafafa;
  border-radius: 16px;
}

.word-cloud__canvas {
  max-width: 100%;
  height: auto;
}
</style>
