/**
 * 学习进度 Pinia store
 * 管理首页阶段导航、任务完成状态、得分、用户答题数据
 *
 * 首页导航的「节点」来自后端 GET /v1/stu/class/{classId}（章节 / 节点列表 + 完成态），
 * 前端仅保留「阶段外壳」与「节点 key → 路由 / 展示名」的映射（UI 分组为前端配置）。
 * 这样节点 id、是否完成、是否启用都以接口为准，避免前端写死导致错配
 * （如历史上 zhaozhouqiao 误写成 nodeId=17，实际接口为 20）。
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStuClass } from '../api'
import type { StuClassV1DetailResp } from '../types'

/** 本地持久化的已完成任务 id 集合（localStorage），保证「未完成=白、真实做完=绿」不盲信后端 isCompleted */
const COMPLETED_LS_KEY = 'yuwen_completed_tasks'
function loadLocalCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_LS_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set<string>()
  }
}
function saveLocalCompleted(set: Set<string>) {
  try {
    localStorage.setItem(COMPLETED_LS_KEY, JSON.stringify([...set]))
  } catch {
    /* localStorage 不可用时静默降级，仅本次会话有效 */
  }
}

/** 阶段下的任务项 */
export interface StageTask {
  id: string
  name: string
  active: boolean
  finished: boolean
  path: string
  /** 后端节点 id（用于拼接路由 ?nodeId=）；缺省时页面回退到自身默认节点 */
  nodeId?: number
  /** 班级 id，默认 127 */
  classId?: number
}

/** 首页阶段模块（前端导航配置） */
export interface StageModule {
  id: string
  name: string
  color: string
  tasks: StageTask[]
}

/** 节点 key → 路由 / 任务归属映射（UI 分组为前端配置，节点数据来自接口） */
const NODE_KEY_TO_TASK: Record<string, { taskId: string; stageId: string; path: string; name: string }> = {
  'write-thoughts':     { taskId: 'write-feel',      stageId: 'preview',  path: '/preview/write-feel',     name: '写写感想' },
  'initial-insight':   { taskId: 'fill-blank',      stageId: 'preview',  path: '/preview/fill-blank',     name: '初步感悟' },
  'cultural-style':    { taskId: 'warmup-game',     stageId: 'warmup',   path: '/warmup/warmup-game',     name: '重温文化互动' },
  'zhaozhouqiao':      { taskId: 'zhaozhouqiao',    stageId: 'method',   path: '/method/zhaozhouqiao',    name: '学习《赵州桥》的表达方法' },
  'wenmingzhongwai':   { taskId: 'qingming',        stageId: 'method',   path: '/method/qingming',        name: '学习《一幅名扬中外的画》的表达方法' },
  'heritage-cultural': { taskId: 'talk-culture',    stageId: 'creation', path: '/creation/talk-culture',  name: '讲解优秀文化' },
  'culture-workshop':  { taskId: 'promote-culture', stageId: 'creation', path: '/promote/culture',        name: '文化交流有礼' }
}

/** 首页阶段外壳（前端导航配置，节点由接口填充） */
const STAGE_SHELLS: Array<Omit<StageModule, 'tasks'>> = [
  { id: 'preview',  name: '寻找文化讨论会', color: '#F7D76B' },
  { id: 'warmup',   name: '重温文化采风',   color: '#EDF5E6' },
  { id: 'method',   name: '宣传文化大师课', color: '#EDF5E6' },
  { id: 'creation', name: '宣传文化演播厅', color: '#293320ff' },
  { id: 'homework', name: '传承文化践行坊', color: '#EDF5E6' }
]

/** 接口异常时的兜底静态配置（保留原硬编码结构，节点 id 以接口真实值为准） */
const FALLBACK_STAGE_MODULES: StageModule[] = [
  { id: 'preview', name: '寻找文化讨论会', color: '#F7D76B', tasks: [
    { id: 'write-feel', name: '写写感想', active: true, finished: false, path: '/preview/write-feel', nodeId: 17 },
    { id: 'fill-blank', name: '初步感悟', active: false, finished: false, path: '/preview/fill-blank', nodeId: 18 }
  ]},
  { id: 'warmup', name: '重温文化采风', color: '#EDF5E6', tasks: [
    { id: 'warmup-game', name: '重温文化互动', active: false, finished: false, path: '/warmup/warmup-game', nodeId: 19 }
  ]},
  { id: 'method', name: '宣传文化大师课', color: '#EDF5E6', tasks: [
    { id: 'zhaozhouqiao', name: '学习《赵州桥》的表达方法', active: false, finished: false, path: '/method/zhaozhouqiao', nodeId: 20 },
    { id: 'qingming', name: '学习《一幅名扬中外的画》的表达方法', active: false, finished: false, path: '/method/qingming', nodeId: 21 }
  ]},
  { id: 'creation', name: '宣传文化演播厅', color: '#293320ff', tasks: [
    { id: 'talk-culture', name: '讲解优秀文化', active: false, finished: false, path: '/creation/talk-culture', nodeId: 22 },
    { id: 'promote-culture', name: '文化交流有礼', active: false, finished: false, path: '/promote/culture', nodeId: 23 }
  ]},
  { id: 'homework', name: '传承文化践行坊', color: '#EDF5E6', tasks: [
    { id: 'homework-main', name: '传承文化任务', active: false, finished: false, path: '/homework' }
  ]}
]

