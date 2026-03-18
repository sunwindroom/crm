# 快速启动指南

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0
- Docker & Docker Compose (可选,用于数据库等服务)

## 快速启动步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd crm
```

### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd packages/backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 启动基础服务(使用Docker)

```bash
# 在项目根目录
docker-compose up -d
```

这将启动以下服务:
- PostgreSQL (端口: 5432)
- Redis (端口: 6379)
- RabbitMQ (端口: 5672, 管理界面: 15672)
- MinIO (端口: 9000, 控制台: 9001)

### 4. 配置环境变量

```bash
# 后端配置
cd packages/backend
cp .env.example .env
# 编辑 .env 文件,配置数据库连接等

# 前端配置
cd ../frontend
cp .env.example .env
# 编辑 .env 文件,配置API地址等
```

### 5. 初始化数据库

```bash
# 等待数据库启动完成(约10秒)
# 数据库会自动执行 scripts/init-db.sql
```

### 6. 启动后端服务

```bash
cd packages/backend
npm run start:dev
```

后端服务将在 http://localhost:3000 启动

### 7. 启动前端服务

打开新终端:

```bash
cd packages/frontend
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 8. 访问系统

打开浏览器访问: http://localhost:5173

默认管理员账号:
- 用户名: admin
- 密码: admin123

## 开发命令

### 后端开发

```bash
cd packages/backend

# 开发模式
npm run start:dev

# 构建
npm run build

# 生产模式
npm run start:prod

# 运行测试
npm run test

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 前端开发

```bash
cd packages/frontend

# 开发模式
npm run dev

# 构建
npm run build

# 预览生产构建
npm run preview

# 运行测试
npm run test

# 测试UI
npm run test:ui

# 测试覆盖率
npm run test:coverage

# 代码检查
npm run lint
```

## 常见问题

### 1. 端口被占用

如果默认端口被占用,可以修改配置:

- 后端: 修改 `packages/backend/src/main.ts` 中的端口
- 前端: 修改 `packages/frontend/vite.config.ts` 中的端口

### 2. 数据库连接失败

检查以下项:
- Docker服务是否正常运行: `docker ps`
- 数据库是否启动完成: 查看日志 `docker-compose logs postgres`
- 环境变量配置是否正确

### 3. 前端无法连接后端

检查以下项:
- 后端服务是否正常运行
- 前端环境变量 `VITE_API_BASE_URL` 是否正确
- 是否存在跨域问题(后端已配置CORS)

### 4. 依赖安装失败

尝试以下方法:
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 服务地址

- 前端应用: http://localhost:5173
- 后端API: http://localhost:3000/api/v1
- API文档: http://localhost:3000/api/v1/docs
- RabbitMQ管理: http://localhost:15672 (crm_user/crm_password_2025)
- MinIO控制台: http://localhost:9001 (crm_admin/crm_password_2025)

## 停止服务

```bash
# 停止前端和后端服务: Ctrl+C

# 停止Docker服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

## 下一步

- 查看 [API文档](http://localhost:3000/api/v1/docs)
- 阅读 [项目总结](./PROJECT_SUMMARY.md)
- 开始开发你的功能模块

## 技术支持

如遇问题,请查看:
- 项目文档: `docs/` 目录
- 后端README: `packages/backend/README.md`
- 前端README: `packages/frontend/README.md`
