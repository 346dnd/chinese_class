const DB_NAME = 'EduClassroomDB'
const DB_VERSION = 1

interface DraftRecord {
  id: string
  data: any
  timestamp: number
  status: 'pending' | 'submitted'
}

export class DraftDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('drafts')) {
          const store = db.createObjectStore('drafts', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('status', 'status', { unique: false })
        }
      }
    })
  }

  async saveDraft(id: string, data: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite')
      const store = transaction.objectStore('drafts')
      const record: DraftRecord = {
        id,
        data,
        timestamp: Date.now(),
        status: 'pending'
      }
      const request = store.put(record)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getDraft(id: string): Promise<DraftRecord | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readonly')
      const store = transaction.objectStore('drafts')
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingDrafts(): Promise<DraftRecord[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readonly')
      const store = transaction.objectStore('drafts')
      const index = store.index('status')
      const request = index.getAll('pending')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markSubmitted(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite')
      const store = transaction.objectStore('drafts')
      const request = store.get(id)
      request.onsuccess = () => {
        const record = request.result as DraftRecord
        if (record) {
          record.status = 'submitted'
          store.put(record)
        }
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteDraft(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite')
      const store = transaction.objectStore('drafts')
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const draftDB = new DraftDB()
