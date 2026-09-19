<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { DefaultService, type Moment, type MomentStats as MomentStatsType, type MomentExtraObj } from '../api/generated'
import { call, toUserFriendlyError, createMoment } from '../api/helpers'

// 班级 ID：优先取路由参数/查询（与 FillBlank 等视图一致），缺省回退 127
const route = useRoute()
const CLASS_ID = Number(route.query.classId) || Number(route.params.classId) || 127

// ===================== 1. 类型定义（对齐后端 Moment 结构体） =====================
interface UserBaseInfoLocal {
  userId: number
  name: string
  avatar?: string
}
interface QABlock {
  title: string
  content: string
  isPassed: boolean
}
interface AnswerReferenceObj {
  answer: string
  reference?: string
}
interface MomentCommentLocal {
  id: number
  user: UserBaseInfoLocal
  content: string
  createdAt: number
}
interface MomentItem {
  id: number
  activityType: string // 活动类型：匹配 key（后端未提供时为空）
  author: UserBaseInfoLocal
  content: string
  images?: string[]
  objs?: MomentExtraObj[]
  createdAt: number
  likes: UserBaseInfoLocal[]
  comments: MomentCommentLocal[]
  likedByMe: boolean
  likeCount: number
  commentCount: number
}

/** 把后端 Moment 归一化为页面使用的 MomentItem（字段名差异在此转换） */
function normalize(raw: Moment): MomentItem {
  // 注意：后端生成的 UserBaseInfo 字段为 userId / name / avatar
  const u = (x: { userId?: number; name?: string; avatar?: string }): UserBaseInfoLocal => ({
    userId: x.userId ?? 0,
    name: x.name || '用户',
    avatar: x.avatar
  })
  const objs = (raw.objs || []) as MomentExtraObj[]
  const activityType = objs.find((o) => typeof o.type === 'string')?.type || ''
  return {
    id: raw.id,
    activityType,
    author: u(raw.author),
    content: raw.content,
    images: (raw.images || []).map((i) => i.url),
    objs: raw.objs as MomentExtraObj[],
    createdAt: raw.createdAt,
    likes: (raw.likes || []).map((l) => u(l.user)),
    comments: (raw.comments || []).map((c) => ({
      id: c.id,
      user: u(c.user),
      content: c.content,
      createdAt: 0
    })),
    likedByMe: raw.likedByMe,
    likeCount: raw.likeCount ?? 0,
    commentCount: raw.commentCount ?? 0
  }
}

/** MomentExtraObj 类型守卫：题目问答列表 */
function isQAList(obj: MomentExtraObj): obj is { type: string; obj: QABlock[] } {
  return obj != null && Array.isArray((obj as any).obj)
}

/** MomentExtraObj 类型守卫：学生作答 + AI 参考范文 */
function isAnswerReference(obj: MomentExtraObj): obj is { type: string; obj: AnswerReferenceObj } {
  return obj != null && !Array.isArray((obj as any).obj) && typeof (obj as any).obj === 'object'
}

const getFirstChar = (name: string) => (name || '用').charAt(0)

// ===================== 2. 活动折叠面板配置 =====================
// 默认（写死兜底）分类；优先用 getMomentSources 接口下发的真实分类覆盖
const activityOptions = ref([
  { label: '全部活动', key: 'all' },
  { label: '写写感想', key: '写写感想' },
  { label: '宣传优秀文化', key: '宣传优秀文化' },
  { label: '文化交流有礼', key: '文化交流有礼' }
])
const currentActiveKey = ref('all')
const activityPanelExpand = ref(true)

// 从接口拉取活动分类（无数据时保留上面写死的兜底）
const loadSources = async () => {
  try {
    const resp = await call(DefaultService.getApiStuClassMomentsSources(CLASS_ID))
    const list = resp.sources || []
    if (list.length) {
      activityOptions.value = [
        { label: '全部活动', key: 'all' },
        ...list.map((s) => ({ label: s, key: s }))
      ]
    }
  } catch (e) {
    console.warn('加载活动分类失败，使用默认分类', toUserFriendlyError(e))
  }
}

// ===================== 3. 真实数据 =====================
const momentList = ref<MomentItem[]>([])
const stats = ref<MomentStatsType | null>(null)
const loading = ref(false)
const errorMsg = ref('')

