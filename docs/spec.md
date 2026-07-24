# 数智交互课程包 - 系统开发规范文档

> 版本：v1.2
> 日期：2026-07-24
> 适用课程：三年级下第四单元《宣传中华优秀传统文化》

---

## 一、需求拆解

### 1.1 核心业务流程

```mermaid
flowchart TD
    A[学生登录] --> B[课程首页]
    B --> C{选择环节}
    C --> D[寻找文化-预习]
    C --> E[重温文化-复习导入]
    C --> F[宣传有法-学习表达方法]
    C --> G[宣传文化-创作宣传]
    C --> H[传承文化-作业]
    
    D --> D1[写写感想]
    D1 --> D2[提出问题]
    D2 --> D3[初步感悟]
    D3 --> B
    
    E --> E1[赵州桥游戏闯关]
    E1 --> F
    
    F --> F1[赵州桥学习]
    F1 --> F2[清明上河图学习]
    F2 --> G
    
    G --> G1[说一段话-必选]
    G1 --> G2{选择创作方式}
    G2 --> G3[手抄报]
    G2 --> G4[海报]
    G2 --> G5[写诗]
    G2 --> G6[小剧本]
    G2 --> G7[中医介绍]
    G2 --> G8[自选方式]
    G3 --> G9[小组交流]
    G4 --> G9
    G5 --> G9
    G6 --> G9
    G7 --> G9
    G8 --> G9
    G9 --> G10[班级群交流]
    G10 --> H
    
    H --> H1[课堂总结]
    H1 --> H2[分层作业推荐]
    H2 --> H3[完成作业]
```

### 1.2 功能模块清单

| 模块 | 功能描述 | 关联页面 |
|------|---------|---------|
| 用户认证 | 学号登录、验证码验证、设备绑定 | 登录页 |
| 课程导航 | 进度条展示、环节跳转 | 首页 |
| 预习模块 | 写写感想、提出问题、初步感悟 | 预习页 |
| 复习导入 | 赵州桥游戏闯关、数据看板 | 重温文化页 |
| 学习模块 | 表达方法学习、填空练习、朗读 | 宣传有法页 |
| 创作模块 | 多方式宣传创作、AI反馈 | 宣传文化页 |
| 交流模块 | 小组聊天、班级群交流 | 聊天室页 |
| 作业模块 | 分层作业推荐、作业提交 | 传承文化页 |
| 成就系统 | 勋章获取、宝藏箱 | 个人中心 |
| 教师看板 | 学情数据、词云图、统计分析 | 看板页 |

### 1.3 核心业务规则

#### 1.3.1 预习环节规则
- 学生按顺序完成：写写感想 → 提出问题 → 初步感悟
- 每篇课文必须写出让自己自豪的中华优秀传统文化方面
- 必须联系课文内容和生活实际写想法
- 提问题需至少1个，与课文内容相关
- 填空练习每格2次错误后显示正确答案

#### 1.3.2 学习环节规则
- "说一段话"为必选题，完成后才能选择其他方式
- 最多完成3种宣传方式
- 完成2种及以上获得"宣传大使勋章"
- AI根据回答质量分3轮反馈，3轮不达标显示引导语

#### 1.3.3 交流环节规则
- 按相同宣传方式自动分组
- 小组交流有2分钟倒计时
- 班级群交流有4分钟倒计时
- 临时组长汇报内容全班可见

#### 1.3.4 作业环节规则
- 得分80以下：推荐文化景点宣传作业
- 得分80以上：推荐春节宣传作业
- 必选题：写一段话（围绕一个意思写清楚）
- 选做题：手抄报、海报、诗歌、小剧本等

### 1.4 数据采集需求

| 数据类型 | 采集内容 | 用途 |
|---------|---------|------|
| 预习数据 | 自豪方面关键词、课文内容引用、生活实际关键词 | 学情分析、词云展示 |
| 问题数据 | 问题内容、涉及关键词 | 统计分析、热点问题 |
| 答题数据 | 正确率、修改次数、耗时 | 学习能力评估 |
| 创作数据 | 宣传方式选择、内容关键词 | 个性化推荐 |
| 交流数据 | 发言内容、互动次数 | 参与度分析 |

### 1.5 非功能需求【新增】

#### 1.5.1 并发要求
- 单班级50台平板同时在线，WebSocket长连接无断线
- 接口支持200QPS峰值，P99延迟≤500ms
- 数据库连接池配置：最大连接数=100，最小空闲连接=20

#### 1.5.2 性能要求
- 页面首屏加载≤2s（HTML+CSS+JS总大小≤500KB，图片懒加载）
- 答题接口响应≤300ms（数据库查询命中索引，Redis缓存热点数据）
- 词云渲染≤1s（Canvas异步渲染，避免阻塞主线程）
- 视频播放启动时间≤500ms（预加载关键帧）

#### 1.5.3 平板兼容要求
- Android 10+ 平板，2GB内存无闪退
- WebView版本要求：Android System WebView ≥ 100
- 弱网WiFi波动（丢包率20%、延迟200ms）下自动重连
- 分辨率适配：支持1280×800、1920×1080、2048×1536

#### 1.5.4 离线容错要求
- 断网时本地缓存学生输入（IndexedDB存储，每条记录带时间戳）
- 恢复网络后自动补发未提交数据，按时间戳顺序提交
- 本地缓存有效期：7天，超出后提示用户确认提交
- 提交失败时重试3次，间隔10s/30s/60s，仍失败则保留本地待下次网络恢复

#### 1.5.5 数据留存要求
- 学情数据留存3年，满足教研溯源
- 原始答题数据（answers表）永久保存
- 统计分析数据定期聚合，历史明细归档到历史表
- 删除学生账号时仅删除个人身份信息，学习数据匿名化保留

### 1.6 AI反馈逻辑【修正】

#### 1.6.1 写写感想反馈规则

| 条件 | 反馈内容 |
|------|---------|
| 回答了自豪方面且非老师提示 | "你是个爱思考的好孩子。到目前为止，有（）%的学生能做到这一点。" |
| 回答了自豪方面且来自老师提示 | "到目前为止，有（）%的学生跟你的想法相同。" |
| 联系课文内容 | "非常好。此外，课文的其他内容例如（）也会让你感到自豪的，请把内容写具体些。" |
| 联系生活实际 | "非常好。此外，这些生活实际例如（）也会让你感到自豪的，请把内容写具体些。" |
| 未完成每篇课文 | "你必须在读完每篇课文后，都能写出让你自豪的一个方面，还要联系课文内容和生活实际。" |
| 完成课文但未联系生活实际 | "但还要联系生活实际把自己的想法写具体。加油！" |
| 完成全部要求 | "每篇课文你都写了让自己自豪的方面，而且联系了课文内容和生活实际，你的思维能力真好！" |

#### 1.6.2 提出问题反馈规则

| 条件 | 反馈内容 |
|------|---------|
| 问题与课文内容无关 | "你提到了（）这个问题，但跟课文内容没有关系。你可以从课文的这些内容例如（）去思考。" |
| 问题与课文内容相关 | "可见你对课文内容有认真思考。你还可以从课文的这些内容例如（）去思考、提问。" |
| 未提问题 | "你还没有提问题哦。爱动脑筋的你，一定有很多问题想提出来的。" |
| 已提问题 | "你的提问水平越来越高了。到目前为止，提一个问题的学生有（）%..." |

#### 1.6.3 初步感悟反馈规则

| 条件 | 反馈内容 |
|------|---------|
| 全部回答正确-一次性 | "有（）%的学生一次性回答正确。你的学习能力和专注力真强。" |
| 全部回答正确-修改1次 | "有（）%的学生修改一次就回答正确。你的学习能力真强。" |
| 全部回答正确-修改2次 | "有（）%的学生修改两次就回答正确。你的学习能力真强。" |
| 全部回答正确-修改3次 | "有（）%的学生修改三次就回答正确。你的学习能力真强。" |
| 全部回答正确-修改4次及以上 | "你坚持不懈，终于回答正确。我相信爱拼搏的你，学习能力会越来越强的。" |
| 填空错误 | "请你翻到课文第3自然段，认真读，会思考，我相信你能想到正确的答案。" |

#### 1.6.4 创作反馈规则（说一段话）

| 轮次 | 条件 | 反馈内容 |
|------|------|---------|
| 第1轮 | 提交内容 | "请检查你说的这段话是不是：1.确定一个意思。2.根据一个意思来写中心句。" |
| 第2轮 | 提交修改后内容 | "你说得越来越好。围绕中心句，后面每一句话说的内容除了都跟'这个意思'有关，你还可以用上课文的事例或细节说具体..." |
| 第3轮 | 提交修改后内容 | "你能够围绕一个意思把一段话说清楚，而且能用上修辞手法，内容具体、生动。你是一名学霸吧？" |
| 3轮不达标 | 连续3次未达标 | 显示引导语，允许进入下一步 |

### 1.6 AI降级与合规说明【新增】

#### 1.6.1 AI降级策略

**Coze对话接口降级**
- 超时时间：5s
- 失败重试：2次，间隔1s
- 降级策略：返回预设引导文案，不阻塞流程

预设引导文案示例：
| 场景 | 引导文案 |
|------|---------|
| 写写感想反馈失败 | "你的回答很棒！继续加油哦！" |
| 提出问题反馈失败 | "你的问题很有深度！继续思考！" |
| 填空校验失败 | "请你再仔细想想，相信你一定能答对！" |
| 创作对话失败 | "你的想法很有趣！我们继续交流吧！" |

**TTS接口降级**
- 超时时间：3s
- 失败重试：1次
- 降级策略：显示文本反馈，不播放音频

#### 1.6.2 AI合规校验规则

**生成内容合规校验**
- 关键词过滤：检测并拦截违规词汇（敏感词库定期更新）
- 内容长度限制：单条反馈不超过200字
- 语气限制：使用积极、鼓励、教育性语言，禁止负面、讽刺、攻击性语言
- 知识准确性：对于事实性内容，AI需提供准确信息，不确定时明确说明

