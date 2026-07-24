import { ref } from 'vue'

export const useDigitalHuman = () => {
  const showDigitalHuman = ref(false)
  const digitalHumanName = ref('')
  const digitalHumanMessage = ref('')

  const show = (name: string, message: string) => {
    digitalHumanName.value = name
    digitalHumanMessage.value = message
    showDigitalHuman.value = true
  }

  const hide = () => {
    showDigitalHuman.value = false
  }

  const showLuoluo = (message: string) => {
    show('罗罗', message)
  }

  const showXiaoxiao = (message: string) => {
    show('小小', message)
  }

  const showEthan = (message: string) => {
    show('伊森', message)
  }

  const showMia = (message: string) => {
    show('米娅', message)
  }

  return {
    showDigitalHuman,
    digitalHumanName,
    digitalHumanMessage,
    show,
    hide,
    showLuoluo,
    showXiaoxiao,
    showEthan,
    showMia
  }
}
