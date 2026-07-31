<template>
  <div class="relative min-h-screen w-full overflow-hidden">
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('/image/image 123.png')"
    ></div>
    <div class="absolute inset-0 bg-black/20"></div>

    <!-- 右上角退出箭头 -->
    <button
      @click="goHome"
      class="absolute right-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:bg-white hover:scale-110"
      title="返回首页"
    >
      <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </button>

    <!-- 右侧中间任务提示框 -->
    <div class="absolute right-8 top-1/2 z-20 w-72 -translate-y-1/2">
      <div class="rounded-2xl bg-white/95 p-5 shadow-2xl backdrop-blur-sm">
        <div class="mb-3 flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400">
            <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-gray-800">任务提示</h3>
        </div>
        <div class="rounded-xl bg-amber-50 p-4">
          <p class="text-sm leading-relaxed text-gray-700">
            本单元为一幅<span class="font-bold text-amber-600">名扬中外</span>的画
          </p>
        </div>
      </div>
    </div>

    <!-- 小角色 -->
    <div class="absolute bottom-1/7 right-1/5 z-50">
      <div class="flex flex-col items-center">
        <img
          src="/image/罗罗_汉服.psd 1 .png"
          alt="罗罗"
          class="h-100 w-auto drop-shadow-2xl"
        />
      </div>
    </div>
    <div class="absolute bottom-1/3 right-1/2 z-10">
      <div class="flex flex-col items-left">
        <img
          src="/image/外国女孩 1.png"
          alt="外国女孩"
          class="h-45 w-auto drop-shadow-2xl"
        />
      </div>
    </div>
iv class="relative z-10 flex flex-1 overflow-hidden">
      <!-- 左侧功能菜单 -->
      <aside
        class="flex h-full min-h-0 w-52 flex-shrink-0 flex-col gap-3 overflow-y-auto bg-black/5 p-4 backdrop-blur-sm md:w-56"
      >
        <div class="rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <h3 class="mb-2 text-sm font-bold text-gray-800">AI视觉设计中心</h3>
          <div class="flex flex-col gap-2">
            <button
              @click="handleMenu('创作手绘')"
              class="rounded-lg bg-amber-500 py-2 text-sm font-medium text-white shadow transition-all hover:bg-amber-600"
            >
              创作手绘
            </button>
            <button
              @click="handleMenu('创作海报')"
              class="rounded-lg bg-amber-500 py-2 text-sm font-medium text-white shadow transition-all hover:bg-amber-600"
            >
              创作海报
            </button>
          </div>
        </div>

        <div class="rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <h3 class="mb-2 text-sm font-bold text-gray-800">文艺创作中心</h3>
          <div class="flex flex-col gap-2">
            <button
              @click="handleMenu('创作古诗')"
              class="rounded-lg bg-amber-500 py-2 text-sm font-medium text-white shadow transition-all hover:bg-amber-600"
            >
              创作古诗
            </button>
            <button
              @click="handleMenu('创作现代诗')"
              class="rounded-lg bg-amber-500 py-2 text-sm font-medium text-white shadow transition-all hover:bg-amber-600"
            >
              创作现代诗
            </button>
            <button
              @click="handleMenu('创作小剧本')"
              class="rounded-lg bg-amber-500 py-2 text-sm font-medium text-white shadow transition-all hover:bg-amber-600"
            >
              创作小剧本
            </button>
          </div>
        </div>

        <div class="rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <h3 class="mb-2 text-sm font-bold text-gray-800">学校中医未病治疗中心</h3>
          <div class="flex flex-col gap-2">
            <button
              @click="handleMenu('参观了解中医')"
              class="rounded-lg bg-amber-500 py-2 text-sm font-medium text-white shadow transition-all hover:bg-amber-600"
            >
              参观了解中医
            </button>
          </div>
        </div>

        <div class="rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <h3 class="mb-2 text-sm font-bold text-gray-800">以上方式都不适合我</h3>
          <div class="flex flex-col gap-2">
            <button
              @click="handleMenu('我有其他想法')"
              class="rounded-lg bg-amber-500 py-2 text-sm font-medium text-white shadow transition-all hover:bg-amber-600"
            >
              我有其他想法
            </button>
          </div>
        </div>
      </aside>
    

    <!-- 提示弹窗 -->
    <Teleport to="body">
      <div
        v-if="showToast"
        class="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg bg-gray-800 px-6 py-3 text-white shadow-xl transition-all"
      >
        {{ toastMessage }}
      </div>
    </Teleport>

    <!-- 语音录制弹窗 -->
    <Teleport to="body">
      <div
        v-if="showVoiceModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @click.self="showVoiceModal = false"
      >
        <div class="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
          <div class="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500">
            <div class="absolute h-full w-full animate-ping rounded-full bg-red-400 opacity-30"></div>
            <svg class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
            </svg>
          </div>
          <p class="text-sm text-gray-600">正在录音...</p>
          <button
            @click="stopVoice"
            class="rounded-lg bg-gray-700 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800"
          >
            停止录音
          </button>
        </div>
      </div>
    </Teleport>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()

const inputText = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const showVoiceModal = ref(false)

const goHome = () => {
  router.push('/')
}

const handleSend = () => {
  if (!inputText.value.trim()) {
    toastMessage.value = '请输入内容后再发送'
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2000)
    return
  }
  toastMessage.value = `已发送：${inputText.value}`
  showToast.value = true
  inputText.value = ''
  setTimeout(() => { showToast.value = false }, 2000)
}

const handleVoice = () => {
  showVoiceModal.value = true
}

const stopVoice = () => {
  showVoiceModal.value = false
  toastMessage.value = '语音识别完成，已转为文字'
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

const handlePhoto = () => {
  toastMessage.value = '拍照功能：请选择图片上传'
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}
const handleMenu = (name: string) => {
  toastMessage.value = `已选择：${name}`
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

</script>