const loadMoments = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const resp = await call(DefaultService.getApiStuClassMoments(CLASS_ID))
    momentList.value = resp.moments.map(normalize)
  } catch (e) {
    errorMsg.value = toUserFriendlyError(e)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    stats.value = await call(DefaultService.getApiStuClassMomentsMeStats(CLASS_ID))
  } catch (e) {
    // 统计失败不阻断主列表
    console.warn('加载朋友圈统计失败', toUserFriendlyError(e))
  }
}

/** 用后端返回的最新动态覆盖本地 item（点赞/评论后计数与列表即时一致，不整页重拉） */
const applyMomentData = (item: MomentItem, raw: Moment | null | undefined) => {
  if (!raw) return
  const norm = normalize(raw)
  item.likedByMe = norm.likedByMe
  item.likeCount = norm.likeCount
  item.commentCount = norm.commentCount
  item.likes = norm.likes
  item.comments = norm.comments
}

onMounted(() => {
  loadMoments()
  loadStats()
  loadSources()
})

// ===================== 4. 筛选逻辑 =====================
const filterMomentList = computed(() => {
  if (currentActiveKey.value === 'all') return momentList.value
  return momentList.value.filter((item) => item.activityType === currentActiveKey.value)
})

// ===================== 5. 交互方法（真实接口） =====================
const changeActiveMenu = (key: string) => {
  currentActiveKey.value = key
}

const toggleActivityPanel = () => {
  activityPanelExpand.value = !activityPanelExpand.value
}

const handleLike = async (item: MomentItem) => {
  try {
    // 点赞/取消点赞接口返回完整动态，直接用后端最新数据覆盖本条计数，无需整页重拉
    // （generated 类型把 data 定义为 null，实际后端返回完整 Moment，运行时取 body.data 已解包）
    const updated = item.likedByMe
      ? await call(DefaultService.deleteApiStuClassMomentsLike(CLASS_ID, item.id))
      : await call(DefaultService.postApiStuClassMomentsLike(CLASS_ID, item.id))
    applyMomentData(item, updated as unknown as Moment)
    loadStats() // 左侧「我的」栏（我的点赞/获得点赞）同步
  } catch (e) {
    errorMsg.value = toUserFriendlyError(e)
  }
}

