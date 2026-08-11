<script setup lang="ts">
import { ref, computed } from 'vue'

// ===================== 1. 类型定义（对齐后端Moment结构体） =====================
interface UserBaseInfo {
  userId: number
  name: string
  avatar?: string
}
interface MomentExtraObj {
  // 预留扩展字段
}
interface MomentComment {
  id: number
  user: UserBaseInfo
  content: string
  createdAt: number
}
interface MomentItem {
  id: number
  activityType: string // 活动类型：匹配key
  author: UserBaseInfo
  content: string
  images?: string[]
  objs?: MomentExtraObj[]
  createdAt: number
  likes: UserBaseInfo[]
  comments: MomentComment[]
  likedByMe: boolean
  likeCount: number
  commentCount: number
}

// ===================== 2. 活动折叠面板配置 =====================
const activityOptions = ref([
  { label: '全部活动', key: 'all' },
  { label: '躬身践行', key: 'practice' },
  { label: '当下生活', key: 'daily-life' }
])
// 当前选中活动key
const currentActiveKey = ref('all')
// 面板展开收起状态
const activityPanelExpand = ref(true)

// ===================== 3. Mock朋友圈动态数据 =====================
// 真实网络请求统一放在独立接口文档，本页面仅做前端mock模拟
const mockMomentList = ref<MomentItem[]>([
  {
    id: 1,
    activityType: 'write-feel',
    author: { userId: 1001, name: '睿杰', avatar: '/image/user1.png' },
    content: `在《纸的发明》中，是哪些让你感到自豪？
这是学生输入的文字信息，这里的文字只是为了让学生可以看到前面的课文输入的内容，只可以查看，不可以重新修改

在《赵州桥》，是哪些让你感到自豪？
这个是学生输入三次错误或者有第二次选择提供参考答案后，系统自动填写写的参考答案，这个是学生输入三次错误后，系统自动填写的参考答案

在《一幅名扬中外的画》中，是哪些让你感到自豪？
这是学生输入的文字信息，这里的文字只是为了让学生可以看到前面的课文输入的内容，只可以查看，不可以重新修改`,
    createdAt: 1754046066,
    likes: [{ userId: 1002, name: '刘备', avatar: '/image/user2.png' }],
    comments: [
      {
        id: 101,
        user: { userId: 1003, name: '关羽', avatar: '/image/user3.png' },
        content: '这是一段评论的文字信息',
        createdAt: 1754046100
      },
      {
        id: 102,
        user: { userId: 1004, name: '刘备', avatar: '/image/user2.png' },
        content: '这是一段评论的文字信息',
        createdAt: 1754046120
      }
    ],
    likedByMe: false,
    likeCount: 1,
    commentCount: 2
  },
  {
    id: 2,
    activityType: 'promote-culture',
    author: { userId: 1002, name: '刘备', avatar: '/image/user2.png' },
    content: `这是学生输入的文字信息，这是学生输入的，这是学生输入的文字信息，这是学生输入的文字信息，这是学生输入的文字信息，这是学生输入的文字信息，这是学生输入的文字信息，这是学生输入的文字信息，这是学生输入的文字信息。`,
    createdAt: 1754046066,
    likes: [],
    comments: [],
    likedByMe: false,
    likeCount: 0,
    commentCount: 0
  }
])

// ===================== 4. 筛选逻辑：根据选中活动过滤动态 =====================
const filterMomentList = computed(() => {
  if (currentActiveKey.value === 'all') return mockMomentList.value
  return mockMomentList.value.filter(item => item.activityType === currentActiveKey.value)
})

// ===================== 5. 交互方法【仅前端mock，真实接口统一放到独立接口文档】 =====================
const changeActiveMenu = (key: string) => {
  currentActiveKey.value = key
}

const toggleActivityPanel = () => {
  activityPanelExpand.value = !activityPanelExpand.value
}

// 点赞：只修改前端状态，真实点赞逻辑后续统一在接口文档实现
const handleLike = (item: MomentItem) => {
  if (item.likedByMe) {
    item.likedByMe = false
    item.likeCount -= 1
    item.likes = item.likes.filter(u => u.userId !== 10000) // 10000为当前登录用户ID
  } else {
    item.likedByMe = true
    item.likeCount += 1
    item.likes.push({ userId: 10000, name: '当前用户', avatar: '/image/cur-user.png' })
  }
}

// 格式化时间戳转日期
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

// 统计数据加载：真实请求统一放到接口文档，当前仅占位
// const loadMyStat = async () => {}
</script>

