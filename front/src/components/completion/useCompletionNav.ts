import { useRouter } from 'vue-router'

/**
 * 完成态通用导航
 * - 查看评价 → /report（可携带 classId / nodeId，report 页据此定位课堂与活动节点）
 * - 回到首页 → /
 * 复用于所有含"查看评价/回到首页"完成态的页面，与 CompletionFeedback 组件配套。
 * 用法：
 *   const { goToReport, goHome } = useCompletionNav()
 *   goToReport({ classId: 127, nodeId: 17 })  // 可选，缺省时 report 页用默认班级兜底
 */
export function useCompletionNav() {
  const router = useRouter()
  const goToReport = (opts?: { classId?: number | string; nodeId?: number | string }) => {
    const q = new URLSearchParams()
    if (opts?.classId != null) q.set('classId', String(opts.classId))
    if (opts?.nodeId != null) q.set('nodeId', String(opts.nodeId))
    router.push(q.toString() ? `/report?${q.toString()}` : '/report')
  }
  const goHome = () => router.push('/')
  return { goToReport, goHome }
}
