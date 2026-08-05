<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">语文课堂</h1>
      <div class="form-group">
        <label>学号</label>
        <input v-model="studentId" type="text" placeholder="请输入学号" />
      </div>
      <div class="form-group">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
      </div>
      <button class="login-btn" @click="handleLogin" :disabled="loading">
        {{ loading ? '登录中...' : '登 录' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../stores/user'

const router = useRouter()

const studentId = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = () => {
  if (!studentId.value || !password.value) {
    alert('请输入学号和密码')
    return
  }
  loading.value = true
  const success = login(studentId.value, password.value)
  loading.value = false
  if (success) {
    router.push('/')
  } else {
    alert('登录失败，请重试')
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px;
  width: 360px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.login-title {
  text-align: center;
  margin: 0 0 28px;
  font-size: 26px;
  color: #333;
}
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}
.form-group input {
  width: 100%;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;
}
.form-group input:focus {
  border-color: #667eea;
}
.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: opacity 0.3s;
}
.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