**用户输入合规校验**
- 关键词过滤：检测并拦截违规词汇，返回"请输入文明用语"提示
- 内容长度限制：单条输入不超过500字
- 格式校验：禁止输入HTML、脚本等特殊字符

---

## 二、页面原型

### 2.1 页面清单

| 页面名称 | 路径 | 功能描述 |
|---------|------|---------|
| 登录页 | `/login` | 学号登录、验证码获取、设备绑定 |
| 首页 | `/` | 课程入口、进度条、数字人交互 |
| 预习页 | `/preview` | 写写感想、提出问题、初步感悟 |
| 重温文化页 | `/warmup` | 赵州桥游戏闯关 |
| 宣传有法页 | `/method` | 表达方法学习、填空练习、朗读 |
| 宣传文化页 | `/creation` | 创作选择、多方式创作、AI反馈 |
| 聊天室页 | `/chat` | 小组交流、班级群交流 |
| 传承文化页 | `/homework` | 课堂总结、分层作业、作业提交 |
| 个人中心 | `/profile` | 勋章展示、宝藏箱、学习记录 |
| 教师看板 | `/dashboard` | 学情数据、词云图、统计分析 |

### 2.2 页面原型详细设计

#### 2.2.1 首页

```
┌──────────────────────────────────────────────┐
│              课程标题：宣传中华优秀传统文化      │
├──────────────────────────────────────────────┤
│                                              │
│   [罗罗]──────┬────────────────┬──────[小小]  │
│      │        │                │        │     │
│   点击交互   进度条           点击交互      │
│      │        │                │        │     │
│      ↓        ↓                ↓        ↓     │
│  数字人弹窗  ○──○──○──○──○   数字人弹窗      │
│           1  2  3  4  5                    │
│        寻找 重温 宣传 宣传 传承              │
│        文化 文化 有法 文化 文化              │
│                                              │
└──────────────────────────────────────────────┘
```

#### 2.2.2 预习页

```
┌──────────────────────────────────────────────┐
│  返回  │  预习环节  │  进度: 1/3              │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  [数字人罗罗] 说话中...              │    │
│  │  "亲爱的同学，请写下你的感想..."     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 课文选择: [纸的发明] [赵州桥]        │    │
│  │           [一幅名扬中外的画]          │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 让我自豪的方面: _________________    │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 联系课文内容:                        │    │
│  │ [文本输入框，支持语音输入]           │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 联系生活实际:                        │    │
│  │ [文本输入框，支持语音输入]           │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │ 拍照上传        │  │ 提交             │   │
│  └─────────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────┘
```

#### 2.2.3 宣传有法页

```
┌──────────────────────────────────────────────┐
│  返回  │  宣传有法  │  进度: 1/2              │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 课文选择: [赵州桥] [一幅名扬中外的画] │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 学习任务:                            │    │
│  │                                      │    │
│  │ ①确定一个意思: [________]            │    │
│  │                                      │    │
│  │ ②中心句: [________________________] │    │
│  │                                      │    │
│  │ ③写具体: [________________________] │    │
│  │          [________________________] │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ [语音朗读] 按钮                        │    │
│  │ 课文内容展示区域                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │ 重新朗读        │  │ 提交             │   │
│  └─────────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────┘
```

#### 2.2.4 宣传文化页

```
┌──────────────────────────────────────────────┐
│  返回  │  宣传文化  │  已完成: 1/3          │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 创作方式选择:                         │    │
│  │                                      │    │
│  │ 1. 说一段话 ★ (必选)                │    │
│  │ 2. 做一张手抄报                      │    │
│  │ 3. 做一张海报                        │    │
│  │ 4. 写一首诗                          │    │
│  │ 5. 写一个小剧本                      │    │
│  │ 6. 参观中医治未病中心                │    │
│  │ 7. 自己喜欢的方式                    │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ [数字人伊森/米娅] 对话展示            │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ [创作输入区域]                        │    │
│  │ [语音输入/文字输入切换]                │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │ 修改            │  │ 提交             │   │
│  └─────────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────┘
```

#### 2.2.5 聊天室页

```
┌──────────────────────────────────────────────┐
│  返回  │  小组交流  │  倒计时: 01:30        │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 组员列表: [张三] [李四] [王五]       │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 消息列表:                            │    │
│  │ [张三] 我是用手抄报宣传的...         │    │
│  │ [李四] 我觉得...                     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ [输入框] [语音按钮] [发送按钮]        │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

#### 2.2.6 教师看板页

```
┌──────────────────────────────────────────────┐
│              教师数据看板                     │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 参与人数 │ │ 完成率   │ │ 正确率   │    │
│  │  45/48   │ │   93%    │ │   87%    │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │          词云图展示区                   │    │
│  │  [智慧][创造力][精美][艺术精湛]...     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 宣传方式统计:                         │    │
│  │ 说一段话 ████████████ 45%           │    │
│  │ 手抄报 ████████ 30%                 │    │
│  │ 海报 ████ 15%                       │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 预习数据详情:                         │    │
│  │ - 联系课文内容: 85%                  │    │
│  │ - 联系生活实际: 72%                  │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

---

## 三、接口文档

> Base URL: `http://localhost:8080/api`
> 所有请求需带 Header: `X-Student-Id: {学生ID}`
> 契约来源: `openapi/spec/`（单一事实源）

---

### 3.1 接口清单

| 方法 | 路径 | 用途 | 环节 |
|------|------|------|------|
| GET | `/course` | 课程结构（进度条） | 全局 |
| GET | `/stage/{stageId}` | 环节配置 + 进度 | 全局 |
| POST | `/write` | 提交一篇课文感想 | 寻找文化·任务一 |
| POST | `/question` | 提交问题 | 寻找文化·任务二 |
| POST | `/validate-blank` | 逐格校验 | 寻找文化·任务三 |
| POST | `/practice` | 提交填空/文本输入 | 宣传有法 |
| POST | `/read-aloud` | 提交朗读音频 | 宣传有法 |
| POST | `/chat` | 创作对话一轮 | 宣传文化 |
| POST | `/chat/polish` | AI 批改对比 | 宣传文化 |
| POST | `/chat/creation` | 创作方式选择/跳过 | 宣传文化 |
| POST | `/group/create` | 创建临时小组 | 宣传文化 |
| POST | `/group/join` | 加入小组 | 宣传文化 |
| POST | `/message/send` | 发送消息 | 宣传文化 |
| POST | `/message/list` | 获取消息列表 | 宣传文化 |
| POST | `/homework/submit` | 提交作业 | 传承文化 |
| POST | `/homework/recommend` | 获取推荐作业 | 传承文化 |
| POST | `/feedback/generate` | 强制反馈文案 | 各任务结束 |
| POST | `/media/upload` | 上传图片/音频 | 全局 |
| POST | `/badge/award` | 颁发勋章 | 全局 |
| GET | `/dashboard/data` | 获取教师看板数据 | 教师端 |

---

### 3.0 全局统一返回体规范【新增】

#### 3.0.1 成功响应结构

```json
{
  "code": 0,
  "msg": "success",
  "data": {},
  "traceId": "abc123-def456-ghi789"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 业务状态码，0表示成功，非0表示失败 |
| msg | string | 提示信息，成功时为"success"，失败时为错误描述 |
| data | object | 业务数据，成功时返回具体业务内容，失败时可为null |
| traceId | string | 链路追踪ID，用于问题排查 |

#### 3.0.2 失败响应结构

```json
{
  "code": 400,
  "msg": "缺少必填字段",
  "data": null,
  "traceId": "abc123-def456-ghi789"
}
```

#### 3.0.3 分页响应结构

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  },
  "traceId": "abc123-def456-ghi789"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 数据列表 |
| total | int | 总记录数 |
| page | int | 当前页码 |
| pageSize | int | 每页条数 |

#### 3.0.4 后端实现示例

```go
// 统一响应结构体
type Response struct {
    Code    int         `json:"code"`
    Msg     string      `json:"msg"`
    Data    interface{} `json:"data"`
    TraceId string      `json:"traceId"`
}

// 成功响应
func Success(data interface{}) *Response {
    return &Response{
        Code:    0,
        Msg:     "success",
        Data:    data,
        TraceId: generateTraceId(),
    }
}

// 失败响应
func Error(code int, msg string) *Response {
    return &Response{
        Code:    code,
        Msg:     msg,
        Data:    nil,
        TraceId: generateTraceId(),
    }
}

