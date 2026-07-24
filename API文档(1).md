# API 接口文档

> Base URL: `http://localhost:8080/api`
> 所有请求需带 Header: `X-Student-Id: {学生ID}`
> 契约来源: `backend/api/openapi.yaml`（单一事实源）

---

## 接口清单

| 方法 | 路径 | 用途 | 环节 |
|---|---|---|---|
| GET | `/course` | 课程结构（进度条） | 全局 |
| GET | `/stage/{stageId}` | 环节配置 + 进度 | 全局 |
| POST | `/write` | 提交一篇课文感想 | 寻找文化·任务一 |
| POST | `/validate-blank` | 逐格校验 | 寻找文化·任务二 |
| POST | `/practice` | 提交填空/文本输入 | 宣传有法 |
| POST | `/read-aloud` | 提交朗读音频 | 宣传有法 |
| POST | `/chat` | 创作对话一轮 | 宣传文化 |
| POST | `/chat/polish` | AI 批改对比 | 宣传文化 |
| POST | `/chat/creation` | 创作方式选择/跳过 | 宣传文化 |
| POST | `/feedback/generate` | 强制反馈文案 | 各任务结束 |
| POST | `/media/upload` | 上传图片/音频 | 全局 |

---

## 1. 课程结构

```
GET /course
```

**响应**

```json
{
  "id": "hua",
  "title": "一幅名扬中外的画",
  "stages": [
    { "id": "preview",  "name": "寻找文化", "order": 1, "taskCount": 2 },
    { "id": "warmup",   "name": "重温文化", "order": 2, "taskCount": 1 },
    { "id": "method",   "name": "宣传有法", "order": 3, "taskCount": 2 },
    { "id": "creation", "name": "宣传文化", "order": 4, "taskCount": 1 },
    { "id": "homework", "name": "传承文化", "order": 5, "taskCount": 1 }
  ]
}
```

前端据此渲染 5 步进度条。

---

## 2. 环节详情

```
GET /stage/{stageId}
```

stageId: `preview` | `warmup` | `method` | `creation` | `homework`

**响应**（以 preview 为例）

```json
{
  "id": "preview",
  "name": "寻找文化",
  "order": 1,
  "progress": {
    "currentTaskIndex": 0,
    "completedTaskIds": []
  },
  "tasks": [
    {
      "id": "write-thought",
      "type": "write-thought",
      "title": "写写感想",
      "digitalHumanPrompt": "请同学们翻到第11课...",
      "texts": [
        {
          "id": "text-paper",
          "title": "《纸的发明》",
          "prompt": "读完这篇课文...",
          "minLength": 20,
          "maxLength": 200,
          "allowPhoto": false
        }
      ],
      "retry": { "maxRetries": 3, "onExhausted": "reveal_and_end" },
      "feedbackOverlay": { "forced": true }
    },
    {
      "id": "fill-blank",
      "type": "fill-blank",
      "title": "初步感悟",
      "digitalHumanPrompt": "点击空格...",
      "texts": [
        {
          "id": "text-zhaozhouqiao",
          "title": "《赵州桥》",
          "blanks": [
            { "id": "blank-1", "correctAnswer": "坚固", "context": "这座桥不但____，而且美观。" }
          ]
        }
      ],
      "retry": { "maxRetries": 2, "onExhausted": "reveal_answer" },
      "feedbackOverlay": { "forced": true }
    }
  ]
}
```

`progress.currentTaskIndex` 指示当前做到第几个任务。

---

## 3. 写感想

```
POST /write
```

**请求**

```json
{
  "stageId": "preview",
  "taskId":  "write-thought",
  "textId":  "text-paper",          // 当前课文 ID
  "content": "我觉得造纸术...",      // 学生写的内容
  "imageUrl": null                  // 拍照上传后拿到的 URL（可选）
}
```

**响应**

```json
{
  "passed": true,
  "feedback": "你抓住了造纸术的核心...",
  "retryCount": 1,
  "retryExhausted": false,
  "correctAnswer": null,
  "nextAction": "next_text"         // retry | next_text | next_task
}
```

**前端逻辑**：
- `passed=false` + `nextAction="retry"` → 显示 feedback，让学生修改（保留输入框可编辑）
- `retryExhausted=true` → 显示 correctAnswer（AI 给的答案），不可再编辑
- `nextAction="next_text"` → 自动翻到下一篇课文
- `nextAction="next_task"` → 调用 `/feedback/generate`，弹出强制反馈浮层，播完后跳到下一个任务

---

## 4. 逐格校验

```
POST /validate-blank
```

**请求**

```json
{
  "taskId":  "fill-blank",
  "textId":  "text-zhaozhouqiao",
  "blankId": "blank-1",
  "input":   "坚固"
}
```

**响应**

```json
{
  "correct": true,
  "feedback": null,
  "retryCount": 0,
  "exhausted": false,
  "revealedAnswer": null
}
```

**前端逻辑**：
- `correct=true` → 正确输入**填入**空格显示，该格锁定
- `correct=false` + `exhausted=false` → 显示 feedback，学生**重试**（输入框清空）
- `exhausted=true` → 显示 revealedAnswer 填入空格，该格锁定
- 所有空格 `correct` 或 `exhausted` → 翻到下一篇课文
- 所有课文完成 → 调用 `/feedback/generate`，弹强制反馈浮层

---

## 5. 方法练习（填空 / 文本输入）

