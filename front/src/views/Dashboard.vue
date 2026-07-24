<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardAPI } from '@/api'
import WordCloud from '@/components/business/WordCloud.vue'
import type { DashboardData, WordCloudItem, CreationTypeItem } from '@/types'

const router = useRouter()

const dashboardData = ref<DashboardData | null>(null)
const wordCloudWords = ref<WordCloudItem[]>([])
const creationTypes = ref<CreationTypeItem[]>([])

const loadDashboard = async () => {
  try {
    const res = await dashboardAPI.getData()
    dashboardData.value = res
    wordCloudWords.value = res.wordCloud
    creationTypes.value = res.creationTypes
  } catch (e) {
    console.error('Load dashboard failed:', e)
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <button class="dashboard__back" @click="goBack">← 返回</button>
      <div class="dashboard__title">教师数据看板</div>
    </div>
    
    <div v-if="dashboardData" class="dashboard__content">
      <div class="dashboard__stats">
        <div class="dashboard__stat-item">
          <div class="dashboard__stat-value">{{ dashboardData.participation.completed }}/{{ dashboardData.participation.total }}</div>
          <div class="dashboard__stat-label">参与人数</div>
          <div class="dashboard__stat-rate">{{ (dashboardData.participation.rate * 100).toFixed(0) }}%</div>
        </div>
        
        <div class="dashboard__stat-item">
          <div class="dashboard__stat-value">{{ dashboardData.correctness.correct }}/{{ dashboardData.correctness.total }}</div>
          <div class="dashboard__stat-label">正确率</div>
          <div class="dashboard__stat-rate">{{ (dashboardData.correctness.rate * 100).toFixed(0) }}%</div>
        </div>
        
        <div class="dashboard__stat-item">
          <div class="dashboard__stat-value">{{ (dashboardData.previewData.textConnection * 100).toFixed(0) }}%</div>
          <div class="dashboard__stat-label">课文关联率</div>
          <div class="dashboard__stat-rate">良好</div>
        </div>
      </div>
      
      <div class="dashboard__word-cloud">
        <div class="dashboard__section-title">词云图</div>
        <WordCloud :words="wordCloudWords" />
      </div>
      
      <div class="dashboard__creation">
        <div class="dashboard__section-title">宣传方式统计</div>
        <div class="dashboard__creation-list">
          <div v-for="item in creationTypes" :key="item.type" class="dashboard__creation-item">
            <div class="dashboard__creation-info">
              <span class="dashboard__creation-name">{{ item.type }}</span>
              <span class="dashboard__creation-count">{{ item.count }}人</span>
            </div>
            <div class="dashboard__creation-bar">
              <div class="dashboard__creation-bar-fill" :style="{ width: `${item.rate * 100}%` }"></div>
            </div>
            <div class="dashboard__creation-rate">{{ (item.rate * 100).toFixed(0) }}%</div>
          </div>
        </div>
      </div>
      
      <div class="dashboard__preview">
        <div class="dashboard__section-title">预习数据</div>
        <div class="dashboard__preview-grid">
          <div class="dashboard__preview-item">
            <div class="dashboard__preview-label">联系课文内容</div>
            <div class="dashboard__preview-value">{{ (dashboardData.previewData.textConnection * 100).toFixed(0) }}%</div>
          </div>
          <div class="dashboard__preview-item">
            <div class="dashboard__preview-label">联系生活实际</div>
            <div class="dashboard__preview-value">{{ (dashboardData.previewData.lifeConnection * 100).toFixed(0) }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #fff;
  padding: 20px;
}

.dashboard__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.dashboard__back {
  font-size: 18px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
}

.dashboard__title {
  flex: 1;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.dashboard__content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.dashboard__stats {
  display: flex;
  gap: 20px;
}

.dashboard__stat-item {
  flex: 1;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.dashboard__stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.dashboard__stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.dashboard__stat-rate {
  font-size: 16px;
  font-weight: bold;
  color: #4CAF50;
  margin-top: 4px;
}

.dashboard__section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.dashboard__word-cloud {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 16px;
}

.dashboard__creation {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 16px;
}

.dashboard__creation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard__creation-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard__creation-info {
  width: 120px;
}

.dashboard__creation-name {
  font-size: 16px;
  color: #333;
}

.dashboard__creation-count {
  font-size: 14px;
  color: #999;
}

.dashboard__creation-bar {
  flex: 1;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.dashboard__creation-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.5s ease;
}

.dashboard__creation-rate {
  width: 60px;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.dashboard__preview {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 16px;
}

.dashboard__preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.dashboard__preview-item {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.dashboard__preview-label {
  font-size: 16px;
  color: #666;
}

.dashboard__preview-value {
  font-size: 28px;
  font-weight: bold;
  color: #4CAF50;
  margin-top: 8px;
}
</style>
