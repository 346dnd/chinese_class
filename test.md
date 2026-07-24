一级文件夹清单（全部要新建，用途 + 教学业务对应）
1. front 【课程包前端，替代 web-course，简洁命名】
技术栈：Vue3 + Vite + TS + Pinia，平板交互页面、首页导航、预习 / 课中 / 课后所有交互页面、数字人弹窗、答题输入、小组聊天室、分层作业页面。
front 内部分层（标准 Vite+TS 教学课件结构）
plaintext
front/
├── public          # 不打包静态：背景大图、数字人透明视频、校歌音频
├── src
    ├── api         # openapi-typescript自动生成接口请求代码
    ├── assets       # 页面小图标、局部样式（大视频/背景放外层assets）
    ├── components   # 通用组件：数字人弹窗、答题框、进度条、看板词云
    ├── composables  # 复用逻辑：答题校验、AI对话、视频播放
    ├── stores       # Pinia：学习进度、得分、用户答题数据
    ├── views        # 五大页面：首页/寻找文化/重温文化/宣传有法/宣传文化/传承文化
    ├── router       # 页面路由配置
    ├── utils        # 工具：音频控制、日期格式化、数据计算
    ├── types        # TS类型，和openapi同步契约
├── package.json
2. back 【课程包后端，替代 server，简洁命名】
技术栈：Go1.22 + Gin，处理学情采集、AI 智能体调度、数据库读写、文件上传、API 转发 Coze 罗罗 / 小小。
plaintext
back/
├── cmd/api         # 后端服务启动入口
├── internal
    ├── handler     # 接口控制器（预习数据、作业、学情统计）
    ├── service     # 业务层：学情分析、分层作业判定、多媒体调度
    ├── repository  # PostgreSQL/Redis读写
    ├── agent       # SubAgent调度核心（罗罗、小小、学情、多媒体、分层作业5个子智能体）
├── model           # 数据库表结构体、请求响应结构体
├── pkg             # 公共工具：TTS、文件上传、词云生成
├── config          # 配置文件：数据库、Coze API、Redis、OpenAPI路径
├── go.mod
3. openapi 【API 契约同步专用，强制前后端统一】
存放 OpenAPI3.1 接口文档 yaml，自动生成前后端类型代码，杜绝接口不一致
plaintext
openapi/
├── spec/           # 所有接口定义yaml（预习接口、答题接口、智能体接口、作业接口）
├── gen/
    ├── front/      # 生成好的前端ts代码，复制到front/src/api
    ├── back/       # 生成好Go结构体，复制到back/model
├── generate.sh    # 一键生成脚本
4. assets 【全局多媒体资源（前后端共用）】
存放教案里所有数字人视频、课文动画、背景图、配音，不分散在前端里，方便统一管理素材：
plaintext
assets/
├── avatar/         # 罗罗、小小、伊森、米娅透明MP4、配音mp3
    ├── luolu/
    ├── xiaoxiao/
    ├── foreign/
├── lesson-video/   # 造纸术、赵州桥、清明上河图动画
├── background/     # 首页操场大图、各页面背景
├── audio/          # 校歌、背景音乐、旁白音频
5. docs 【全部规范、设计、教案文档】
你所有 AGENTS.md、RULES.md、教学设计 docx、系统流程图、SubAgent 定义、技术说明全部放这里，交付直接打包：
plaintext
docs/
├── RULES.md        # 编码强制规则（你之前写的4大编码约束+技术栈限制）
├── AGENTS.md       # 5个SubAgent完整定义、调度流程、Mermaid流程图
├── curriculum/     # 教学设计、公开课教案、三篇课文原文
├── architecture/  # 系统架构图、目录说明、API文档说明
├── api-key-config  # Coze/硅基流动API密钥配置说明
6. scripts 【自动化脚本，不用手动重复操作】
OpenAPI 代码一键生成脚本
素材批量压缩、转透明视频脚本
数据库初始化脚本
测试数据批量生成脚本
7. storage 【存储相关配置，对应 PostgreSQL+Redis + 对象存储】
存放数据库初始化 SQL、Redis 缓存 Key 设计、对象存储上传逻辑、数据表设计文档
plaintext
storage/
├── sql/        # 建表语句（答题记录、进度、用户、作业）
├── redis.md    # Redis缓存设计（学习进度、实时答题数据）
├── oss-config  # 对象存储上传逻辑文档