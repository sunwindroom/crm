# 登录跳转问题调试指南

## 问题描述
输入用户名和密码后，前端页面不再报错，但页面仍然停留在登录界面，没有跳转到 dashboard。

## 已修复的问题

### 1. 前后端数据结构不匹配 ✅
- **问题**：前端期望的 User 接口与后端返回的数据不匹配
- **修复**：更新了 `src/types/auth.ts` 中的 User 接口，使其与后端返回的数据结构一致

### 2. 添加了调试日志 ✅
在以下位置添加了详细的调试日志：
- `src/views/auth/Login.vue` - 登录组件
- `src/stores/auth.ts` - 认证 store
- `src/router/index.ts` - 路由守卫
- `src/utils/request.ts` - API 请求工具

## 调试步骤

### 1. 打开浏览器开发者工具
- 按 F12 或右键 → 检查
- 切换到 Console 标签页

### 2. 尝试登录
输入用户名和密码，点击登录按钮

### 3. 查看控制台输出

#### 正常的登录流程应该看到：

```
开始登录... {username: "admin", password: "******"}
AuthStore: 开始登录请求 {username: "admin", password: "******"}
API 响应: {url: "/auth/login", status: 200, data: {...}}
AuthStore: 登录响应 {token: "...", user: {...}}
AuthStore: Token 已保存 "..."
AuthStore: 用户信息已保存 {...}
AuthStore: 认证状态 true
登录结果: true
认证状态: true
Token: "..."
用户信息: {...}
准备跳转到 dashboard
路由守卫: {to: "/dashboard", from: "/login", requiresAuth: true, isAuthenticated: true, token: "..."}
允许访问
跳转完成
```

#### 可能的问题和解决方案：

### 问题 1：登录响应中没有 token
**现象**：
```
AuthStore: 登录响应 {token: undefined, user: {...}}
```

**原因**：后端返回的字段名不匹配

**解决方案**：
- 检查后端 `auth.service.ts` 中的 login 方法
- 确保返回的是 `token` 而不是 `accessToken`

### 问题 2：认证状态始终为 false
**现象**：
```
AuthStore: 认证状态 false
```

**原因**：token 没有正确保存

**解决方案**：
- 检查 localStorage 中是否有 token
- 检查 `authStore.login` 方法是否正确设置 token

### 问题 3：路由守卫阻止跳转
**现象**：
```
路由守卫: {to: "/dashboard", from: "/login", requiresAuth: true, isAuthenticated: false, token: null}
未认证，重定向到登录页
```

**原因**：路由守卫在跳转前检查时，认证状态还没有更新

**解决方案**：
- 可能需要等待 store 更新后再跳转
- 或者修改路由守卫逻辑

### 问题 4：dashboard 页面不存在
**现象**：
```
跳转完成
[NavigationDuplicated] 或其他路由错误
```

**原因**：dashboard 组件没有正确加载

**解决方案**：
- 检查 `src/views/dashboard/index.vue` 是否存在
- 检查路由配置是否正确

## 常见问题排查

### 检查网络请求
1. 打开 Network 标签页
2. 筛选 XHR 请求
3. 查看 `/auth/login` 请求：
   - 请求方法：POST
   - 请求体：`{"username":"admin","password":"admin123456"}`
   - 响应状态：200
   - 响应体：应该包含 `token` 和 `user` 字段

### 检查 localStorage
1. 打开 Application 标签页
2. 左侧 → Local Storage → http://localhost:5173
3. 查看是否有 `token` 键

### 检查 Vue DevTools
1. 安装 Vue DevTools 浏览器扩展
2. 打开 Vue 标签页
3. 查看 Pinia store 中的 auth 状态：
   - `token` 是否有值
   - `user` 是否有值
   - `isAuthenticated` 是否为 true

## 手动测试 API

### 测试登录接口
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}'
```

期望响应：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "name": "系统管理员",
    "phone": "13800138000",
    "email": "admin@crm.com",
    "department": "系统管理部"
  }
}
```

## 修复建议

如果问题仍然存在，尝试以下修复：

### 修复 1：确保后端返回正确的字段
检查 `src/modules/auth/auth.service.ts`：
```typescript
return {
  token: this.jwtService.sign(payload),  // 必须是 token，不是 accessToken
  user: { ... }
}
```

### 修复 2：检查路由守卫逻辑
如果路由守卫在跳转前检查时认证状态还没有更新，可以添加延迟：
```typescript
if (success) {
  // 等待一下确保 store 更新完成
  await new Promise(resolve => setTimeout(resolve, 100))
  await router.push('/dashboard')
}
```

### 修复 3：检查 dashboard 组件
确保 `src/views/dashboard/index.vue` 存在且没有语法错误。

## 相关文件

- `src/views/auth/Login.vue` - 登录页面
- `src/stores/auth.ts` - 认证状态管理
- `src/router/index.ts` - 路由配置
- `src/utils/request.ts` - API 请求工具
- `src/types/auth.ts` - 类型定义
