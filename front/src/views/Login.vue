<template>
  <div class="login-container">
    <!-- 动态背景画布：飘动的墨点 / 汉字 -->
    <canvas ref="canvasRef" class="bg-canvas"></canvas>
    <!-- 缓慢流动的光晕层 -->
    <div class="aurora aurora-1"></div>
    <div class="aurora aurora-2"></div>
    <div class="aurora aurora-3"></div>

    <div class="login-card">
      <div class="brand">
        <span class="brand-seal">語</span>
        <div class="brand-text">
          <h1 class="login-title">语文课堂</h1>
          <p class="login-subtitle">诵千古文 · 品华夏韵</p>
        </div>
      </div>

      <div class="form-group">
        <label>学号</label>
        <div class="input-wrap">
          <span class="input-icon">学</span>
          <input v-model="studentId" type="text" placeholder="请输入学号" />
        </div>
      </div>
      <div class="form-group">
        <label>密码</label>
        <div class="input-wrap">
          <span class="input-icon">密</span>
          <input v-model="password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
        </div>
      </div>
      <button class="login-btn" @click="handleLogin" :disabled="loading">
        <span class="btn-text">{{ loading ? '登录中...' : '登 录' }}</span>
        <span class="btn-shine"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const studentId = ref('')
const password = ref('')
const loading = ref(false)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let rafId = 0
let resizeHandler = () => {}

interface Particle {
  x: number
  y: number
  r: number
  vy: number
  vx: number
  alpha: number
  life: number
  hue: number
  char?: string
  rot: number
  vr: number
}

const CHARS = ['文', '诗', '书', '礼', '乐', '墨', '韵', '雅', '辞', '章']
const particles: Particle[] = []

const handleLogin = async () => {
  if (!studentId.value || !password.value) {
    alert('请输入学号和密码')
    return
  }
  loading.value = true
  try {
    await userStore.login(studentId.value, password.value)
    router.push('/')
  } catch (e: any) {
    alert('登录失败：' + ((e && e.message) || '未知错误'))
  } finally {
    loading.value = false
  }
}

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const resize = () => {
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  resizeHandler = resize
  window.addEventListener('resize', resizeHandler)

  const spawn = (): Particle => {
    const asChar = Math.random() < 0.35
    return {
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 120,
      r: asChar ? 14 + Math.random() * 22 : 2 + Math.random() * 6,
      vy: -(0.25 + Math.random() * 0.7),
      vx: (Math.random() - 0.5) * 0.4,
      alpha: 0,
      life: 0,
      hue: 200 + Math.random() * 80,
      char: asChar ? CHARS[Math.floor(Math.random() * CHARS.length)] : undefined,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.01,
    }
  }

  const COUNT = Math.min(46, Math.floor(window.innerWidth / 28))
  for (let i = 0; i < COUNT; i++) {
    const p = spawn()
    p.y = Math.random() * window.innerHeight // 初始铺满屏幕
    particles.push(p)
  }

  const draw = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    for (const p of particles) {
      p.y += p.vy
      p.x += p.vx
      p.rot += p.vr
      p.life += 1
      // 淡入淡出
      const fadeIn = Math.min(1, p.life / 60)
      const fadeOut = p.y < 0 ? Math.max(0, 1 + p.y / 80) : 1
      const a = p.alpha
      const curAlpha = (a === 0 ? 0.5 : a) * fadeIn * fadeOut

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      if (p.char) {
        ctx.font = `${p.r * 2}px "STKaiti", "KaiTi", "SimSun", serif`
        ctx.fillStyle = `hsla(${p.hue}, 70%, 85%, ${curAlpha * 0.55})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = `hsla(${p.hue}, 80%, 70%, ${curAlpha})`
        ctx.shadowBlur = 12
        ctx.fillText(p.char, 0, 0)
      } else {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r)
        g.addColorStop(0, `hsla(${p.hue}, 80%, 80%, ${curAlpha})`)
        g.addColorStop(1, `hsla(${p.hue}, 80%, 80%, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(0, 0, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      if (p.y < -40 || p.x < -60 || p.x > window.innerWidth + 60) {
        Object.assign(p, spawn())
      }
    }
    rafId = requestAnimationFrame(draw)
  }
  draw()
}

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resizeHandler)
})
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #0f2a4a 0%, #1b3a6b 40%, #3a2a6b 100%);
}

.bg-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* 缓慢流动的光晕 */
.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: screen;
}
.aurora-1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, #4fd1c5, transparent 70%);
  top: -120px;
  left: -100px;
  animation: float1 18s ease-in-out infinite;
}
.aurora-2 {
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, #9f7aea, transparent 70%);
  bottom: -160px;
  right: -120px;
  animation: float2 22s ease-in-out infinite;
}
.aurora-3 {
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, #4299e1, transparent 70%);
  top: 40%;
  left: 55%;
  animation: float3 26s ease-in-out infinite;
}
@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(120px, 80px) scale(1.15); }
}
@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-100px, -60px) scale(1.1); }
}
@keyframes float3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-80px, 90px) scale(1.2); }
}

/* 玻璃拟态卡片 */
.login-card {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 20px;
  padding: 44px 40px 40px;
  width: 380px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  animation: cardIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 30px;
}
.brand-seal {
  flex: none;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "STKaiti", "KaiTi", "SimSun", serif;
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #e05a4f, #c0392b);
  box-shadow: 0 6px 18px rgba(192, 57, 43, 0.45);
}
.brand-text { line-height: 1.25; }
.login-title {
  margin: 0;
  font-size: 27px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 4px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}
.login-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
  font-family: "STKaiti", "KaiTi", "SimSun", serif;
}

.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82);
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  font-family: "STKaiti", "KaiTi", serif;
}
.input-wrap input {
  width: 100%;
  height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  padding: 0 14px 0 46px;
  font-size: 15px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
}
.input-wrap input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
.input-wrap input:focus {
  border-color: #4fd1c5;
  background: rgba(255, 255, 255, 0.16);
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.25);
}

.login-btn {
  position: relative;
  width: 100%;
  height: 50px;
  margin-top: 12px;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  letter-spacing: 6px;
  color: #fff;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, #4fd1c5 0%, #4299e1 50%, #9f7aea 100%);
  box-shadow: 0 10px 26px rgba(66, 153, 225, 0.4);
  transition: transform 0.15s, box-shadow 0.3s;
}
.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(66, 153, 225, 0.55);
}
.login-btn:active:not(:disabled) {
  transform: translateY(0);
}
.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-text {
  position: relative;
  z-index: 2;
}
.btn-shine {
  position: absolute;
  top: 0;
  left: -120%;
  width: 60%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: skewX(-20deg);
  animation: shine 3.5s ease-in-out infinite;
}
@keyframes shine {
  0% { left: -120%; }
  60%, 100% { left: 140%; }
}
</style>