// 评论输入（每一条动态独立输入框）
const commentInputs = ref<Record<number, string>>({})
const handleComment = async (item: MomentItem) => {
  const text = (commentInputs.value[item.id] || '').trim()
  if (!text) return
  try {
    // 评论接口返回完整动态：直接覆盖本条（评论数/评论列表即时更新，避免整页重拉的闪烁）
    const updated = await call(DefaultService.postApiStuClassMomentsComments(CLASS_ID, item.id, { content: text }))
    commentInputs.value[item.id] = ''
    applyMomentData(item, updated as unknown as Moment)
    loadStats() // 左侧「我的」栏（我的评论/获得评论）同步
  } catch (e) {
    errorMsg.value = toUserFriendlyError(e)
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

// ===================== 6. 发布动态 / 删除评论（真实接口） =====================
const newPostContent = ref('')
const posting = ref(false)

const handleCreateMoment = async () => {
  const text = newPostContent.value.trim()
  if (!text) return
  posting.value = true
  try {
    // 发布接口需带 content 请求体；generated 的 postApiStuClassMoments 因 openapi 缺陷缺 body 参数，
    // 改用 helpers.createMoment（底层 __request 直接 POST 带 body），字段对齐 PostMomentsReq。
    await createMoment(CLASS_ID, { content: text })
    newPostContent.value = ''
    await loadMoments()
    loadStats() // 左侧「我的分享」同步
  } catch (e) {
    errorMsg.value = toUserFriendlyError(e)
  } finally {
    posting.value = false
  }
}

const handleDeleteComment = async (item: MomentItem, comment: MomentCommentLocal) => {
  try {
    await call(DefaultService.deleteApiStuClassMomentsComments(CLASS_ID, comment.id) as any)
    await loadMoments()
    loadStats() // 左侧「我的评论/获得评论」同步
  } catch (e) {
    errorMsg.value = toUserFriendlyError(e)
  }
}
</script>

<template>
  <div class="page-bg"></div>
  <div class="moment-page-wrap">
    <PageHeader title="璀璨的中华文化" @back="$router.back()" position="fixed" transparent />

    <div class="page-main">
      <!-- 左侧菜单栏 -->
      <div class="left-menu">
        <div class="menu-group">
          <h3 class="menu-group-title">我的</h3>
          <div class="menu-item">
            <span>我的分享</span>
            <span class="num">{{ stats?.momentsPosted ?? '--' }}</span>
          </div>
          <div class="menu-item">
            <span>我的点赞</span>
            <span class="num">{{ stats?.likesGiven ?? '--' }}</span>
          </div>
          <div class="menu-item">
            <span>我的评论</span>
            <span class="num">{{ stats?.commentsGiven ?? '--' }}</span>
          </div>
          <div class="menu-item">
            <span>获得点赞</span>
            <span class="num">{{ stats?.likesReceived ?? '--' }}</span>
          </div>
          <div class="menu-item">
            <span>获得评论</span>
            <span class="num">{{ stats?.commentsReceived ?? '--' }}</span>
          </div>
        </div>

        <!-- 活动折叠面板 -->
        <div class="menu-group">
          <h3 class="menu-group-title">活动</h3>
          <div class="activity-option-list">
            <div
              v-for="opt in activityOptions"
              :key="opt.key"
              class="activity-option-item"
              :class="{ active: currentActiveKey === opt.key }"
              @click="changeActiveMenu(opt.key)"
            >
              {{ opt.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧动态纵向滚动区域 -->
      <div class="right-moment-scroll">
        <!-- 发布动态 -->
        <div class="post-composer">
          <textarea
            class="post-input"
            v-model="newPostContent"
            placeholder="分享此刻的中华文化感悟…"
          ></textarea>
          <button class="post-send" :disabled="posting" @click="handleCreateMoment">
            {{ posting ? '发布中…' : '发布' }}
          </button>
        </div>

        <div v-if="loading" class="empty-tip">加载中…</div>
        <div v-else-if="errorMsg" class="empty-tip error">{{ errorMsg }}</div>
        <div v-else-if="filterMomentList.length === 0" class="empty-tip">暂无动态，快去发布第一条吧～</div>

        <div class="moment-list-container" v-else>
          <div
            v-for="moment in filterMomentList"
            :key="moment.id"
            class="moment-card"
          >
            <!-- 动态头部：发布人+时间 -->
            <div class="moment-card-header">
              <div class="author-info">
                <img class="author-avatar" :src="moment.author.avatar || '/image/default-avatar.png'" alt="头像" />
                <span class="author-name">{{ moment.author.name }}</span>
              </div>
              <span class="publish-time">{{ formatTime(moment.createdAt) }}</span>
            </div>

            <!-- 动态正文：按 objs 渲染多道题目的问答块 / 范文 -->
            <div class="moment-body">
              <template v-for="(obj, objIdx) in moment.objs" :key="objIdx">
                <!-- 形状 A：题目问答列表（绿色通过 / 红色未通过） -->
                <template v-if="isQAList(obj)">
                  <div
                    v-for="(qa, qaIdx) in obj.obj"
                    :key="qaIdx"
                    class="qa-block"
                    :class="{ passed: qa.isPassed, failed: !qa.isPassed }"
                  >
                    <div class="qa-question">{{ qa.title }}</div>
                    <div class="qa-answer-wrap">
                      <div class="qa-answer">{{ qa.content }}</div>
                      <div v-if="qa.isPassed" class="qa-badge">
                        {{ getFirstChar(moment.author.name) }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 形状 B：学生作答 + AI 参考范文 -->
                <template v-else-if="isAnswerReference(obj)">
                  <div v-if="obj.obj.answer" class="qa-block passed">
                    <div class="qa-answer-wrap">
                      <div class="qa-answer">{{ obj.obj.answer }}</div>
                    </div>
                  </div>
                  <div v-if="obj.obj.reference" class="reference-block">
                    <div class="reference-label">AI 批改范文</div>
                    <div class="reference-text">{{ obj.obj.reference }}</div>
                  </div>
                </template>
              </template>

              <!-- 兼容：后端未下发 objs 时直接展示 content -->
              <div v-if="!moment.objs || moment.objs.length === 0" class="moment-content-fallback">
                {{ moment.content }}
              </div>
            </div>

            <!-- 点赞栏 -->
            <div class="moment-like-bar">
              <div class="like-btn" @click="handleLike(moment)" :class="{ liked: moment.likedByMe }">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <span>点赞 {{ moment.likeCount }}</span>
              </div>
              <div class="comment-count-text">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>评论 {{ moment.commentCount }}</span>
              </div>
            </div>

            <!-- 评论列表区域 -->
            <div v-if="moment.comments.length" class="moment-comment-area">
              <div
                v-for="comment in moment.comments"
                :key="comment.id"
                class="comment-item"
              >
                <span class="comment-user">{{ comment.user.name }}：</span>
                <span class="comment-text">{{ comment.content }}</span>
                <span class="comment-del" @click="handleDeleteComment(moment, comment)">删除</span>
              </div>
            </div>

            <!-- 发表评论 -->
            <div class="comment-input-bar">
              <input
                class="comment-input"
                v-model="commentInputs[moment.id]"
                placeholder="说点什么…"
                @keyup.enter="handleComment(moment)"
              />
              <button class="comment-send" @click="handleComment(moment)">发送</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  /* 朋友圈页面：纯白背景（无装饰图） */
  background: #ffffff;
}
.moment-page-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  padding-top: 65px;
  box-sizing: border-box;
}
.page-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧菜单 */
.left-menu {
  width: 300px;
  border-right: 1px solid #ececec;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  background: #f7f8fa;
}
.menu-group-title {
  font-size: 18px;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  font-weight: 600;
}
.menu-item {
  padding: 12px 16px;
  font-size: 16px;
  color: #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: default;
}
.menu-item:hover {
  background: rgba(0, 0, 0, 0.04);
}
.num {
  color: #666;
  font-weight: 500;
}

/* 活动选项 */
.activity-option-list {
  display: flex;
  flex-direction: column;
}
.activity-option-item {
  padding: 12px 16px;
  font-size: 16px;
  color: #444;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  margin-bottom: 4px;
}
.activity-option-item.active {
  background: #e8f3ff;
  color: #1677ff;
}
.activity-option-item:hover:not(.active) {
  background: rgba(0, 0, 0, 0.04);
}

/* 右侧滚动 */
.right-moment-scroll {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 24px 32px;
}

/* 发布动态 */
.post-composer {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: flex-end;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.post-input {
  flex: 1;
  min-height: 56px;
  max-height: 160px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}
.post-send {
  padding: 10px 22px;
  border: none;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.post-send:hover:not(:disabled) {
  opacity: 0.9;
}
.post-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.empty-tip {
  text-align: center;
  color: #666;
  padding: 48px 0;
  font-size: 15px;
}
.empty-tip.error {
  color: #f56c6c;
}
.moment-list-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 动态卡片 */
.moment-card {
  width: 100%;
  border-radius: 16px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}
.moment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}
.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}
.publish-time {
  font-size: 13px;
  color: #888;
}

/* 题目问答块 */
.moment-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}
.qa-block {
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid transparent;
}
.qa-block.passed {
  background: #e7f8e8;
  border-color: #9ce09f;
}
.qa-block.failed {
  background: #fdecec;
  border-color: #f5a3a3;
}
.qa-question {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
  line-height: 1.5;
}
.qa-answer-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.qa-answer {
  flex: 1;
  font-size: 14px;
  line-height: 1.7;
  color: #333;
  word-break: break-word;
}
.qa-badge {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #4a90ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(74, 144, 255, 0.35);
}

/* AI 参考范文 */
.reference-block {
  border-radius: 12px;
  padding: 14px 16px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
}
.reference-label {
  font-size: 13px;
  font-weight: 600;
  color: #d48806;
  margin-bottom: 8px;
}
.reference-text {
  font-size: 14px;
  line-height: 1.7;
  color: #444;
  word-break: break-word;
}

/* content 兜底 */
.moment-content-fallback {
  line-height: 1.7;
  font-size: 15px;
  color: #333;
  padding: 16px;
  border: 1px solid #f0d68a;
  border-radius: 12px;
  background: #fffbe6;
  white-space: pre-line;
}

/* 点赞栏 */
.moment-like-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 0 14px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}
.like-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  user-select: none;
  transition: color 0.2s;
}
.like-btn:hover {
  color: #f56c6c;
}
.like-btn.liked {
  color: #f56c6c;
}
.comment-count-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #888;
  font-size: 14px;
}

/* 评论列表 */
.moment-comment-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.comment-item {
  padding: 10px 12px;
  background: #e8f4ff;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}
.comment-user {
  color: #0957b9;
  font-weight: 600;
  white-space: nowrap;
}
.comment-text {
  color: #333;
  flex: 1;
  word-break: break-word;
}
.comment-del {
  margin-left: auto;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  padding-left: 8px;
}
.comment-del:hover {
  color: #f56c6c;
}
.comment-input-bar {
  display: flex;
  gap: 8px;
}
.comment-input {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
.comment-input:focus {
  border-color: #1677ff;
}
.comment-send {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}
.comment-send:hover {
  opacity: 0.9;
}
</style>
