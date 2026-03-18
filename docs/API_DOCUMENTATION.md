# API接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证接口

### 登录
```
POST /auth/login
```

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "realName": "管理员",
    "role": "admin"
  }
}
```

### 获取当前用户信息
```
GET /auth/profile
```

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "id": "1",
  "username": "admin",
  "email": "admin@example.com",
  "realName": "管理员",
  "role": "admin"
}
```

### 登出
```
POST /auth/logout
```

## 线索接口

### 获取线索列表
```
GET /leads
```

**查询参数**:
- `page`: 页码(默认1)
- `pageSize`: 每页数量(默认10)
- `keyword`: 搜索关键词
- `status`: 线索状态
- `source`: 线索来源

**响应示例**:
```json
{
  "data": [
    {
      "id": "1",
      "name": "张三",
      "company": "科技有限公司",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "source": "website",
      "status": "new",
      "ownerId": "1",
      "ownerName": "李四",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

### 创建线索
```
POST /leads
```

**请求参数**:
```json
{
  "name": "张三",
  "company": "科技有限公司",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "source": "website",
  "status": "new",
  "remark": "备注信息"
}
```

### 更新线索
```
PUT /leads/:id
```

### 删除线索
```
DELETE /leads/:id
```

### 分配线索
```
POST /leads/:id/assign
```

**请求参数**:
```json
{
  "ownerId": "2"
}
```

### 转化线索
```
POST /leads/:id/convert
```

## 客户接口

### 获取客户列表
```
GET /customers
```

### 获取客户详情
```
GET /customers/:id
```

### 获取客户360度视图
```
GET /customers/:id/360
```

**响应示例**:
```json
{
  "customer": {
    "id": "1",
    "name": "科技有限公司",
    "type": "enterprise",
    "level": "strategic"
  },
  "statistics": {
    "totalOpportunities": 15,
    "activeOpportunities": 5,
    "wonOpportunities": 8,
    "totalProjects": 10,
    "activeProjects": 3,
    "completedProjects": 7,
    "totalContractAmount": 5000000,
    "totalPaymentAmount": 3500000,
    "pendingPaymentAmount": 1500000
  },
  "opportunities": [...],
  "projects": [...],
  "contracts": [...],
  "payments": [...],
  "followups": [...]
}
```

### 创建客户
```
POST /customers
```

### 更新客户
```
PUT /customers/:id
```

### 删除客户
```
DELETE /customers/:id
```

## 项目接口

### 获取项目列表
```
GET /projects
```

### 获取项目详情
```
GET /projects/:id
```

### 创建项目
```
POST /projects
```

**请求参数**:
```json
{
  "name": "CRM系统开发项目",
  "customerId": "1",
  "type": "software",
  "status": "presale",
  "amount": 500000,
  "ownerId": "1",
  "startDate": "2024-01-01",
  "plannedEndDate": "2024-06-30",
  "description": "项目描述"
}
```

### 更新项目
```
PUT /projects/:id
```

### 删除项目
```
DELETE /projects/:id
```

### 添加里程碑
```
POST /projects/:id/milestones
```

**请求参数**:
```json
{
  "name": "需求确认",
  "plannedDate": "2024-01-15",
  "description": "里程碑描述"
}
```

### 完成里程碑
```
POST /milestones/:id/complete
```

**请求参数**:
```json
{
  "actualDate": "2024-01-15",
  "remark": "完成备注"
}
```

## 商机接口

### 获取商机列表
```
GET /opportunities
```

### 创建商机
```
POST /opportunities
```

**请求参数**:
```json
{
  "name": "CRM系统开发商机",
  "customerId": "1",
  "amount": 500000,
  "stage": "proposal",
  "probability": 70,
  "expectedCloseDate": "2024-03-31",
  "ownerId": "1"
}
```

### 更新商机
```
PUT /opportunities/:id
```

### 删除商机
```
DELETE /opportunities/:id
```

## 合同接口

### 获取合同列表
```
GET /contracts
```

### 创建合同
```
POST /contracts
```

**请求参数**:
```json
{
  "name": "CRM系统开发合同",
  "customerId": "1",
  "amount": 500000,
  "type": "sales",
  "signedAt": "2024-01-15",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "terms": "合同条款"
}
```

### 更新合同
```
PUT /contracts/:id
```

### 删除合同
```
DELETE /contracts/:id
```

## 回款接口

### 获取回款列表
```
GET /payments
```

### 创建回款
```
POST /payments
```

**请求参数**:
```json
{
  "contractId": "1",
  "amount": 200000,
  "paymentMethod": "bank_transfer",
  "paymentDate": "2024-01-20",
  "status": "received",
  "receivedAt": "2024-01-21",
  "remark": "备注"
}
```

### 更新回款
```
PUT /payments/:id
```

### 删除回款
```
DELETE /payments/:id
```

## 用户接口

### 获取用户列表
```
GET /users
```

### 创建用户
```
POST /users
```

**请求参数**:
```json
{
  "username": "zhangsan",
  "password": "password123",
  "email": "zhangsan@example.com",
  "realName": "张三",
  "phone": "13800138000",
  "department": "销售部",
  "position": "销售经理",
  "role": "sales"
}
```

### 更新用户
```
PUT /users/:id
```

### 删除用户
```
DELETE /users/:id
```

## 错误响应

所有接口在发生错误时返回统一格式:

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

常见错误码:
- 400: 请求参数错误
- 401: 未授权(未登录或token过期)
- 403: 无权限访问
- 404: 资源不存在
- 500: 服务器内部错误

## 分页参数

所有列表接口支持统一的分页参数:

- `page`: 页码,从1开始
- `pageSize`: 每页数量,默认10

响应格式:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

## 排序参数

部分接口支持排序:

- `sortBy`: 排序字段
- `sortOrder`: 排序方式(asc/desc)

## 筛选参数

各模块支持不同的筛选参数,具体见各接口说明。

## API文档访问

启动后端服务后,访问以下地址查看完整的Swagger API文档:

http://localhost:3000/api/v1/docs
