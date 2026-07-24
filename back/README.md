# 数智交互课程包 - 后端服务

## 技术栈

- Go 1.22+
- Gin 1.10+
- PostgreSQL 15+
- Redis 7+

## 本地启动步骤

### 1. 安装依赖

```bash
cd back
go mod download
```

### 2. 数据库配置

确保 PostgreSQL 和 Redis 已安装并运行。

创建数据库：
```sql
CREATE DATABASE edu_classroom;
```

执行初始化脚本：
```bash
psql -U postgres -d edu_classroom -f storage/sql/init.sql
```

### 3. 配置文件

编辑 `config/config.yaml`，修改数据库连接配置：

```yaml
database:
  host: localhost
  port: 5432
  user: postgres
  password: your_password
  dbname: edu_classroom
```

### 4. 启动服务

```bash
cd back
go run cmd/api/main.go
```

服务将在 `http://localhost:8080` 启动。

## API 接口

所有接口需携带 Header: `X-Student-Id: {学生ID}`

### 课程相关
- GET `/course` - 获取课程结构
- GET `/stage/{stageId}` - 获取环节配置

### 学习任务
- POST `/write` - 提交感想
- POST `/question` - 提交问题
- POST `/validate-blank` - 逐格校验
- POST `/practice` - 提交练习
- POST `/read-aloud` - 提交朗读
- POST `/chat` - 创作对话
- POST `/chat/polish` - AI批改对比
- POST `/chat/creation` - 创作选择
- POST `/feedback/generate` - 强制反馈

### 小组交流
- POST `/group/create` - 创建小组
- POST `/message/send` - 发送消息
- POST `/message/list` - 获取消息列表

### 作业
- POST `/homework/recommend` - 推荐作业
- POST `/homework/submit` - 提交作业

### 其他
- POST `/media/upload` - 上传媒体
- POST `/badge/award` - 颁发勋章

### 教师看板
- GET `/dashboard/data` - 获取看板数据
- GET `/dashboard/data/filter` - 筛选看板数据
- GET `/dashboard/export` - 导出报表

### WebSocket
- `ws://localhost:8080/ws?studentId={studentId}`

## 健康检查

```bash
curl http://localhost:8080/health
```

## 测试示例

```bash
# 获取课程结构
curl -H "X-Student-Id: S2026001" http://localhost:8080/course

# 获取环节详情
curl -H "X-Student-Id: S2026001" http://localhost:8080/stage/preview

# 提交感想
curl -H "X-Student-Id: S2026001" -H "Content-Type: application/json" -d '{
  "stageId": "preview",
  "taskId": "write-thought",
  "textId": "text-paper",
  "content": "我觉得造纸术很伟大！",
  "proudAspect": "创造力",
  "textConnection": "蔡伦改进技术",
  "lifeConnection": "现在有很多纸制品"
}' http://localhost:8080/write
```
