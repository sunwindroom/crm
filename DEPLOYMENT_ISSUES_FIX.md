# 部署问题修复方案

## 问题1: 登录成功但不跳转到dashboard页面

### 问题分析
登录成功后显示"登录成功"提示,但页面没有跳转到dashboard页面。

### 可能原因
1. 路由跳转被路由守卫拦截
2. authStore状态未正确更新
3. router.push执行失败
4. 网络请求失败但未正确处理

### 修复方案

#### 1. 检查路由守卫逻辑
查看 `packages/frontend/src/router/index.ts` 中的路由守卫逻辑:

```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  console.log('路由守卫:', {
    to: to.path,
    from: from.path,
    requiresAuth: to.meta.requiresAuth,
    isAuthenticated: authStore.isAuthenticated,
    token: authStore.token
  })

  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    console.log('未认证，重定向到登录页')
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('已认证，重定向到 dashboard')
    next('/dashboard')
  } else {
    console.log('允许访问')
    next()
  }
})
```

#### 2. 修复authStore状态持久化
确保 `packages/frontend/src/stores/auth.ts` 中的状态持久化正确:

```typescript
export const useAuthStore = defineStore('auth', () => {
  // 从 localStorage 读取 token 和用户信息
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(() => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  })

  const isAuthenticated = computed(() => !!token.value)

  async function login(params: LoginParams) {
    try {
      console.log('AuthStore: 开始登录请求', params)
      const response = await authApi.login(params)
      console.log('AuthStore: 登录响应', response)

      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      console.log('AuthStore: Token 已保存', token.value)
      console.log('AuthStore: 用户信息已保存', user.value)
      console.log('AuthStore: 认证状态', isAuthenticated.value)

      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      console.error('AuthStore: 登录失败', error)
      ElMessage.error(error.message || '登录失败')
      return false
    }
  }

  // ... 其他方法
})
```

#### 3. 修复登录页面跳转逻辑
在 `packages/frontend/src/views/auth/Login.vue` 中添加更详细的错误处理:

```typescript
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        console.log('开始登录...', loginForm)
        const success = await authStore.login(loginForm)
        console.log('登录结果:', success)
        console.log('认证状态:', authStore.isAuthenticated)
        console.log('Token:', authStore.token)
        console.log('用户信息:', authStore.user)

        if (success) {
          console.log('准备跳转到 dashboard')
          // 使用 replace 而不是 push 避免历史记录问题
          await router.replace('/dashboard')
          console.log('跳转完成')
        } else {
          console.log('登录失败，不跳转')
        }
      } catch (error) {
        console.error('登录过程出错:', error)
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
```

## 问题2: 合同管理页面导入payment.ts报错

### 问题分析
错误信息显示无法解析 `@/api/payment` 的导入,但文件实际上存在于本地。

### 可能原因
1. Vite开发服务器缓存问题
2. TypeScript路径别名配置问题
3. 文件系统同步问题
4. 构建缓存问题

### 修复方案

#### 1. 清除Vite缓存
在服务器上执行以下命令清除缓存:

```bash
cd /usr/local/crm/packages/frontend
rm -rf node_modules/.vite
rm -rf dist
```

#### 2. 重启开发服务器
```bash
# 停止当前运行的开发服务器
# 然后重新启动
npm run dev
```

#### 3. 检查vite.config.ts配置
确保路径别名配置正确:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    watch: {
      usePolling: true // 使用轮询方式监听文件变化
    }
  }
})
```

#### 4. 检查tsconfig.json配置
确保TypeScript路径别名配置正确:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 5. 验证文件存在
确保 `/usr/local/crm/packages/frontend/src/api/payment.ts` 文件存在且内容正确。

## 服务器端部署步骤

### 1. 停止当前服务
```bash
# 停止前端开发服务器
cd /usr/local/crm/packages/frontend
# 如果使用PM2
pm2 stop crm-frontend
# 或者手动停止进程
```

### 2. 清除缓存和重新安装依赖
```bash
cd /usr/local/crm/packages/frontend
rm -rf node_modules
rm -rf node_modules/.vite
rm -rf dist
npm install
```

### 3. 验证文件完整性
```bash
# 检查关键文件是否存在
ls -la src/api/payment.ts
ls -la src/api/milestone.ts
ls -la src/api/user.ts
ls -la src/components/GanttChart.vue
```

### 4. 重启服务
```bash
# 开发模式
npm run dev

# 或者生产模式
npm run build
npm run preview
```

### 5. 验证部署
```bash
# 检查服务是否正常运行
curl http://192.168.10.19:5173
```

## 临时解决方案

如果问题持续存在,可以尝试以下临时解决方案:

### 方案1: 使用相对路径导入
在 `packages/frontend/src/views/contract/index.vue` 中修改导入语句:

```typescript
// 从
import { paymentApi } from '@/api/payment'

// 改为
import { paymentApi } from '../../api/payment'
```

### 方案2: 使用完整路径
```typescript
import { paymentApi } from '/usr/local/crm/packages/frontend/src/api/payment'
```

### 方案3: 重新构建项目
```bash
cd /usr/local/crm/packages/frontend
npm run build
npm run preview
```

## 监控和日志

### 1. 查看服务器日志
```bash
# 查看前端服务日志
pm2 logs crm-frontend

# 或者查看控制台输出
journalctl -u crm-frontend -f
```

### 2. 查看浏览器控制台
在浏览器中打开开发者工具(F12),查看Console和Network标签页的错误信息。

### 3. 检查网络请求
查看登录请求是否成功,以及响应数据是否正确。

## 预防措施

### 1. 添加健康检查
在项目中添加健康检查端点:

```typescript
// packages/frontend/src/utils/healthCheck.ts
export const checkHealth = async () => {
  try {
    const response = await fetch('/api/health')
    return response.ok
  } catch (error) {
    console.error('健康检查失败:', error)
    return false
  }
}
```

### 2. 添加错误边界
在应用中添加错误边界组件:

```vue
<template>
  <div v-if="error">
    <h1>出错了</h1>
    <p>{{ error.message }}</p>
    <button @click="retry">重试</button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false
})

const retry = () => {
  error.value = null
}
</script>
```

### 3. 添加构建验证
在构建前验证关键文件是否存在:

```bash
#!/bin/bash
# build-verify.sh

REQUIRED_FILES=(
  "src/api/payment.ts"
  "src/api/milestone.ts"
  "src/api/user.ts"
  "src/components/GanttChart.vue"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "错误: 缺少必需文件 $file"
    exit 1
  fi
done

echo "所有必需文件验证通过"
exit 0
```

## 总结

这两个问题主要是由于:
1. 登录跳转问题 - 可能是状态管理或路由守卫的问题
2. 导入错误 - 可能是Vite缓存或文件同步问题

建议按照以下步骤修复:
1. 清除Vite缓存
2. 重启开发服务器
3. 检查文件完整性
4. 查看详细日志
5. 如果问题持续,使用临时解决方案

如果问题仍然存在,请提供:
- 浏览器控制台的完整错误信息
- 服务器端日志
- Vite配置文件内容
- TypeScript配置文件内容