// 分页响应
func SuccessWithPage(list interface{}, total int, page int, pageSize int) *Response {
    return &Response{
        Code: 0,
        Msg:  "success",
        Data: map[string]interface{}{
            "list":     list,
            "total":    total,
            "page":     page,
            "pageSize": pageSize,
        },
        TraceId: generateTraceId(),
    }
}
```

---

### 3.2 接口详细定义

#### 3.2.1 课程结构

```
GET /course
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "hua",
    "title": "一幅名扬中外的画",
    "stages": [
      { "id": "preview",  "name": "寻找文化", "order": 1, "taskCount": 3 },
      { "id": "warmup",   "name": "重温文化", "order": 2, "taskCount": 1 },
      { "id": "method",   "name": "宣传有法", "order": 3, "taskCount": 2 },
      { "id": "creation", "name": "宣传文化", "order": 4, "taskCount": 1 },
      { "id": "homework", "name": "传承文化", "order": 5, "taskCount": 1 }
    ]
  },
  "traceId": "abc123-def456-ghi789"
}
```

前端据此渲染 5 步进度条。

---

#### 3.2.2 环节详情

```
GET /stage/{stageId}
```

stageId: `preview` | `warmup` | `method` | `creation` | `homework`

**响应**（以 preview 为例）

```json
{
  "code": 0,
  "msg": "success",
  "data": {
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
            "allowPhoto": true
          }
        ],
        "retry": { "maxRetries": 3, "onExhausted": "reveal_and_end" },
        "feedbackOverlay": { "forced": true }
      },
      {
        "id": "ask-question",
        "type": "ask-question",
        "title": "提出问题",
        "digitalHumanPrompt": "你一定有很多启发吧...",
        "minQuestions": 1,
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
              { "id": "blank-1", "correctAnswer": "美观", "context": "围绕一个意思把一段话写清楚，一个意思指的是____" }
            ]
          }
        ],
        "retry": { "maxRetries": 2, "onExhausted": "reveal_answer" },
        "feedbackOverlay": { "forced": true }
      }
    ]
  },
  "traceId": "abc123-def456-ghi789"
}
```

`progress.currentTaskIndex` 指示当前做到第几个任务。

---

#### 3.2.3 写感想

```
POST /write
```

**请求**

```json
{
  "stageId": "preview",
  "taskId":  "write-thought",
  "textId":  "text-paper",
  "content": "我觉得造纸术...",
  "proudAspect": "创造力",
  "textConnection": "蔡伦改进技术",
  "lifeConnection": "现在有很多纸制品",
  "imageUrl": null
}
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "passed": true,
    "feedback": "你抓住了造纸术的核心...",
    "retryCount": 1,
    "retryExhausted": false,
    "correctAnswer": null,
    "nextAction": "next_text"
  },
  "traceId": "abc123-def456-ghi789"
}
```

**前端逻辑**：
- `passed=false` + `nextAction="retry"` → 显示 feedback，让学生修改（保留输入框可编辑）
- `retryExhausted=true` → 显示 correctAnswer（AI 给的答案），不可再编辑
- `nextAction="next_text"` → 自动翻到下一篇课文
- `nextAction="next_task"` → 调用 `/feedback/generate`，弹出强制反馈浮层，播完后跳到下一个任务

---

#### 3.2.4 提交问题

```
POST /question
```

**请求**

```json
{
  "stageId": "preview",
  "taskId": "ask-question",
  "content": "蔡伦为什么要改进造纸术？",
  "keywords": ["蔡伦", "改进造纸术"]
}
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "passed": true,
    "feedback": "你的问题很有深度...",
    "retryCount": 0,
    "retryExhausted": false,
    "relatedKeywords": ["造纸术起源", "传播影响"]
  },
  "traceId": "abc123-def456-ghi789"
}
```

**前端逻辑**：
- `passed=false` → 显示 feedback，让学生修改（保留输入框可编辑）
- `retryExhausted=true` → 显示 relatedKeywords 引导语，允许进入下一步
- 学生点击"提问结束"但未提问题 → 显示提示，要求至少提一个问题
- 学生点击"不再提问" → 进入小结转承

---

#### 3.2.5 逐格校验

```
POST /validate-blank
```

**请求**

```json
{
  "taskId":  "fill-blank",
  "textId":  "text-zhaozhouqiao",
  "blankId": "blank-1",
  "input":   "美观"
}
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "correct": true,
    "feedback": null,
    "retryCount": 0,
    "exhausted": false,
    "revealedAnswer": null
  },
  "traceId": "abc123-def456-ghi789"
}
```

**前端逻辑**：
- `correct=true` → 正确输入**填入**空格显示，该格锁定
- `correct=false` + `exhausted=false` → 显示 feedback，学生**重试**（输入框清空）
- `exhausted=true` → 显示 revealedAnswer 填入空格，该格锁定
- 所有空格 `correct` 或 `exhausted` → 翻到下一篇课文
- 所有课文完成 → 调用 `/feedback/generate`，弹强制反馈浮层

---

#### 3.2.6 方法练习（填空 / 文本输入）

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
  "code": 0,
  "msg": "success",
  "data": {
    "passed": true,
    "feedback": "正确！这句话就是全文的中心句。",
    "retryCount": 0,
    "retryExhausted": false,
    "correctAnswer": null
  },
  "traceId": "abc123-def456-ghi789"
}
```

**前端逻辑**：
- 三个练习项**不限顺序**，学生自由选择先做哪个
- `passed=false` → 显示 feedback，可重试
- `retryExhausted=true` → 显示 correctAnswer，该项锁定
- 全部完成 → 提交按钮高亮 → 调用 `/feedback/generate`

---

#### 3.2.7 朗读提交

```
POST /read-aloud
```

**请求**

```json
{
  "stageId": "method",
  "taskId":  "method-zhaozhouqiao",
  "itemId":  "item-2",
  "audioUrl": "https://...",
  "referenceText": "这座桥不但坚固，而且美观。桥面两侧有石栏..."
}
```

**响应** 同 `/practice`，统一使用 code/msg/data/traceId 结构。

---

#### 3.2.8 创作对话

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
  "code": 0,
  "msg": "success",
  "data": {
    "reply": "能具体说说你觉得哪里画得漂亮吗？",
    "retryCount": 0,
    "retryExhausted": false,
    "correctAnswer": null
  },
  "traceId": "abc123-def456-ghi789"
}
```

**前端逻辑**：
- 多轮对话，像聊天一样（气泡展示）
- `retryExhausted=true`（连续 3 次不达标）→ 显示 correctAnswer 引导语，允许进入下一步
- 对话自然结束（学生点"完成"或达到轮数上限）→ 调用 `/chat/polish`

---

#### 3.2.9 AI 批改对比

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
  "code": 0,
  "msg": "success",
  "data": {
    "original": "清明上河图画得很好看，街上有很多人。",
    "polished": "《清明上河图》描绘了北宋汴京的繁华景象——街市上人来人往，有的赶着毛驴，有的挑着担子，有的在茶馆里闲聊，栩栩如生，不愧为'名扬中外的画'。"
  },
  "traceId": "abc123-def456-ghi789"
}
```

**前端展示**：左右对照——"我的版本" vs "AI 润色版"。

---

#### 3.2.10 创作选择

```
POST /chat/creation
```

**请求**

```json
{
  "stageId": "creation",
  "taskId":  "creation",
  "action": "create",
  "optionId": "poster"
}
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "nextAction": "creation_page",
    "creationUrl": "/creation/poster?taskId=creation"
  },
  "traceId": "abc123-def456-ghi789"
}
```

`action=skip` 时返回 `{ "code": 0, "msg": "success", "data": { "nextAction": "next_task" }, "traceId": "abc123-def456-ghi789" }`，调 `/feedback/generate` 后结束。

---

#### 3.2.11 小组交流

```
POST /group/create
```

**请求**

```json
{
  "stageId": "creation",
  "taskId": "creation",
  "creationType": "poster",
  "memberIds": ["S2026001", "S2026002", "S2026003"]
}
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "groupId": "group-abc123",
    "members": ["S2026001", "S2026002", "S2026003"],
    "creationType": "poster"
  },
  "traceId": "abc123-def456-ghi789"
}
```

```
POST /message/send
```

**请求**

```json
{
  "groupId": "group-abc123",
  "content": "我是用手抄报宣传的...",
  "messageType": "text"
}
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "messageId": "msg-abc123",
    "content": "我是用手抄报宣传的...",
    "timestamp": "2026-07-24T10:30:00Z"
  },
  "traceId": "abc123-def456-ghi789"
}
```

```
POST /message/list
```

**请求**

```json
{
  "groupId": "group-abc123",
  "page": 1,
  "pageSize": 20
}
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "messages": [
      {
        "messageId": "msg-abc123",
        "senderId": "S2026001",
        "senderName": "张三",
        "content": "我是用手抄报宣传的...",
        "messageType": "text",
        "timestamp": "2026-07-24T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  },
  "traceId": "abc123-def456-ghi789"
}
```

---

#### 3.2.12 作业模块

```
POST /homework/recommend
```

**请求**

```json
{
  "stageId": "homework",
  "taskId": "homework"
}
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "level": "advanced",
    "title": "向外国小朋友宣传春节",
    "requiredTask": "写一段话，围绕一个意思把一段话写清楚",
    "optionalTasks": ["手抄报", "海报", "诗歌", "小剧本"],
    "scoreThreshold": 80
  },
  "traceId": "abc123-def456-ghi789"
}
```

```
POST /homework/submit
```

**请求**

```json
{
  "stageId": "homework",
  "taskId": "homework",
  "content": "春节是中国最重要的传统节日...",
  "creationType": "essay",
  "imageUrl": null
}
```

**响应** 同 `/practice`，统一使用 code/msg/data/traceId 结构。

---

#### 3.2.13 强制反馈

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
  "code": 0,
  "msg": "success",
  "data": {
    "type": "audio",
    "script": "你对三篇课文都有自己的思考，特别是对造纸术的理解很深。继续加油！",
    "durationMs": 10000
  },
  "traceId": "abc123-def456-ghi789"
}
```

**前端逻辑**：
- `type=audio` → 全屏浮层 + 播放 TTS 音频（10 秒），**不可关闭/跳过**
- `type=video` → 全屏浮层 + 播放视频（30 秒），**不可关闭/跳过**
- 播放完毕 → 浮层自动消失 → 进入下一个任务

---

#### 3.2.14 媒体上传

```
POST /media/upload
Content-Type: multipart/form-data
```

**请求**

| 字段 | 类型 | 说明 |
|------|------|------|
| file | File | png/jpg（图片）或 wav/mp3（音频），≤10MB |

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "url": "http://localhost:8080/uploads/abc123.png"
  },
  "traceId": "abc123-def456-ghi789"
}
```

拿到的 `url` 传给 `/write`（imageUrl）、`/read-aloud`（audioUrl）使用。

---

#### 3.2.15 勋章颁发

```
POST /badge/award
```

**请求**