<template>
  <div class="moment-page-wrap">
    <!-- 顶部返回标题栏 -->
    <div class="page-header">
      <span class="back-btn" @click="$router.back()">&lt;</span>
      <h2 class="page-title">璀璨的中华文化</h2>
    </div>

    <div class="page-main">
      <!-- 左侧菜单栏 -->
      <div class="left-menu">
        <div class="menu-group">
          <h3 class="menu-group-title">我的</h3>
          <div class="menu-item">我的分享 <span class="num">--</span></div>
          <div class="menu-item">我的点赞 <span class="num">--</span></div>
          <div class="menu-item">我的评论 <span class="num">--</span></div>
          <div class="menu-item">获得点赞 <span class="num">--</span></div>
        </div>

        <!-- 活动折叠面板，对齐原型截图 -->
        <div class="menu-group">
          <h3 class="menu-group-title">活动</h3>
          <div class="activity-panel-header" @click="toggleActivityPanel">
            <span class="header-text">全部活动</span>
            <span class="arrow-icon" :class="{ 'arrow-up': activityPanelExpand }">∧</span>
          </div>
          <div v-show="activityPanelExpand" class="activity-option-list">
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
        <div class="moment-list-container">
          <div
            v-for="moment in filterMomentList"
            :key="moment.id"
            class="moment-card"
          >
            <!-- 动态头部：发布人+时间 -->
            <div class="moment-card-header">
              <div class="author-info">
                <img class="author-avatar" :src="moment.author.avatar" alt="头像" />
                <span class="author-name">{{ moment.author.name }}</span>
              </div>
              <span class="publish-time">{{ formatTime(moment.createdAt) }}</span>
            </div>

            <!-- 动态正文内容 -->
            <div class="moment-content">
              {{ moment.content }}
            </div>

            <!-- 点赞栏：黑白线条SVG图标 -->
            <div class="moment-like-bar">
              <div class="like-btn" @click="handleLike(moment)" :class="{liked: moment.likedByMe}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <span>点赞 {{ moment.likeCount }}</span>
              </div>
              <div class="comment-count-text">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>评论 {{ moment.commentCount }}</span>
              </div>
            </div>

            <!-- 评论列表区域 -->
            <div class="moment-comment-area">
              <div
                v-for="comment in moment.comments"
                :key="comment.id"
                class="comment-item"
              >
                <span class="comment-user">{{ comment.user.name }}：</span>
                <span class="comment-text">{{ comment.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.moment-page-wrap {
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.page-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}
.back-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 12px;
  color: #333;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}
.page-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧菜单 */
.left-menu {
  width: 300px;
  border-right: 1px solid #eee;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.menu-group-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 16px 0;
  font-weight: 600;
}
.menu-item {
  padding: 12px 16px;
  font-size: 16px;
  color: #555;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.num {
  color: #999;
}

/* 活动折叠面板样式 */
.activity-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 16px;
  color: #555;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}
.arrow-icon {
  font-size: 14px;
  transition: transform 0.2s ease;
}
.arrow-up {
  transform: rotate(180deg);
}
.activity-option-list {
  display: flex;
  flex-direction: column;
}
.activity-option-item {
  padding: 12px 16px 12px 28px;
  font-size: 16px;
  color: #555;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: 0.2s;
}
.activity-option-item.active {
  background: #e8f3ff;
  color: #1677ff;
}
.activity-option-item:hover:not(.active) {
  background: #f5f7fa;
}

/* 右侧滚动 */
.right-moment-scroll {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 24px;
}
.moment-list-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 动态卡片 */
.moment-card {
  width: 100%;
  max-width: 720px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: #fff;
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
  gap: 8px;
}
.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.author-name {
  font-size: 16px;
  font-weight: 500;
}
.publish-time {
  font-size: 13px;
  color: #999;
}
.moment-content {
  line-height: 1.7;
  font-size: 15px;
  color: #333;
  padding: 16px;
  border: 2px solid #f7c868;
  border-radius: 8px;
  margin-bottom: 16px;
  white-space: pre-line;
}
.moment-like-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}
.like-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #555;
}
.like-btn.liked {
  color: #f56c6c;
}
.comment-count-text {
  display: flex;
  align-items: center;
  gap:4px;
  color: #999;
  font-size: 14px;
}
.moment-comment-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.comment-item {
  padding: 8px 12px;
  background: #e8f4ff;
  border-radius: 6px;
  font-size: 14px;
}
.comment-user {
  color: #0957b9;
  font-weight: 500;
}
.comment-text {
  color: #333;
}
</style>