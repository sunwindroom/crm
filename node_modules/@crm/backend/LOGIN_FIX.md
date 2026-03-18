# 登录问题修复指南

## 问题现象
使用 admin / admin123456 登录时显示"网络错误,请检查网络连接"

## 问题原因
1. 数据库中的管理员密码哈希值不正确
2. 后端返回的 token 字段名与前端期望不匹配

## 已修复的问题

### 1. Token 字段名不匹配 ✅
- **修改文件**: `src/modules/auth/auth.service.ts`
- **修改内容**: 将返回的 `accessToken` 改为 `token`
- **原因**: 前端期望的字段名是 `token`

### 2. 密码哈希问题 ⚠️
数据库初始化脚本中的密码哈希可能不正确，需要重新生成。

## 解决方案

### 方法一：使用密码哈希生成接口（推荐）

1. 重启后端服务
2. 使用 Postman 或 curl 调用以下接口：

```bash
curl -X POST http://localhost:3000/api/v1/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123456"}'
```

3. 返回结果会包含正确的密码哈希和 SQL 更新语句：

```json
{
  "password": "admin123456",
  "hash": "$2a$10$真正的哈希值...",
  "sql": "UPDATE users SET password = '$2a$10$真正的哈希值...' WHERE username = 'admin';"
}
```

4. 在数据库中执行返回的 SQL 语句更新密码

### 方法二：使用迁移脚本

1. 运行迁移更新密码：

```bash
cd packages/backend
npm run migration:run
```

2. 迁移脚本 `1710123456790-UpdateAdminPassword.ts` 会自动更新密码

### 方法三：直接手动更新数据库

1. 连接到 PostgreSQL 数据库
2. 执行以下 SQL：

```sql
-- 先生成正确的密码哈希（需要 bcrypt）
-- 然后更新密码
UPDATE users
SET password = '使用方法一生成的哈希值'
WHERE username = 'admin';
```

## 验证修复

修复后，使用以下凭据登录：
- 用户名: `admin`
- 密码: `admin123456`

## 前端配置检查

确保前端配置文件 `packages/frontend/.env` 中的 API 地址正确：

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## 网络问题排查

如果仍然显示"网络错误"，检查：

1. **后端服务是否正常运行**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

2. **后端端口是否正确**
   - 默认端口: 3000
   - 可通过 `APP_PORT` 环境变量修改

3. **CORS 配置**
   - 后端已启用 CORS，允许所有来源
   - 检查浏览器控制台是否有 CORS 错误

4. **前端开发服务器端口**
   - 默认端口: 5173
   - 可通过 `VITE_PORT` 环境变量修改

## 常见问题

### Q: 为什么密码哈希不正确？
A: 初始化脚本中的哈希值格式不正确，需要使用 bcrypt 重新生成。

### Q: 如何生成新的密码哈希？
A: 使用 `/api/v1/auth/generate-hash` 接口（仅开发环境可用）。

### Q: 迁移脚本会删除数据吗？
A: 不会，迁移脚本只会更新密码，不会影响其他数据。

### Q: 生产环境如何处理？
A: 生产环境应移除 `generate-hash` 接口，使用环境变量或配置管理工具设置初始密码。

## 相关文件

- `src/modules/auth/auth.service.ts` - 认证服务
- `src/modules/auth/auth.controller.ts` - 认证控制器
- `src/migrations/1710123456790-UpdateAdminPassword.ts` - 密码更新迁移
- `scripts/init-db.sql` - 数据库初始化脚本