```json
{
  "studentId": "S2026001",
  "badgeName": "宣传大使",
  "condition": "完成2种及以上宣传方式",
  "stageId": "creation"
}
```

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "success": true,
    "badgeName": "宣传大使",
    "awardTime": "2026-07-24T10:30:00Z",
    "condition": "完成2种及以上宣传方式"
  },
  "traceId": "abc123-def456-ghi789"
}
```

---

#### 3.2.16 教师看板

```
GET /dashboard/data
```

请求：Header: `X-Teacher-Id: {教师ID}`

**响应**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "participation": {
      "total": 48,
      "completed": 45,
      "rate": 0.9375
    },
    "correctness": {
      "total": 200,
      "correct": 174,
      "rate": 0.87
    },
    "wordCloud": [
      { "word": "智慧", "count": 42 },
      { "word": "创造力", "count": 38 },
      { "word": "精美", "count": 35 }
    ],
    "creationTypes": [
      { "type": "essay", "count": 21, "rate": 0.45 },
      { "type": "handcraft", "count": 14, "rate": 0.30 },
      { "type": "poster", "count": 7, "rate": 0.15 }
    ],
    "previewData": {
      "textConnection": 0.85,
      "lifeConnection": 0.72
    }
  },
  "traceId": "abc123-def456-ghi789"
}
```

#### 3.2.17 教师看板筛选【新增】

```
GET /dashboard/data/filter
```

请求：Header: `X-Teacher-Id: {教师ID}`

**请求参数**

| 参数 | 类型 | 说明 | 必填 |
|------|------|------|------|
| classId | string | 班级ID | 否 |
| startTime | string | 开始时间（YYYY-MM-DD HH:mm:ss） | 否 |
| endTime | string | 结束时间（YYYY-MM-DD HH:mm:ss） | 否 |
| stageId | string | 环节ID | 否 |

**响应**

同 `/dashboard/data`，返回筛选后的统计数据。

#### 3.2.18 教师看板导出【新增】

```
GET /dashboard/export
```

请求：Header: `X-Teacher-Id: {教师ID}`

**请求参数**

| 参数 | 类型 | 说明 | 必填 |
|------|------|------|------|
| classId | string | 班级ID | 否 |
| startTime | string | 开始时间（YYYY-MM-DD HH:mm:ss） | 否 |
| endTime | string | 结束时间（YYYY-MM-DD HH:mm:ss） | 否 |
| format | string | 导出格式：excel/csv | 是 |

**响应**

- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`（Excel）
- Content-Type: `text/csv`（CSV）
- Content-Disposition: `attachment; filename="dashboard_export_2026-07-24.xlsx"`

**导出报表结构**

| 工作表 | 内容 |
|--------|------|
| 概览 | 参与率、正确率、完成率等核心指标 |
| 学生明细 | 学生ID、姓名、得分、完成进度、各环节数据 |
| 词云数据 | 关键词、出现次数、占比 |
| 创作方式统计 | 创作类型、人数、占比 |
| 预习数据 | 课文关联率、生活实际关联率 |

---

### 3.3 WebSocket 消息协议【修正】

**连接地址**: `ws://localhost:8080/ws?studentId={studentId}`

**消息格式**:
```json
{
  "type": "message",
  "messageId": "msg-abc123",
  "payload": {
    "groupId": "group-abc123",
    "senderId": "S2026001",
    "content": "Hello",
    "timestamp": "2026-07-24T10:30:00Z"
  },
  "seq": 12345
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 消息类型 |
| messageId | string | 消息唯一ID，用于幂等去重 |
| payload | object | 消息内容 |
| seq | int | 消息序列号，用于排序和断线重连 |

**消息类型**:

| 类型 | 说明 |
|------|------|
| `message` | 普通消息 |
| `system` | 系统通知（如分组成功） |
| `countdown` | 倒计时更新 |
| `join` | 成员加入 |
| `leave` | 成员离开 |
| `heartbeat` | 心跳消息 |
| `reconnect` | 断线重连请求 |
| `sync` | 离线消息同步 |

#### 3.3.1 心跳机制

**心跳间隔**: 15秒

**客户端心跳**:
```json
{
  "type": "heartbeat",
  "messageId": "heartbeat-abc123",
  "payload": {
    "timestamp": "2026-07-24T10:30:00Z"
  },
  "seq": 12345
}
```

**服务端响应**:
```json
{
  "type": "heartbeat",
  "messageId": "heartbeat-abc123",
  "payload": {
    "timestamp": "2026-07-24T10:30:00Z"
  },
  "seq": 12346
}
```

**超时处理**:
- 客户端连续3次心跳无响应（45秒），触发断线重连
- 服务端连续3次心跳无响应（45秒），断开连接并清理会话

#### 3.3.2 断线指数退避重连

**重连策略**:

| 重连次数 | 等待时间 | 最大等待时间 |
|---------|---------|-------------|
| 第1次 | 2秒 | - |
| 第2次 | 4秒 | - |
| 第3次 | 8秒 | - |
| 第4次及以上 | 16秒 | 16秒 |

**重连请求**:
```json
{
  "type": "reconnect",
  "messageId": "reconnect-abc123",
  "payload": {
    "studentId": "S2026001",
    "lastSeq": 12345,
    "groupId": "group-abc123"
  },
  "seq": 0
}
```

**服务端响应**:
```json
{
  "type": "sync",
  "messageId": "sync-abc123",
  "payload": {
    "messages": [...],
    "lastSeq": 12350
  },
  "seq": 12350
}
```

#### 3.3.3 离线消息补发

**存储策略**:
- 服务端存储离线消息，保留最近100条
- 消息存储时间：24小时
- 使用 Redis List 存储每个学生的离线消息

**同步流程**:
1. 客户端发起重连请求，携带 `lastSeq`
2. 服务端查询 `lastSeq` 之后的所有消息
3. 服务端按序列号顺序返回离线消息
4. 客户端收到消息后，更新本地 `lastSeq`

#### 3.3.4 消息幂等去重

**去重策略**:
- 客户端发送消息时生成唯一 `messageId`
- 服务端收到消息后，先检查 `messageId` 是否已存在
- 已存在则直接返回成功，不重复处理
- 使用 Redis Set 存储已处理的 `messageId`，过期时间5分钟

**客户端实现**:
```typescript
// 消息去重存储
const processedMessageIds = new Set<string>();

// 发送消息前检查
function sendMessage(message: Message) {
  if (processedMessageIds.has(message.messageId)) {
    return; // 已处理，跳过
  }
  
  // 发送消息
  ws.send(JSON.stringify(message));
  
  // 记录已发送
  processedMessageIds.add(message.messageId);
  
  // 5分钟后清除记录
  setTimeout(() => {
    processedMessageIds.delete(message.messageId);
  }, 5 * 60 * 1000);
}
```

**服务端实现**:
```go
// 消息去重
func isMessageProcessed(messageId string) bool {
    key := fmt.Sprintf("msg:%s", messageId)
    exists, _ := redisClient.Exists(key).Result()
    if exists > 0 {
        return true
    }
    
    // 设置5分钟过期
    redisClient.Set(key, "1", 5*time.Minute)
    return false
}
```

---

### 3.4 错误码【修正】

#### 3.4.1 错误码清单

| HTTP | code | 业务码 | 说明 | 前端友好提示 |
|------|------|--------|------|-------------|
| 400 | `INVALID_PARAMS` | 40001 | 缺少必填字段 | "请填写完整信息哦~" |
| 400 | `INVALID_PARAMS` | 40002 | 参数格式错误 | "输入格式不正确，请检查后重试" |
| 400 | `INVALID_PARAMS` | 40003 | 参数值无效 | "输入内容无效，请重新输入" |
| 401 | `UNAUTHORIZED` | 40101 | 未授权 | "请先登录哦~" |
| 401 | `UNAUTHORIZED` | 40102 | Token过期 | "登录已过期，请重新登录" |
| 401 | `UNAUTHORIZED` | 40103 | Token无效 | "登录信息无效，请重新登录" |
| 403 | `FORBIDDEN` | 40301 | 权限不足 | "你没有权限访问这个功能哦~" |
| 403 | `FORBIDDEN` | 40302 | 设备未绑定 | "请先绑定设备" |
| 404 | `NOT_FOUND` | 40401 | stageId不存在 | "环节不存在，请联系老师" |
| 404 | `NOT_FOUND` | 40402 | taskId不存在 | "任务不存在，请联系老师" |
| 404 | `NOT_FOUND` | 40403 | textId不存在 | "课文不存在，请联系老师" |
| 422 | `EMPTY_INPUT` | 42201 | 提交内容为空 | "请先输入内容哦~" |
| 422 | `EMPTY_INPUT` | 42202 | 感想内容为空 | "请写下你的感想~" |
| 422 | `EMPTY_INPUT` | 42203 | 问题内容为空 | "请提出你的问题~" |
| 422 | `GARBLED_INPUT` | 42210 | 无法识别 | "内容无法识别，请重新输入" |
| 422 | `GARBLED_INPUT` | 42211 | 语音识别失败 | "语音识别失败，请重试或切换文字输入" |
| 422 | `SENSITIVE_CONTENT` | 42220 | 违规内容 | "请输入文明用语哦~" |
| 422 | `SENSITIVE_CONTENT` | 42221 | 包含敏感词 | "输入内容包含敏感词，请修改后重试" |
| 429 | `RATE_LIMITED` | 42901 | 请求限流 | "操作太频繁啦，请休息一下~" |
| 429 | `RATE_LIMITED` | 42902 | AI接口限流 | "AI正在忙碌中，请稍后再试" |
| 500 | `INTERNAL_ERROR` | 50001 | 服务器错误 | "服务器开小差了，请稍后再试" |
| 500 | `INTERNAL_ERROR` | 50002 | 数据库错误 | "数据加载失败，请稍后再试" |
| 500 | `INTERNAL_ERROR` | 50003 | AI服务错误 | "AI服务暂时不可用，请稍后再试" |
| 500 | `INTERNAL_ERROR` | 50004 | 存储服务错误 | "文件上传失败，请稍后再试" |

#### 3.4.2 错误响应格式

```json
{
  "code": 40001,
  "msg": "缺少必填字段",
  "data": null,
  "traceId": "abc123-def456-ghi789"
}
```

#### 3.4.3 前端错误处理规范

```typescript
// 错误处理映射
const errorMessages: Record<number, string> = {
  40001: '请填写完整信息哦~',
  40002: '输入格式不正确，请检查后重试',
  40101: '请先登录哦~',
  40102: '登录已过期，请重新登录',
  42201: '请先输入内容哦~',
  42220: '请输入文明用语哦~',
  42901: '操作太频繁啦，请休息一下~',
  50001: '服务器开小差了，请稍后再试'
};

