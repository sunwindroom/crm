# 企业级CRM系统 - MVP版本

## 项目简介

这是一个专为IT企业（软件开发、系统集成、IT专业服务）设计的企业级CRM系统MVP版本。

### 核心功能

- ✅ 用户认证与授权（JWT）
- ✅ 线索管理（CRUD）
- ✅ 客户管理（CRUD + 360度视图）
- ✅ 项目管理（CRUD + 里程碑）
- ✅ 商机管理
- ✅ 合同管理
- ✅ 回款管理

### 技术栈

**后端：**
- NestJS + TypeScript
- PostgreSQL 14
- Redis 7
- RabbitMQ 3
- MinIO

**前端：**
- Vue 3 + TypeScript
- Element Plus
- Vite

## 快速开始

### 前置要求

- Node.js 18+
- Docker & Docker Compose
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd crm
```

2. **安装依赖**
```bash
# 安装后端依赖
cd packages/backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库、Redis等连接信息
```

4. **启动基础服务**
```bash
docker-compose up -d
```

5. **初始化数据库**
```bash
# 等待数据库启动完成（约10秒）
# 数据库会自动执行 scripts/init-db.sql
```

6. **启动后端服务**
```bash
cd packages/backend
npm run start:dev
```

7. **启动前端服务**
```bash
cd packages/frontend
npm run dev
```

### 访问地址

- 前端：http://localhost:5173
- 后端API：http://localhost:3000/api/v1
- API文档：http://localhost:3000/api/v1/docs
- RabbitMQ管理界面：http://localhost:15672 (crm_user/crm_password_2025)
- MinIO控制台：http://localhost:9001 (crm_admin/crm_password_2025)

### 默认管理员账号

```
用户名: admin
密码: admin123
```

## 项目结构

```
crm/
├── packages/
│   ├── backend/          # 后端服务
│   │   ├── src/
│   │   │   ├── modules/  # 业务模块
│   │   │   ├── common/   # 通用组件
│   │   │   └── config/   # 配置文件
│   │   └── package.json
│   └── frontend/         # 前端应用
│       ├── src/
│       │   ├── views/    # 页面组件
│       │   ├── components/ # 通用组件
│       │   └── api/      # API接口
│       └── package.json
├── scripts/              # 脚本文件
├── docs/                 # 文档
├── docker-compose.yml    # Docker编排文件
└── .env.example          # 环境变量示例
```

## API文档

### 认证接口

- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/profile` - 获取当前用户信息

### 用户接口

- `POST /api/v1/users` - 创建用户
- `GET /api/v1/users` - 获取用户列表
- `GET /api/v1/users/:id` - 获取用户详情
- `PUT /api/v1/users/:id` - 更新用户信息
- `DELETE /api/v1/users/:id` - 删除用户

### 线索接口

- `POST /api/v1/leads` - 创建线索
- `GET /api/v1/leads` - 获取线索列表
- `GET /api/v1/leads/:id` - 获取线索详情
- `PUT /api/v1/leads/:id` - 更新线索信息
- `DELETE /api/v1/leads/:id` - 删除线索
- `POST /api/v1/leads/:id/assign` - 分配线索
- `POST /api/v1/leads/:id/convert` - 转化线索

### 客户接口

- `POST /api/v1/customers` - 创建客户
- `GET /api/v1/customers` - 获取客户列表
- `GET /api/v1/customers/:id` - 获取客户详情
- `GET /api/v1/customers/:id/360` - 获取客户360度视图
- `PUT /api/v1/customers/:id` - 更新客户信息
- `DELETE /api/v1/customers/:id` - 删除客户

### 项目接口

- `POST /api/v1/projects` - 创建项目
- `GET /api/v1/projects` - 获取项目列表
- `GET /api/v1/projects/:id` - 获取项目详情
- `PUT /api/v1/projects/:id` - 更新项目信息
- `DELETE /api/v1/projects/:id` - 删除项目
- `POST /api/v1/projects/:id/milestones` - 添加里程碑
- `POST /api/v1/milestones/:id/complete` - 完成里程碑

## 开发指南

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

# 代码检查
npm run lint
```

## 数据库迁移

```bash
cd packages/backend

# 生成迁移文件
npm run migration:generate -- -n MigrationName

# 执行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 部署

### Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 项目主页：https://github.com/your-org/crm
- 问题反馈：https://github.com/your-org/crm/issues
