// 完成态持久化：让任意「答题页」在答完后刷新仍停留在其完成屏。
//
// 设计要点：
// - 以「路由 key」为维度（如 'write-feel' / 'fill-blank'），与 URL 一一对应，
//   刷新后浏览器保留 URL，配合本模块即可还原该页完成态。
// - 不依赖后端是否完整落库（例如 write-thoughts 后端仅存第 1 题时，本模块仍可保证前端“答完即记住”）。
// - 仅用 localStorage（同源、按浏览器），适合课堂演示场景。

const PREFIX = 'ywkt:completion:'
const VERSION = 1

// 用户维度：同一浏览器多账号（如 stu001 / stu002）各自的完成态与答题缓存互不串扰
function userScope(): string {
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const u = JSON.parse(raw) as { username?: string; realName?: string }
      const name = (u && (u.username || u.realName)) || ''
      return name ? encodeURIComponent(String(name)) : 'anon'
    }
  } catch {
    /* ignore */
  }
  return 'anon'
}

export interface CompletionRecord {
  v: number
  completed: boolean
  completedAt?: number
  // 各页可附带自己的进度快照（passedMap / history 等），刷新后原样还原
  progress?: Record<string, unknown>
}

export function useCompletionPersistence(routeKey: string) {
  // 新 key 带用户维度；旧 key（无用户维度）作为读取兼容回退
  const legacyKey = PREFIX + routeKey
  const storageKey = `${PREFIX}${userScope()}:${routeKey}`

  function read(): CompletionRecord | null {
    const parse = (raw: string | null): CompletionRecord | null => {
      if (!raw) return null
      try {
        const data = JSON.parse(raw) as CompletionRecord
        return data && data.v === VERSION ? data : null
      } catch {
        return null
      }
    }
    // 优先读当前用户的 key；没有则回退旧版全局 key（兼容历史完成态）
    return parse(localStorage.getItem(storageKey)) || parse(localStorage.getItem(legacyKey))
  }

  function write(record: CompletionRecord) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(record))
    } catch {
      /* 隐私模式 / 配额超限时静默忽略 */
    }
  }

  // 标记完成，并可选地保存进度快照
  function markCompleted(progress?: Record<string, unknown>) {
    write({
      v: VERSION,
      completed: true,
      completedAt: Date.now(),
      progress
    })
  }

  // 保存进度快照（保留已记录的 completed 状态，不强制标记完成）
  // 用于「作答中途刷新也能停在同一节点、保留每题答案」
  function saveProgress(progress: Record<string, unknown>) {
    const rec = read()
    write({
      v: VERSION,
      completed: rec?.completed ?? false,
      completedAt: rec?.completedAt,
      progress
    })
  }

  // 读取进度快照（无论是否完成，有则还原）
  function loadProgress<T extends Record<string, unknown> = Record<string, unknown>>(): T | null {
    const rec = read()
    return rec?.progress ? (rec.progress as T) : null
  }

  function isCompleted(): boolean {
    const rec = read()
    return !!rec?.completed
  }

  // 清除（例如重新作答 / 切换账号时调用）
  function clear() {
    try {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(legacyKey)
    } catch {
      /* ignore */
    }
  }

  return { markCompleted, loadProgress, isCompleted, clear, saveProgress }
}