// 通用错误处理函数
function handleError(error: Response) {
  const message = errorMessages[error.code] || error.msg || '发生错误，请稍后再试';
  
  // 显示Toast提示
  showToast(message);
  
  // 特殊处理
  if (error.code === 40101 || error.code === 40102) {
    // 跳转到登录页
    router.push('/login');
  }
  
  if (error.code === 50003) {
    // AI服务降级处理
    useAIDegradation();
  }
}
```

---

### 3.5 前端典型调用流程

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
  ├─ 任务二：提出问题
  │    └─ POST /question (×N个)     → 每提一个问题后根据反馈修改
  │    └─ POST /feedback/generate   → 强制反馈浮层
  │
  ├─ 任务三：初步感悟
  │    └─ POST /validate-blank (×N格) → 逐格实时校验
  │    └─ POST /feedback/generate   → 强制反馈浮层
  │
  ├─ ... 后续环节类似 ...
  │
  └─ 宣传文化
       ├─ POST /chat (×N轮)         → 多轮对话
       ├─ POST /chat/polish         → AI 批改对比
       ├─ POST /chat/creation       → 选创作方式 或 跳过
       ├─ POST /group/create        → 创建临时小组
       ├─ POST /message/send        → 小组交流
       └─ POST /feedback/generate   → 强制反馈浮层
```

---

## 四、数据库表设计

### 4.1 基础表

#### 4.1.1 users（用户表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 用户ID |
| student_id | VARCHAR(50) | UNIQUE NOT NULL | 学号 |
| name | VARCHAR(100) | NOT NULL | 姓名 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| score | INT | DEFAULT 0 | 得分 |
| device_id | VARCHAR(100) | | 绑定设备ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### 4.1.2 progress（进度表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 进度ID |
| student_id | VARCHAR(50) | NOT NULL | 学号 |
| stage_id | VARCHAR(50) | NOT NULL | 环节ID |
| task_id | VARCHAR(50) | NOT NULL | 任务ID |
| current_task_index | INT | DEFAULT 0 | 当前任务索引 |
| completed_task_ids | TEXT[] | DEFAULT '{}' | 已完成任务ID列表 |
| status | VARCHAR(20) | DEFAULT 'in_progress' | 状态：not_started/in_progress/completed |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### 4.1.3 answers（答题记录表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 答题记录ID |
| student_id | VARCHAR(50) | NOT NULL | 学号 |
| stage_id | VARCHAR(50) | NOT NULL | 环节ID |
| task_id | VARCHAR(50) | NOT NULL | 任务ID |
| text_id | VARCHAR(50) | | 课文ID |
| blank_id | VARCHAR(50) | | 空格ID |
| input | TEXT | NOT NULL | 学生输入 |
| correct | BOOLEAN | DEFAULT FALSE | 是否正确 |
| retry_count | INT | DEFAULT 0 | 重试次数 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

#### 4.1.4 homework（作业表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 作业ID |
| student_id | VARCHAR(50) | NOT NULL | 学号 |
| stage_id | VARCHAR(50) | NOT NULL | 环节ID |
| task_id | VARCHAR(50) | NOT NULL | 任务ID |
| content | TEXT | NOT NULL | 作业内容 |
| creation_type | VARCHAR(50) | NOT NULL | 创作类型 |
| image_url | VARCHAR(255) | | 图片URL |
| passed | BOOLEAN | DEFAULT FALSE | 是否通过 |
| feedback | TEXT | | 反馈内容 |
| score | INT | | 得分 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

### 4.2 核心业务表

#### 4.2.1 thoughts（学生感想表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 感想ID |
| student_id | VARCHAR(50) | NOT NULL | 学号 |
| stage_id | VARCHAR(50) | NOT NULL | 环节ID |
| task_id | VARCHAR(50) | NOT NULL | 任务ID |
| text_id | VARCHAR(50) | NOT NULL | 课文ID |
| proud_aspect | VARCHAR(100) | NOT NULL | 自豪方面关键词 |
| text_connection | TEXT | | 联系课文内容 |
| life_connection | TEXT | | 联系生活实际 |
| content | TEXT | NOT NULL | 感想内容 |
| image_url | VARCHAR(255) | | 拍照上传URL |
| passed | BOOLEAN | DEFAULT FALSE | 是否通过 |
| feedback | TEXT | | 反馈内容 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

#### 4.2.2 questions（问题表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 问题ID |
| student_id | VARCHAR(50) | NOT NULL | 学号 |
| stage_id | VARCHAR(50) | NOT NULL | 环节ID |
| task_id | VARCHAR(50) | NOT NULL | 任务ID |
| content | TEXT | NOT NULL | 问题内容 |
| keywords | TEXT[] | | 关键词列表 |
| is_related | BOOLEAN | DEFAULT TRUE | 是否与课文相关 |
| passed | BOOLEAN | DEFAULT FALSE | 是否通过 |
| feedback | TEXT | | 反馈内容 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

#### 4.2.3 groups（小组表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 小组ID |
| stage_id | VARCHAR(50) | NOT NULL | 环节ID |
| task_id | VARCHAR(50) | NOT NULL | 任务ID |
| creation_type | VARCHAR(50) | NOT NULL | 创作类型 |
| member_ids | TEXT[] | NOT NULL | 成员ID列表 |
| leader_id | VARCHAR(50) | | 组长ID |
| status | VARCHAR(20) | DEFAULT 'active' | 状态：active/finished |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### 4.2.4 messages（消息表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 消息ID |
| group_id | VARCHAR(50) | NOT NULL | 小组ID |
| sender_id | VARCHAR(50) | NOT NULL | 发送者ID |
| content | TEXT | NOT NULL | 消息内容 |
| message_type | VARCHAR(20) | DEFAULT 'text' | 消息类型：text/voice/system |
| audio_url | VARCHAR(255) | | 语音URL |
| timestamp | TIMESTAMP | DEFAULT NOW() | 发送时间 |

#### 4.2.5 badges（勋章表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 勋章ID |
| student_id | VARCHAR(50) | NOT NULL | 学号 |
| badge_name | VARCHAR(100) | NOT NULL | 勋章名称 |
| condition | TEXT | NOT NULL | 获得条件 |
| stage_id | VARCHAR(50) | | 关联环节ID |
| award_time | TIMESTAMP | DEFAULT NOW() | 颁发时间 |

### 4.3 索引设计

| 表名 | 索引字段 | 索引类型 | 说明 |
|------|---------|---------|------|
| users | student_id | UNIQUE | 学号唯一索引 |
| progress | student_id, stage_id | COMPOSITE | 学生进度查询 |
| answers | student_id, task_id | COMPOSITE | 学生答题记录 |
| thoughts | student_id, text_id | COMPOSITE | 学生感想查询 |
| questions | student_id | INDEX | 学生问题查询 |
| groups | member_ids | GIN | 成员查询 |
| messages | group_id, timestamp | COMPOSITE | 消息列表查询 |
| badges | student_id | INDEX | 学生勋章查询 |

### 4.4 Redis 缓存设计

| Key | 类型 | 说明 | 过期时间 |
|-----|------|------|---------|
| `student:{student_id}` | Hash | 用户信息 | 24h |
| `progress:{student_id}` | Hash | 学习进度 | 1h |
| `stage:{stage_id}` | String | 环节配置 | 30min |
| `hot_words` | ZSet | 热门关键词 | 1h |
| `group:{group_id}` | Hash | 小组信息 | 30min |
| `online_users` | Set | 在线用户 | 5min |

### 4.5 缓存一致性策略【新增】

#### 4.5.1 数据更新策略
- **主动删除**：数据更新后立即删除对应 Redis Key，下次读取时从数据库加载并重新缓存
- **延迟双删**：先删除缓存，再更新数据库，等待100ms后再次删除缓存（防止并发问题）
- **空值缓存**：查询结果为空时，缓存空值并设置5min过期时间，防止缓存击穿

#### 4.5.2 缓存Key管理
- **命名规范**：`{业务模块}:{主键}`（如 `student:S2026001`）
- **批量删除**：使用 Lua 脚本批量删除相关缓存 Key
- **缓存预热**：服务启动时预加载高频访问数据（如环节配置、用户信息）

#### 4.5.3 缓存穿透防护
- **布隆过滤器**：对不存在的 student_id、stage_id 进行过滤
- **请求限流**：对单个 IP 频繁查询不存在数据进行限流

### 4.6 事务规范【新增】

#### 4.6.1 事务使用场景
- **多表原子操作**：用户注册（插入用户+初始化进度+创建默认作业）
- **任务完成**：更新进度+颁发勋章+记录得分
- **数据迁移**：归档旧数据时保证源表和目标表数据一致性

#### 4.6.2 事务实现规范
- **开启事务**：使用 `db.Begin()` 创建事务对象
- **执行操作**：在事务对象上执行 `Exec()`、`Query()` 等操作
- **提交事务**：所有操作成功后调用 `Commit()`
- **回滚事务**：任何操作失败调用 `Rollback()`，记录错误日志

#### 4.6.3 事务示例
```go
tx, err := db.Begin()
if err != nil {
    return err
}

defer func() {
    if r := recover(); r != nil {
        tx.Rollback()
    }
}()

// 操作1：更新进度
_, err = tx.Exec("UPDATE progress SET status = $1 WHERE student_id = $2", "completed", studentID)
if err != nil {
    tx.Rollback()
    return err
}

// 操作2：颁发勋章
_, err = tx.Exec("INSERT INTO badges (student_id, badge_name, condition) VALUES ($1, $2, $3)", 
    studentID, "宣传大使", "完成2种及以上宣传方式")
if err != nil {
    tx.Rollback()
    return err
}

// 操作3：更新得分
_, err = tx.Exec("UPDATE users SET score = score + $1 WHERE student_id = $2", 10, studentID)
if err != nil {
    tx.Rollback()
    return err
}

return tx.Commit()
```

