# 语文课堂 Frontend

智慧语文课堂前端（Vue 3 + Vite + TypeScript），传统文化课文教学 SPA。

> 完整说明见仓库根目录 [`README.md`](../README.md)。

## 快速开始

```bash
npm install
npm run dev       # 开发（默认 5173）
npm run build     # 类型检查 + 构建 → dist/
npm run preview   # 预览构建产物
npm run gen-api   # 从 apifox-openapi.json 重新生成 src/api/generated/
```

## 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `VITE_API_BASE_URL` | API 基础路径（`/api` 走 vite 代理；或填后端绝对地址直连） | `/api` |
| `VITE_STORAGE_BASE_URL` | 存储服务地址（TTS/上传文件） | `http://192.168.3.22:8088` |
| `VITE_CLASS_ID` | 默认班级 ID | `127` |
| `VITE_NODE_ID` | 默认节点 ID | `17` |

> 修改 `.env` 后需重启 `npm run dev`。

## 目录速览

```
src/
├── api/            # 接口层（index.ts 手写 + generated/ codegen 双轨）
├── components/     # 公共组件（ScaleCanvas / PageHeader / CompletionOverlay 等）
├── composables/    # useScale / useAudioPlayer / useFile 等
├── router/         # 路由 + 登录守卫
├── stores/         # user / progress（首页节点导航接口驱动）
├── types/          # 手写类型
├── views/          # 页面（含 PromoteCulture 创作模块）
└── utils/          # 课文文本等
```

路由、接口契约、节点映射等细节见根目录 [`README.md`](../README.md)。

## License

Private - 仅供内部使用
