import { ref } from 'vue'
import { draftDB } from '@/utils/indexedDB'

export const useDraft = <T>(draftType: string, studentId: string) => {
  const draft = ref<T | null>(null)
  const isLoading = ref(false)

  const getDraftId = (id: string): string => {
    return `${studentId}-${draftType}-${id}`
  }

  const saveDraft = async (id: string, data: T): Promise<void> => {
    await draftDB.saveDraft(getDraftId(id), data)
    draft.value = data
  }

  const loadDraft = async (id: string): Promise<T | null> => {
    isLoading.value = true
    try {
      const record = await draftDB.getDraft(getDraftId(id))
      if (record && record.status === 'pending') {
        draft.value = record.data
        return record.data
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  const markSubmitted = async (id: string): Promise<void> => {
    await draftDB.markSubmitted(getDraftId(id))
    draft.value = null
  }

  const deleteDraft = async (id: string): Promise<void> => {
    await draftDB.deleteDraft(getDraftId(id))
    draft.value = null
  }

  return {
    draft,
    isLoading,
    saveDraft,
    loadDraft,
    markSubmitted,
    deleteDraft
  }
}