### 4.7 冷热数据归档【新增】

#### 4.7.1 归档策略
- **归档时机**：数据超过30天自动归档到历史表
- **归档频率**：每天凌晨2点执行定时任务
- **归档表命名**：原表名 + `_history`（如 `answers_history`）

#### 4.7.2 归档表结构
- 与原表结构一致，新增 `archived_at` 字段记录归档时间
- 归档后原表数据保留最近30天记录

#### 4.7.3 归档脚本示例
```sql
-- 创建历史表（首次执行）
CREATE TABLE answers_history (
    LIKE answers INCLUDING ALL,
    archived_at TIMESTAMP DEFAULT NOW()
);

-- 归档数据（每天执行）
INSERT INTO answers_history 
SELECT *, NOW() 
FROM answers 
WHERE created_at < NOW() - INTERVAL '30 days';

-- 删除已归档数据
DELETE FROM answers 
WHERE created_at < NOW() - INTERVAL '30 days';
```

#### 4.7.4 查询策略
- **普通查询**：直接查询原表
- **历史查询**：查询历史表，需指定时间范围
- **联合查询**：如需跨30天数据，使用 `UNION ALL` 合并原表和历史表

---

## 五、工程目录结构

### 5.1 整体目录

```
语文课堂/
├── front/              # 课程包前端
├── back/               # 课程包后端
├── openapi/            # API契约同步
├── assets/             # 全局多媒体资源
├── docs/               # 规范、设计文档
├── scripts/            # 自动化脚本
└── storage/            # 存储配置
```

### 5.2 front 目录

```
front/
├── public/             # 不打包静态资源
│   ├── background/     # 背景大图
│   ├── avatar/         # 数字人透明视频
│   └── audio/          # 校歌音频
├── src/
│   ├── api/            # OpenAPI自动生成接口
│   ├── assets/         # 页面小图标、局部样式
│   ├── components/     # 组件目录
│   │   ├── base/              # 基础组件（通用、无业务逻辑）
│   │   │   ├── Button.vue         # 按钮组件
│   │   │   ├── Input.vue          # 输入框组件
│   │   │   ├── Textarea.vue       # 文本域组件
│   │   │   ├── ProgressBar.vue    # 进度条组件
│   │   │   ├── Dialog.vue         # 弹窗组件
│   │   │   ├── Toast.vue          # 提示组件
│   │   │   ├── Loading.vue        # 加载组件
│   │   │   └── Empty.vue          # 空状态组件
│   │   └── business/          # 业务组件（含业务逻辑）
│   │       ├── DigitalHuman.vue   # 数字人弹窗（含视频播放、AI交互）
│   │       ├── AnswerBox.vue      # 答题框（含答题校验逻辑）
│   │       ├── WordCloud.vue      # 看板词云（含数据渲染逻辑）
│   │       ├── ChatRoom.vue       # 聊天室组件（含WebSocket通信）
│   │       ├── GroupCard.vue      # 小组卡片（含成员展示）
│   │       ├── BadgeDisplay.vue   # 勋章展示（含勋章获取逻辑）
│   │       └── FeedbackOverlay.vue # 强制反馈浮层（含音频播放）
│   ├── composables/    # 复用逻辑
│   │   ├── useAnswer.ts        # 答题校验
│   │   ├── useAI.ts            # AI对话
│   │   ├── useVideo.ts         # 视频播放
│   │   └── useWebSocket.ts     # WebSocket连接
│   ├── stores/         # Pinia状态管理
│   │   ├── progress.ts         # 学习进度
│   │   ├── score.ts            # 得分
│   │   └── user.ts             # 用户数据
│   ├── views/          # 页面组件
│   │   ├── Login.vue           # 登录页
│   │   ├── Home.vue            # 首页
│   │   ├── Preview.vue         # 寻找文化页
│   │   ├── Warmup.vue          # 重温文化页
│   │   ├── Method.vue          # 宣传有法页
│   │   ├── Creation.vue        # 宣传文化页
│   │   ├── ChatRoom.vue        # 聊天室页
│   │   ├── Homework.vue        # 传承文化页
│   │   ├── Profile.vue         # 个人中心页
│   │   └── Dashboard.vue       # 教师看板页
│   ├── router/         # 路由配置
│   │   └── index.ts
│   ├── utils/          # 工具函数
│   │   ├── audio.ts            # 音频控制
│   │   ├── date.ts             # 日期格式化
│   │   └── calculation.ts      # 数据计算
│   ├── types/          # TypeScript类型
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .gitignore
```

### 5.3 back 目录

```
back/
├── cmd/
│   └── api/            # 服务启动入口
│       └── main.go
├── internal/
│   ├── handler/        # 接口控制器
│   │   ├── auth.go             # 认证接口
│   │   ├── course.go           # 课程接口
│   │   ├── preview.go          # 预习接口
│   │   ├── method.go           # 方法练习接口
│   │   ├── creation.go         # 创作接口
│   │   ├── group.go            # 小组接口
│   │   ├── message.go          # 消息接口
│   │   ├── homework.go         # 作业接口
│   │   ├── feedback.go         # 反馈接口
│   │   ├── media.go            # 媒体上传接口
│   │   ├── badge.go            # 勋章接口
│   │   └── dashboard.go        # 看板接口
│   ├── service/        # 业务层
│   │   ├── auth.go             # 认证服务
│   │   ├── progress.go         # 进度服务
│   │   ├── ai.go               # AI服务
│   │   ├── group.go            # 小组服务
│   │   ├── message.go          # 消息服务
│   │   └── dashboard.go        # 看板服务
│   ├── repository/     # 数据库读写
│   │   ├── user.go             # 用户仓储
│   │   ├── progress.go         # 进度仓储
│   │   ├── answer.go           # 答题仓储
│   │   ├── thought.go          # 感想仓储
│   │   ├── question.go         # 问题仓储
│   │   ├── group.go            # 小组仓储
│   │   ├── message.go          # 消息仓储
│   │   ├── badge.go            # 勋章仓储
│   │   └── homework.go         # 作业仓储
│   └── agent/          # SubAgent调度
│       ├── luolu.go            # 罗罗答疑
│       ├── xiaoxiao.go         # 小小助教
│       ├──学情.go              # 学情统计
│       ├── media.go            # 素材匹配
│       └── homework.go         # 分层作业
├── model/              # 数据模型
│   ├── user.go
│   ├── progress.go
│   ├── answer.go
│   ├── thought.go
│   ├── question.go
│   ├── group.go
│   ├── message.go
│   ├── badge.go
│   ├── homework.go
│   └── response.go
├── pkg/                # 公共工具
│   ├── tts.go                  # TTS服务
│   ├── upload.go               # 文件上传
│   ├── wordcloud.go            # 词云生成
│   ├── coze.go                 # Coze API代理
│   └── websocket.go            # WebSocket管理
├── config/             # 配置文件
│   ├── config.go
│   ├── database.yaml
│   ├── coze.yaml
│   ├── redis.yaml
│   └── openapi.yaml
├── go.mod
└── go.sum
```

### 5.4 openapi 目录

```
openapi/
├── spec/
│   ├── auth.yaml               # 认证接口
│   ├── course.yaml             # 课程接口
│   ├── preview.yaml            # 预习接口
│   ├── method.yaml             # 方法练习接口
│   ├── creation.yaml           # 创作接口
│   ├── group.yaml              # 小组接口
│   ├── message.yaml            # 消息接口
│   ├── homework.yaml           # 作业接口
│   ├── feedback.yaml           # 反馈接口
│   ├── media.yaml              # 媒体接口
│   ├── badge.yaml              # 勋章接口
│   └── dashboard.yaml          # 看板接口
├── gen/
│   ├── front/                  # 生成前端代码
│   └── back/                   # 生成后端结构体
└── generate.sh                  # 一键生成脚本
```

### 5.5 assets 目录

```
assets/
├── avatar/
│   ├── luolu/                  # 罗罗视频、配音
│   ├── xiaoxiao/               # 小小视频、配音
│   └── foreign/                # 伊森、米娅视频
├── lesson-video/               # 课文动画
│   ├── paper-invention.mp4     # 造纸术动画
│   ├── zhaozhouqiao.mp4        # 赵州桥动画
│   └── qingming-river.mp4      # 清明上河图动画
├── background/                 # 背景图
│   ├── home.jpg
│   └── classroom.jpg
└── audio/                      # 音频
    ├── school-song.mp3         # 校歌
    └── bgm.mp3                 # 背景音乐
```

### 5.6 storage 目录

```
storage/
├── sql/
│   ├── init.sql                # 数据库初始化
│   ├── users.sql               # 用户表
│   ├── progress.sql            # 进度表
│   ├── answers.sql             # 答题记录表
│   ├── homework.sql            # 作业表
│   ├── thoughts.sql            # 感想表
│   ├── questions.sql           # 问题表
│   ├── groups.sql              # 小组表
│   ├── messages.sql            # 消息表
│   └── badges.sql              # 勋章表
├── redis.md                    # Redis缓存设计
└── oss-config.md               # 对象存储配置（待定）
```

---

## 六、部署步骤

### 6.1 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Go | 1.22+ | 后端语言 |
| Vue | 3.4+ | 前端框架 |
| TypeScript | 5.0+ | 前端类型 |
| PostgreSQL | 15+ | 数据库 |
| Redis | 7.0+ | 缓存 |
| Docker | 24.0+ | 容器化 |
| Kubernetes | 1.28+ | 容器编排 |

### 6.2 开发环境部署

#### 6.2.1 后端启动

```bash
# 进入后端目录
cd back

# 安装依赖
go mod download

# 启动服务（开发模式）
go run cmd/api/main.go
```

服务启动后访问：`http://localhost:8080`

#### 6.2.2 前端启动