```
POST /practice
```

**请求**

```json
{
  "stageId": "method",
  "taskId":  "method-zhaozhouqiao",
  "itemId":  "item-1",
  "content": "这座桥不但坚固，而且美观",
  "imageUrl": null
}
```

**响应**

```json
{
  "passed": true,
  "feedback": "正确！这句话就是全文的中心句。",
  "retryCount": 0,
  "retryExhausted": false,
  "correctAnswer": null
}
```

**前端逻辑**：
- 三个练习项**不限顺序**，学生自由选择先做哪个
- `passed=false` → 显示 feedback，可重试
- `retryExhausted=true` → 显示 correctAnswer，该项锁定
- 全部完成 → 提交按钮高亮 → 调用 `/feedback/generate`

---

## 6. 朗读提交

```
POST /read-aloud
```

**请求**

```json
{
  "stageId": "method",
  "taskId":  "method-zhaozhouqiao",
  "itemId":  "item-2",
  "audioUrl": "https://...",       // 先通过 /media/upload 上传录音
  "referenceText": "这座桥不但坚固，而且美观。桥面两侧有石栏..."
}
```

**响应** 同 `/practice`。

---

## 7. 创作对话

```
POST /chat
```

**请求**

```json
{
  "stageId": "creation",
  "taskId":  "creation",
  "message": "我觉得清明上河图画得很漂亮"
}
```

**响应**

```json
{
  "reply": "能具体说说你觉得哪里画得漂亮吗？",
  "retryCount": 0,
  "retryExhausted": false,
  "correctAnswer": null
}
```

**前端逻辑**：
- 多轮对话，像聊天一样（气泡展示）
- `retryExhausted=true`（连续 3 次不达标）→ 显示 correctAnswer 引导语，允许进入下一步
- 对话自然结束（学生点"完成"或达到轮数上限）→ 调用 `/chat/polish`

---

## 8. AI 批改对比

```
POST /chat/polish
```

**请求**

```json
{ "stageId": "creation", "taskId": "creation" }
```

**响应**

```json
{
  "original": "清明上河图画得很好看，街上有很多人。",
  "polished": "《清明上河图》描绘了北宋汴京的繁华景象——街市上人来人往，有的赶着毛驴，有的挑着担子，有的在茶馆里闲聊，栩栩如生，不愧为'名扬中外的画'。"
}
```

**前端展示**：左右对照——"我的版本" vs "AI 润色版"。

---

## 9. 创作选择

```
POST /chat/creation
```

**请求**

```json
{
  "stageId": "creation",
  "taskId":  "creation",
  "action": "create",        // skip | create
  "optionId": "poster"       // action=create 时必选，对应 CreationTask.creationOptions[].id
}
```

**响应**

```json
{
  "nextAction": "creation_page",
  "creationUrl": "/creation/poster?taskId=creation"   // 创作页面地址
}
```

`action=skip` 时返回 `{ "nextAction": "next_task" }`，调 `/feedback/generate` 后结束。

---

## 10. 强制反馈

```
POST /feedback/generate
```

**请求**

```json
{ "stageId": "preview", "taskId": "write-thought" }
```

**响应**

```json
{
  "type": "audio",
  "script": "你对三篇课文都有自己的思考，特别是对造纸术的理解很深。继续加油！",
  "durationMs": 10000
}
```

**前端逻辑**：
- `type=audio` → 全屏浮层 + 播放 TTS 音频（10 秒），**不可关闭/跳过**
- `type=video` → 全屏浮层 + 播放视频（30 秒），**不可关闭/跳过**
- 播放完毕 → 浮层自动消失 → 进入下一个任务

---

## 11. 媒体上传

```
POST /media/upload
Content-Type: multipart/form-data
```

**请求**

| 字段 | 类型 | 说明 |
|---|---|---|
| file | File | png/jpg（图片）或 wav/mp3（音频），≤10MB |

**响应**

```json
{ "url": "http://localhost:8080/uploads/abc123.png" }
```

拿到的 `url` 传给 `/write`（imageUrl）、`/read-aloud`（audioUrl）使用。

---

## 错误码

| HTTP | code | 说明 |
|---|---|---|
| 400 | `INVALID_PARAMS` | 缺少必填字段 |
| 404 | `NOT_FOUND` | stageId/taskId 不存在 |
| 422 | `EMPTY_INPUT` | 提交内容为空 |
| 422 | `GARBLED_INPUT` | 无法识别 |
| 422 | `SENSITIVE_CONTENT` | 违规内容 |

---

## 前端典型调用流程

```
进入课程
  │
  ├─ GET /course                    → 渲染进度条
  ├─ GET /stage/preview             → 获取第一个环节配置
  │
  ├─ 任务一：写写感想
  │    └─ POST /write (×N篇课文)    → 每篇写完后根据 nextAction 翻篇
  │    └─ POST /feedback/generate   → 强制反馈浮层
  │
  ├─ 任务二：初步感悟
  │    └─ POST /validate-blank (×N格) → 逐格实时校验
  │    └─ POST /feedback/generate   → 强制反馈浮层
  │
  ├─ ... 后续环节类似 ...
  │
  └─ 宣传文化
       ├─ POST /chat (×N轮)         → 多轮对话
       ├─ POST /chat/polish         → AI 批改对比
       ├─ POST /chat/creation       → 选创作方式 或 跳过
       └─ POST /feedback/generate   → 强制反馈浮层
```
