import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  const studentId = ref('')
  const name = ref('')
  const score = ref(0)

  const isLoggedIn = computed(() => studentId.value !== '')

  const login = (sid: string, userName: string) => {
    studentId.value = sid
    name.value = userName
    localStorage.setItem('studentId', sid)
    localStorage.setItem('studentName', userName)
  }

  const logout = () => {
    studentId.value = ''
    name.value = ''
    score.value = 0
    localStorage.removeItem('studentId')
    localStorage.removeItem('studentName')
  }

  const loadFromStorage = () => {
    const sid = localStorage.getItem('studentId')
    const userName = localStorage.getItem('studentName')
    if (sid) {
      studentId.value = sid
    }
    if (userName) {
      name.value = userName
    }
  }

  const updateScore = (newScore: number) => {
    score.value = newScore
  }

  const getUser = (): User => {
    return {
      studentId: studentId.value,
      name: name.value,
      score: score.value
    }
  }

  return {
    studentId,
    name,
    score,
    isLoggedIn,
    login,
    logout,
    loadFromStorage,
    updateScore,
    getUser
  }
})