```bash
# 进入前端目录
cd front

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

服务启动后访问：`http://localhost:5173`

#### 6.2.3 数据库初始化

```bash
# 创建数据库
createdb -U postgres yuwen_kecheng

# 执行初始化脚本
psql -U postgres -d yuwen_kecheng -f storage/sql/init.sql
```

### 6.3 容器化部署

#### 6.3.1 Dockerfile

**后端 Dockerfile** (`back/Dockerfile`)：
```dockerfile
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o api cmd/api/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/api .

EXPOSE 8080
CMD ["./api"]
```

**前端 Dockerfile** (`front/Dockerfile`)：
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Nginx 配置** (`front/nginx.conf`)：
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws/ {
        proxy_pass http://backend:8080/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /uploads/ {
        proxy_pass http://backend:8080/uploads/;
    }
}
```

#### 6.3.2 Docker Compose（开发/测试环境）

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: yuwen_kecheng
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./back
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/yuwen_kecheng
      REDIS_URL: redis://redis:6379
      COZE_API_KEY: ${COZE_API_KEY}
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./front
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

启动命令：
```bash
docker-compose up -d
```

#### 6.3.3 Kubernetes 部署（生产环境）

**后端 Deployment** (`k8s/backend-deployment.yaml`)：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: registry.example.com/yuwen-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          value: redis://redis:6379
        resources:
          requests:
            cpu: "100m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
```

**前端 Deployment** (`k8s/frontend-deployment.yaml`)：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: registry.example.com/yuwen-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "300m"
            memory: "256Mi"
```

**Service 配置** (`k8s/services.yaml`)：
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP

---

apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

**Ingress 配置** (`k8s/ingress.yaml`)：
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: yuwen-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: yuwen.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8080
      - path: /ws
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

### 6.4 环境配置

#### 6.4.1 开发环境 (`back/config/database.yaml`)：
```yaml
database:
  host: localhost
  port: 5432
  name: yuwen_kecheng
  user: postgres
  password: password

redis:
  host: localhost
  port: 6379
```

#### 6.4.2 测试环境：
使用 Docker Compose 中的数据库配置，通过环境变量注入。

#### 6.4.3 生产环境：
使用云数据库服务，配置通过 Kubernetes Secret 注入。

### 6.5 对象存储配置（待定）

对象存储服务商待定，预留配置接口：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| STORAGE_TYPE | 存储类型 | oss/cos/local |
| STORAGE_ENDPOINT | 存储服务地址 | oss-cn-shenzhen.aliyuncs.com |
| STORAGE_ACCESS_KEY | 访问密钥 | xxx |
| STORAGE_SECRET_KEY | 秘密密钥 | xxx |
| STORAGE_BUCKET | Bucket名称 | yuwen-kecheng |

### 6.6 安全配置

#### 6.6.1 CORS 配置

后端允许的来源：
- `http://localhost:5173`（前端开发）
- `http://localhost:5174`（备用端口）
- `http://localhost:3000`（其他开发环境）
- `https://yuwen.example.com`（生产环境）

#### 6.6.2 接口限流

使用 Gin 中间件实现限流：
- 普通接口：100次/分钟/IP
- AI接口：10次/分钟/IP
- 上传接口：5次/分钟/IP

#### 6.6.3 SQL 注入防护

使用 Go 的 `database/sql` 预编译语句，禁止拼接 SQL。

#### 6.6.4 XSS 防护

前端使用 Vue 的模板语法自动转义，后端对用户输入进行 HTML 转义。

### 6.7 日志和监控

#### 6.7.1 日志配置

后端使用 Zap 日志库，日志级别：
- 开发环境：DEBUG
- 测试环境：INFO
- 生产环境：WARN

#### 6.7.2 监控配置

使用 Prometheus 采集指标：
- API 请求次数
- 响应时间
- 错误率
- 数据库连接数
- Redis 缓存命中率

使用 Grafana 展示监控面板。

#### 6.7.3 告警配置

基于 Prometheus Alertmanager 配置告警：
- API 错误率 > 5%
- 响应时间 > 500ms
- 数据库连接数 > 90%

### 6.8 CI/CD 流水线规范【新增】

#### 6.8.1 流水线架构

```
代码提交 → 代码校验 → 构建镜像 → 部署测试 → 部署生产 → 版本回滚
```

#### 6.8.2 代码校验阶段

**前端校验**：
```bash
# 进入前端目录
cd front

# 安装依赖
npm install

# TypeScript类型检查
npm run typecheck

# ESLint检查
npm run lint

# 单元测试
npm run test
```

**后端校验**：
```bash
# 进入后端目录
cd back

# 格式化检查
gofmt -l .

# 静态分析
golangci-lint run

# 单元测试
go test ./... -v
```

#### 6.8.3 镜像构建阶段

**前端镜像构建**：
```bash
docker build -t registry.example.com/yuwen-frontend:${VERSION} ./front
docker push registry.example.com/yuwen-frontend:${VERSION}
```

**后端镜像构建**：
```bash
docker build -t registry.example.com/yuwen-backend:${VERSION} ./back
docker push registry.example.com/yuwen-backend:${VERSION}
```

**镜像标签规范**：
- 开发环境：`dev-${COMMIT_HASH}`
- 测试环境：`test-${VERSION}`
- 生产环境：`${VERSION}`（如 `v1.2.0`）

#### 6.8.4 环境发布阶段

**测试环境发布**：
```bash
# 更新 Deployment 镜像版本
kubectl set image deployment/frontend frontend=registry.example.com/yuwen-frontend:${VERSION}
kubectl set image deployment/backend backend=registry.example.com/yuwen-backend:${VERSION}

# 等待部署完成
kubectl rollout status deployment/frontend
kubectl rollout status deployment/backend

# 运行集成测试
npm run e2e
```

**生产环境发布**：
```bash
# 金丝雀发布：先更新10%实例
kubectl set image deployment/frontend frontend=registry.example.com/yuwen-frontend:${VERSION} --record
kubectl scale deployment/frontend --replicas=3

# 等待5分钟观察
sleep 300

# 全量发布
kubectl set image deployment/backend backend=registry.example.com/yuwen-backend:${VERSION} --record
```

#### 6.8.5 版本回滚

```bash
# 查看部署历史
kubectl rollout history deployment/frontend

# 回滚到上一个版本
kubectl rollout undo deployment/frontend

# 回滚到指定版本
kubectl rollout undo deployment/frontend --to-revision=3
```

### 6.9 对象存储抽象层代码规范【新增】

#### 6.9.1 统一 Storage 接口

```go
// Storage 接口定义
type Storage interface {
    // 上传文件
    UploadFile(key string, file []byte, contentType string) (string, error)
    
    // 下载文件
    DownloadFile(key string) ([]byte, error)
    
    // 删除文件
    DeleteFile(key string) error
    
    // 获取文件URL
    GetFileURL(key string) (string, error)
    
    // 检查文件是否存在
    FileExists(key string) (bool, error)
}
```

#### 6.9.2 实现类

```go
// OSS实现
type OSSStorage struct {
    client     *oss.Client
    bucketName string
}

// COS实现
type COSStorage struct {
    client     *cos.Client
    bucketName string
}

// 本地存储实现
type LocalStorage struct {
    basePath string
}
```

#### 6.9.3 工厂模式创建

```go
// StorageType 存储类型
type StorageType string

const (
    StorageTypeOSS   StorageType = "oss"
    StorageTypeCOS   StorageType = "cos"
    StorageTypeLocal StorageType = "local"
)

// NewStorage 创建存储实例
func NewStorage(storageType StorageType, config map[string]string) (Storage, error) {
    switch storageType {
    case StorageTypeOSS:
        return NewOSSStorage(config)
    case StorageTypeCOS:
        return NewCOSStorage(config)
    case StorageTypeLocal:
        return NewLocalStorage(config)
    default:
        return nil, fmt.Errorf("unsupported storage type: %s", storageType)
    }
}
```

#### 6.9.4 配置示例

```yaml
# config/storage.yaml
storage:
  type: oss
  oss:
    endpoint: oss-cn-shenzhen.aliyuncs.com
    access_key: xxx
    secret_key: xxx
    bucket: yuwen-kecheng
  cos:
    endpoint: cos.ap-guangzhou.myqcloud.com
    access_key: xxx
    secret_key: xxx
    bucket: yuwen-kecheng
  local:
    base_path: ./uploads
```

### 6.10 告警与日志规范【新增】

#### 6.10.1 告警三级分级规则

| 级别 | 名称 | 触发条件 | 响应时间 | 推送渠道 |
|------|------|---------|---------|---------|
| P0 | 紧急 | 服务不可用、数据库连接失败、API错误率>10% | 5分钟 | 电话+短信+钉钉 |
| P1 | 重要 | API错误率>5%、响应时间>500ms持续5分钟、数据库连接数>90% | 15分钟 | 钉钉+邮件 |
| P2 | 警告 | API错误率>3%、响应时间>300ms持续10分钟、缓存命中率<80% | 30分钟 | 邮件 |

#### 6.10.2 推送渠道配置

**钉钉机器人配置**：
```yaml
alerting:
  dingtalk:
    webhook: https://oapi.dingtalk.com/robot/send?access_token=xxx
    secret: xxx
    mention_all: true
```

**邮件配置**：
```yaml
alerting:
  email:
    smtp_host: smtp.example.com
    smtp_port: 587
    username: alert@example.com
    password: xxx
    recipients:
      - admin@example.com
      - dev@example.com
```

#### 6.10.3 日志冷热分层存储策略

**热日志（最近7天）**：
- 存储位置：本地磁盘
- 日志级别：DEBUG + INFO + WARN + ERROR
- 保留时间：7天
- 用途：实时排查问题

**温日志（7-30天）**：
- 存储位置：对象存储
- 日志级别：INFO + WARN + ERROR
- 保留时间：30天
- 用途：近期问题回溯

**冷日志（30天以上）**：
- 存储位置：归档存储（如阿里云OSS归档存储）
- 日志级别：WARN + ERROR
- 保留时间：3年
- 用途：合规审计、长期数据分析

