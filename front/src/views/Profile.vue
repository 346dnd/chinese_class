<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const badges = ref([
  { name: '宣传大使', condition: '完成2种及以上宣传方式', date: '2026-07-24' },
  { name: '学习之星', condition: '完成所有预习任务', date: '2026-07-23' },
  { name: '智慧小达人', condition: '连续回答正确5题', date: '2026-07-22' }
])

const achievements = ref([
  { label: '完成课程', value: '5/5' },
  { label: '获得勋章', value: '3' },
  { label: '总得分', value: userStore.score.toString() },
  { label: '完成作业', value: '2' }
])

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<template>
  <div class="profile">
    <div class="profile__header">
      <button class="profile__back" @click="goBack">← 返回</button>
      <div class="profile__title">个人中心</div>
    </div>
    
    <div class="profile__user">
      <div class="profile__avatar">👤</div>
      <div class="profile__info">
        <div class="profile__name">{{ userStore.name }}</div>
        <div class="profile__id">{{ userStore.studentId }}</div>
      </div>
    </div>
    
    <div class="profile__achievements">
      <div class="profile__section-title">学习成就</div>
      <div class="profile__achievements-grid">
        <div v-for="item in achievements" :key="item.label" class="profile__achievement-item">
          <div class="profile__achievement-value">{{ item.value }}</div>
          <div class="profile__achievement-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
    
    <div class="profile__badges">
      <div class="profile__section-title">我的勋章</div>
      <div class="profile__badges-list">
        <div v-for="badge in badges" :key="badge.name" class="profile__badge-item">
          <div class="profile__badge-icon">🏅</div>
          <div class="profile__badge-info">
            <div class="profile__badge-name">{{ badge.name }}</div>
            <div class="profile__badge-condition">{{ badge.condition }}</div>
            <div class="profile__badge-date">{{ badge.date }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <Button type="danger" @click="logout">退出登录</Button>
  </div>
</template>

<style scoped>
.profile {
  min-height: 100vh;
  background: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile__back {
  font-size: 18px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
}

.profile__title {
  flex: 1;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.profile__user {
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 20px;
}

.profile__avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.profile__info {
  color: #fff;
}

.profile__name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.profile__id {
  font-size: 16px;
  opacity: 0.8;
}

.profile__section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.profile__achievements {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 16px;
}

.profile__achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.profile__achievement-item {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
}

.profile__achievement-value {
  font-size: 28px;
  font-weight: bold;
  color: #4CAF50;
}

.profile__achievement-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.profile__badges {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 16px;
}

.profile__badges-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile__badge-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
}

.profile__badge-icon {
  font-size: 40px;
}

.profile__badge-info {
  flex: 1;
}

.profile__badge-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.profile__badge-condition {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.profile__badge-date {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
