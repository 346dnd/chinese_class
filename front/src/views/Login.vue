<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Input from '@/components/base/Input.vue'
import Button from '@/components/base/Button.vue'
import Toast from '@/components/base/Toast.vue'

const router = useRouter()
const userStore = useUserStore()

const studentId = ref('')
const name = ref('')
const isLoading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const login = async () => {
  if (!studentId.value.trim() || !name.value.trim()) {
    showToastMessage('请填写完整信息')
    return
  }

  isLoading.value = true

  setTimeout(() => {
    userStore.login(studentId.value.trim(), name.value.trim())
    router.push('/')
  }, 500)
}

const showToastMessage = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
}

const closeToast = () => {
  showToast.value = false
}
</script>

<template>
  <div class="login">
    <div class="login__logo">📚</div>
    <div class="login__title">数智交互课程</div>
    <div class="login__subtitle">宣传中华优秀传统文化</div>
    
    <div class="login__form">
      <div class="login__form-group">
        <label class="login__label">学号</label>
        <Input
          v-model="studentId"
          placeholder="请输入学号"
          :maxlength="20"
        />
      </div>
      
      <div class="login__form-group">
        <label class="login__label">姓名</label>
        <Input
          v-model="name"
          placeholder="请输入姓名"
          :maxlength="20"
        />
      </div>
      
      <Button
        type="primary"
        size="lg"
        :loading="isLoading"
        class="login__submit"
        @click="login"
      >
        登录
      </Button>
    </div>
    
    <Toast
      :show="showToast"
      :message="toastMessage"
      type="error"
      :duration="3000"
      @close="closeToast"
    />
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login__logo {
  font-size: 80px;
  margin-bottom: 20px;
}

.login__title {
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8px;
}

.login__subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
}

.login__form {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login__form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.login__label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.login__submit {
  width: 100%;
  margin-top: 12px;
}
</style>