**日志轮转配置**：
```yaml
logging:
  rotation:
    max_size: 100MB      # 单文件最大大小
    max_backups: 3       # 保留备份数
    max_age: 7           # 本地保留天数
    compress: true       # 是否压缩
```

---

## 附录

### A. 数字人视频规范【修正】

| 项目 | 要求 |
|------|------|
| 格式 | MP4 |
| 分辨率 | 720p (1280×720) |
| 帧率 | 30fps |
| 编码 | H.264 |
| 音频 | AAC 48kHz |
| 背景 | 绿幕（#00FF00 纯绿色） |

#### A.1 前端 JS 抠图实现方案

**方案概述**：使用 Canvas 实时绿幕抠图，不依赖浏览器原生绿幕滤镜（兼容性差）。

**实现步骤**：
1. 将视频帧绘制到 Canvas
2. 获取像素数据
3. 遍历像素，将绿色像素替换为透明
4. 绘制到目标 Canvas

**核心代码示例**：

```typescript
// 绿幕颜色阈值配置
const GREEN_THRESHOLD = {
  r: 60,    // 红色通道阈值
  g: 180,   // 绿色通道阈值
  b: 60,    // 蓝色通道阈值
  tolerance: 50 // 容差范围
};

/**
 * 绿幕抠图处理
 * @param sourceCanvas - 源Canvas（包含绿幕视频帧）
 * @param targetCanvas - 目标Canvas（输出透明背景）
 */
function processGreenScreen(sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement): void {
  const ctx = sourceCanvas.getContext('2d');
  const targetCtx = targetCanvas.getContext('2d');
  
  if (!ctx || !targetCtx) return;
  
  const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const data = imageData.data;
  
  // 遍历每个像素
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // 判断是否为绿色背景
    const isGreen = 
      g > GREEN_THRESHOLD.g &&
      Math.abs(r - GREEN_THRESHOLD.r) < GREEN_THRESHOLD.tolerance &&
      Math.abs(b - GREEN_THRESHOLD.b) < GREEN_THRESHOLD.tolerance;
    
    if (isGreen) {
      // 设置透明
      data[i + 3] = 0;
    }
  }
  
  // 绘制到目标Canvas
  targetCtx.putImageData(imageData, 0, 0);
}

/**
 * 视频帧处理循环
 */
function processVideoFrame(video: HTMLVideoElement, outputCanvas: HTMLCanvasElement): void {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  const animate = () => {
    if (video.paused || video.ended) return;
    
    // 绘制视频帧到临时Canvas
    tempCtx.drawImage(video, 0, 0);
    
    // 绿幕抠图处理
    processGreenScreen(tempCanvas, outputCanvas);
    
    requestAnimationFrame(animate);
  };
  
  animate();
}
```

**性能优化**：
- 使用 `requestAnimationFrame` 保证60fps流畅度
- 使用离屏 Canvas 进行像素处理，避免阻塞主线程
- 对于固定位置的数字人，可预计算抠图掩码减少运行时计算

### B. 文件命名规范

```
{类型}_{名称}_{版本}.{扩展名}

示例：
- avatar_luolu_intro_v1.mp4
- video_paper_invention_v1.mp4
- bg_home_v1.jpg
- audio_school_song_v1.mp3
```

### C. 环境变量清单

| 变量名 | 说明 | 示例 |
|--------|------|------|
| DATABASE_URL | 数据库连接地址 | postgresql://user:pass@host:port/db |
| REDIS_URL | Redis连接地址 | redis://host:port |
| COZE_API_KEY | Coze API密钥 | sk-xxx |
| TTS_API_URL | TTS服务地址 | http://tts.example.com |
| STORAGE_TYPE | 存储类型 | oss/cos/local |
| STORAGE_ENDPOINT | 存储服务地址 | oss-cn-shenzhen.aliyuncs.com |
| STORAGE_ACCESS_KEY | 访问密钥 | xxx |
| STORAGE_SECRET_KEY | 秘密密钥 | xxx |
| STORAGE_BUCKET | Bucket名称 | yuwen-kecheng |
| PORT | 服务端口 | 8080 |
| ENV | 运行环境 | development/test/production |

### D. 教育数据脱敏规范【新增】

#### D.1 脱敏规则

**姓名脱敏**：
- 规则：保留姓氏，名字用"*"替换
- 示例："张三" → "张*"，"李四" → "李*"
- 代码实现：
```go
func maskName(name string) string {
    if len(name) <= 1 {
        return "*"
    }
    return string(name[0]) + strings.Repeat("*", len(name)-1)
}
```

**学号脱敏**：
- 规则：保留前4位和后2位，中间用"*"替换
- 示例："S2026001" → "S2026**1"，"2026001" → "2026**1"
- 代码实现：
```go
func maskStudentID(studentID string) string {
    if len(studentID) <= 6 {
        return studentID
    }
    prefix := studentID[:4]
    suffix := studentID[len(studentID)-2:]
    return prefix + "**" + suffix
}
```

**手机号脱敏**：
- 规则：保留前3位和后4位，中间用"****"替换
- 示例："13812345678" → "138****5678"

**IP地址脱敏**：
- 规则：保留前两段，后两段用"*"替换
- 示例："192.168.1.100" → "192.168.*.*"

#### D.2 脱敏场景

| 场景 | 脱敏字段 | 说明 |
|------|---------|------|
| 日志输出 | 姓名、学号、手机号、IP | 所有日志输出时必须脱敏 |
| 导出报表 | 姓名、学号 | Excel/CSV导出时必须脱敏 |
| 前端展示 | 姓名、学号 | 教师看板展示时脱敏 |
| API响应 | 姓名、学号 | 公开API响应时脱敏 |
| 内部系统 | 不脱敏 | 教师端内部系统可显示完整信息 |

#### D.3 脱敏实现示例

**后端中间件**：
```go
// 日志脱敏中间件
func LogMaskMiddleware(next gin.HandlerFunc) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 处理请求参数脱敏
        for k, v := range c.Request.URL.Query() {
            if k == "studentId" || k == "name" {
                c.Request.URL.Query().Set(k, maskValue(k, v[0]))
            }
        }
        
        next(c)
    }
}
```

**前端工具函数**：
```typescript
// 姓名脱敏
function maskName(name: string): string {
    if (name.length <= 1) return '*';
    return name[0] + '*'.repeat(name.length - 1);
}

// 学号脱敏
function maskStudentID(studentID: string): string {
    if (studentID.length <= 6) return studentID;
    const prefix = studentID.slice(0, 4);
    const suffix = studentID.slice(-2);
    return prefix + '**' + suffix;
}
```

### E. 前端组件拆分规范【新增】

#### E.1 组件分层结构

```
src/components/
├── base/              # 基础组件（通用、无业务逻辑）
│   ├── Button.vue         # 按钮组件
│   ├── Input.vue          # 输入框组件
│   ├── Textarea.vue       # 文本域组件
│   ├── ProgressBar.vue    # 进度条组件
│   ├── Dialog.vue         # 弹窗组件
│   ├── Toast.vue          # 提示组件
│   ├── Loading.vue        # 加载组件
│   └── Empty.vue          # 空状态组件
└── business/          # 业务组件（含业务逻辑）
    ├── DigitalHuman.vue   # 数字人弹窗（含视频播放、AI交互）
    ├── AnswerBox.vue      # 答题框（含答题校验逻辑）
    ├── WordCloud.vue      # 看板词云（含数据渲染逻辑）
    ├── ChatRoom.vue       # 聊天室组件（含WebSocket通信）
    ├── GroupCard.vue      # 小组卡片（含成员展示）
    ├── BadgeDisplay.vue   # 勋章展示（含勋章获取逻辑）
    └── FeedbackOverlay.vue # 强制反馈浮层（含音频播放）
```

#### E.2 基础组件规范

**特征**：
- 无业务逻辑，纯展示组件
- 通过 props 接收数据，通过 emit 触发事件
- 可在多个业务场景复用
- 样式独立，不依赖业务样式

**示例**：
```vue
<!-- base/Button.vue -->
<template>
  <button 
    :class="buttonClass" 
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const buttonClass = computed(() => [
  'base-button',
  `base-button--${props.type}`,
  `base-button--${props.size}`,
  { 'base-button--disabled': props.disabled }
]);

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>
```

#### E.3 业务组件规范

**特征**：
- 包含业务逻辑或数据请求
- 可调用 composables、stores、api
- 特定业务场景使用
- 可包含基础组件

**示例**：
```vue
<!-- business/DigitalHuman.vue -->
<template>
  <Dialog :visible="visible" @close="handleClose">
    <div class="digital-human">
      <canvas ref="outputCanvas" class="digital-human__canvas"></canvas>
      <div class="digital-human__speech">{{ currentSpeech }}</div>
      <Button @click="playAudio">播放音频</Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from '@/components/base/Dialog.vue';
import Button from '@/components/base/Button.vue';
import { useVideo } from '@/composables/useVideo';
import { useAI } from '@/composables/useAI';

interface Props {
  visible: boolean;
  prompt: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { playVideo, processGreenScreen } = useVideo();
const { generateSpeech } = useAI();

const outputCanvas = ref<HTMLCanvasElement | null>(null);
const currentSpeech = ref('');

watch(() => props.visible, async (val) => {
  if (val) {
    // 生成对话
    const speech = await generateSpeech(props.prompt);
    currentSpeech.value = speech;
    
    // 播放视频
    if (outputCanvas.value) {
      await playVideo('avatar_luolu_intro_v1.mp4', outputCanvas.value);
    }
  }
});

const handleClose = () => {
  emit('close');
};

const playAudio = async () => {
  // 播放音频逻辑
};
</script>
```

#### E.4 组件引用路径规范

```typescript
// 基础组件引用
import Button from '@/components/base/Button.vue';

// 业务组件引用
import DigitalHuman from '@/components/business/DigitalHuman.vue';
```