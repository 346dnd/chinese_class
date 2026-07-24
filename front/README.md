# 数智交互课程包 - 前端

## 技术栈

- Vue 3.4+
- Vite 5.0+
- TypeScript 5.3+
- Pinia 2.1+
- Vue Router 4.4+
- Axios 1.6+

## 本地启动步骤

### 1. 安装依赖

```bash
cd front
npm install
```

### 2. 启动服务

```bash
npm run dev
```

服务将在 `http://localhost:3000` 启动。

### 3. 构建生产版本

```bash
npm run build
```

## 项目结构

```
front/
├── public/                    # 静态资源
├── src/
│   ├── api/                   # API 接口封装
│   │   └── index.ts
│   ├── components/
│   │   ├── base/              # 基础组件
│   │   │   ├── Toast.vue
│   │   │   ├── ProgressBar.vue
│   │   │   ├── Countdown.vue
│   │   │   ├── Input.vue
│   │   │   ├── Textarea.vue
│   │   │   └── Button.vue
│   │   └── business/          # 业务组件
│   │       ├── DigitalHuman.vue
│   │       ├── AnswerBox.vue
│   │       ├── DialogBubble.vue
│   │       ├── FeedbackOverlay.vue
│   │       └── WordCloud.vue
│   ├── composables/           # 组合式函数
│   │   ├── useWebSocket.ts
│   │   ├── useDigitalHuman.ts
│   │   └── useDraft.ts
│   ├── router/                # 路由配置
│   │   └── index.ts
│   ├── stores/                # 状态管理
│   │   ├── user.ts
│   │   ├── progress.ts
│   │   └── message.ts
│   ├── types/                 # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/                 # 工具函数
│   │   ├── api.ts
│   │   ├── indexedDB.ts
│   │   └── desensitize.ts
│   ├── views/                 # 页面组件
│   │   ├── Login.vue
│   │   ├── Home.vue
│   │   ├── Preview.vue
│   │   ├── Warmup.vue
│   │   ├── Method.vue
│   │   ├── Creation.vue
│   │   ├── ChatRoom.vue
│   │   ├── Homework.vue
│   │   ├── Profile.vue
│   │   └── Dashboard.vue
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## 页面说明

| 页面 | 路径 | 功能描述 |
|------|------|---------|
| 登录页 | `/login` | 学号登录、姓名输入 |
| 首页 | `/` | 课程入口、进度条、数字人交互 |
| 预习页 | `/preview` | 写写感想、提出问题、初步感悟 |
| 重温文化页 | `/warmup` | 赵州桥游戏闯关 |
| 宣传有法页 | `/method` | 表达方法学习、填空练习 |
| 宣传文化页 | `/creation` | 创作选择、多方式创作、AI反馈 |
| 聊天室页 | `/chat` | 小组交流、实时消息 |
| 传承文化页 | `/homework` | 课堂总结、分层作业、作业提交 |
| 个人中心 | `/profile` | 勋章展示、学习记录 |
| 教师看板 | `/dashboard` | 学情数据、词云图、统计分析 |

## 核心功能

1. **数字人交互**：模拟数字人罗罗、小小与学生对话
2. **WebSocket 通信**：实时聊天、心跳保活、断线重连
3. **离线草稿缓存**：IndexedDB 本地存储，网络恢复后自动补发
4. **词云渲染**：Canvas 异步渲染关键词云图
5. **数据脱敏**：日志、展示、导出场景自动脱敏

## 代理配置

开发环境下，Vite 将以下路径代理到后端：
- `/api` → `http://localhost:8080`
- `/ws` → `ws://localhost:8080`
- `/uploads` → `http://localhost:8080`

## 注意事项

- 所有接口请求自动携带 `X-Student-Id` 请求头
- 按钮最小尺寸 48px，字体不小于 16px，适配平板触屏
- 支持语音输入（需浏览器支持 Web Speech API）
