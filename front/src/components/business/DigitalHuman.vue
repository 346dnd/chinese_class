<script setup lang="ts">import { ref, watch, onMounted, onUnmounted } from 'vue';
const props = defineProps<{
 show: boolean;
 name: string;
 message: string;
 avatar?: string;
}>();
const emit = defineEmits<{
 (e: 'close'): void;
 (e: 'messageEnd'): void;
}>();
const isVisible = ref(false);
const showMessage = ref(false);
const isSpeaking = ref(false);
const currentText = ref('');
const audioRef = ref<HTMLAudioElement | null>(null);
const speakText = () => {
 if (!props.message)
 return;
 isSpeaking.value = true;
 currentText.value = '';
 showMessage.value = true;
 let index = 0;
 const timer = setInterval(() => {
 if (index < props.message.length) {
 currentText.value += props.message[index];
 index++;
 }
 else {
 clearInterval(timer);
 isSpeaking.value = false;
 setTimeout(() => {
 emit('messageEnd');
 }, 1000);
 }
 }, 80);
};
watch(() => props.show, (val) => {
 if (val) {
 isVisible.value = true;
 setTimeout(() => {
 speakText();
 }, 500);
 }
 else {
 isVisible.value = false;
 showMessage.value = false;
 currentText.value = '';
 }
});
onMounted(() => {
});
onUnmounted(() => {
});
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="digital-human-overlay" @click="emit('close')">
      <div class="digital-human" @click.stop>
        <button class="digital-human__close" @click="emit('close')">×</button>
        <div class="digital-human__avatar">
          <img
            :src="avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`"
            :alt="name"
          />
        </div>
        <div class="digital-human__name">{{ name }}</div>
        <div class="digital-human__speech">
          <div v-if="showMessage" class="digital-human__bubble">
            <span>{{ currentText }}</span>
            <span v-if="isSpeaking" class="digital-human__cursor">|</span>
          </div>
        </div>
        <audio ref="audioRef" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.digital-human-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.digital-human {
  position: relative;
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 400px;
  width: 90%;
}

.digital-human__close {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 32px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.digital-human__avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #4CAF50;
}

.digital-human__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.digital-human__name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.digital-human__speech {
  width: 100%;
}

.digital-human__bubble {
  background: #f5f5f5;
  border-radius: 16px;
  padding: 20px;
  font-size: 18px;
  line-height: 1.6;
  color: #333;
  min-height: 80px;
  display: flex;
  align-items: center;
}

.digital-human__cursor {
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