/** 由接口响应构建阶段导航（修正节点 id、回填完成态、剔除未知 key）
 *  finished 不盲信后端 isCompleted（后端可能误返 true），默认 false（未完成=白）；
 *  真实完成态由本地 localStorage 持久化驱动（loadFromApi 后回填、markTaskFinished 写入）。
 */
function buildStageModules(resp: StuClassV1DetailResp, cid: number, localCompleted: Set<string>): StageModule[] {
  const stageMap = new Map<string, StageModule>(
    STAGE_SHELLS.map((s) => [s.id, { ...s, tasks: [] }])
  )
  for (const section of resp.sections) {
    for (const node of section.nodes) {
      const key = (node.key || '').trim()
      const map = NODE_KEY_TO_TASK[key]
      if (!map) continue // 接口返回了前端未配置的节点 key，跳过
      // 仅本地真实完成记录驱动绿色；后端 isCompleted 不单独决定显示
      const finished = localCompleted.has(map.taskId)
      stageMap.get(map.stageId)?.tasks.push({
        id: map.taskId,
        name: map.name,
        active: false,
        finished,
        path: map.path,
        nodeId: node.id,
        classId: cid
      })
    }
  }
  // 传承文化践行坊：无对应后端节点，保留静态入口（/homework 由业务侧补齐路由）
  stageMap.get('homework')?.tasks.push({
    id: 'homework-main', name: '传承文化任务', active: false, finished: false, path: '/homework', classId: cid
  })
  // 还原首个任务高亮（与原「写写感想」active 一致）
  for (const stage of stageMap.values()) {
    if (stage.tasks.length) { stage.tasks[0].active = true; break }
  }
  return Array.from(stageMap.values())
}

export const useProgressStore = defineStore('progress', () => {
  // ===== state =====
  const stageModules = ref<StageModule[]>(JSON.parse(JSON.stringify(FALLBACK_STAGE_MODULES)))
  const score = ref<number>(0)
  /** 用户答题数据，key 为任务 id，value 为答题明细 */
  const userAnswers = ref<Record<string, unknown>>({})
  /** 当前班级 id（默认 127，可被 VITE_CLASS_ID 覆盖） */
  const classId = ref<number>(127)

  // ===== getters =====
  /** 已完成任务数 */
  const finishedCount = computed(() =>
    stageModules.value
      .flatMap((s) => s.tasks)
      .filter((t) => t.finished).length
  )

  // ===== actions =====

  /**
   * 从后端拉取课堂节点并构建首页导航；失败（网络/401 等）时回退到静态兜底配置，保证首页可用。
   * 调用方无需 await：store 为响应式，Home 的阶段导航会随之刷新。
   */
  async function loadFromApi(cid = 127) {
    classId.value = cid
    const localCompleted = loadLocalCompleted()
    try {
      const resp = await getStuClass(cid)
      stageModules.value = buildStageModules(resp, cid, localCompleted)
    } catch {
      // 失败时仍按本地完成态回填 FALLBACK，保证「真实做完=绿、没做=白」
      const fallback = JSON.parse(JSON.stringify(FALLBACK_STAGE_MODULES))
      for (const stage of fallback) {
        for (const t of stage.tasks) {
          t.finished = localCompleted.has(t.id)
        }
      }
      stageModules.value = fallback
    }
  }

  /** 标记某任务完成（写入 localStorage 持久化 + 更新当前 state） */
  function markTaskFinished(taskId: string) {
    const set = loadLocalCompleted()
    set.add(taskId)
    saveLocalCompleted(set)
    for (const stage of stageModules.value) {
      const task = stage.tasks.find((t) => t.id === taskId)
      if (task) {
        task.finished = true
        return
      }
    }
  }

  /** 记录答题数据 */
  function recordAnswer(taskId: string, data: unknown) {
    userAnswers.value[taskId] = data
  }

  /** 增加得分 */
  function addScore(delta: number) {
    score.value += delta
  }

  /** 重置进度（调试 / 换班用）：清空本地态并重新拉取节点 */
  function reset() {
    score.value = 0
    userAnswers.value = {}
    void loadFromApi(classId.value)
  }

  return {
    stageModules,
    score,
    userAnswers,
    classId,
    finishedCount,
    loadFromApi,
    markTaskFinished,
    recordAnswer,
    addScore,
    reset
  }
})
