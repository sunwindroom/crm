# 企业级CRM系统 - 前端应用

## 技术栈

- **框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **图表**: ECharts
- **HTTP客户端**: Axios
- **测试框架**: Vitest

## 功能特性

### 核心功能模块

1. **用户认证**
   - 登录/登出
   - JWT Token认证
   - 权限控制

2. **线索管理**
   - 线索CRUD
   - 线索分配
   - 线索转化

3. **客户管理**
   - 客户CRUD
   - 客户360度视图
   - 客户跟进记录

4. **项目管理**
   - 项目CRUD
   - 里程碑管理
   - 项目进度跟踪
   - 团队成员管理
   - 工时记录

5. **商机管理**
   - 商机CRUD
   - 商机阶段管理
   - 商机转化

6. **合同管理**
   - 合同CRUD
   - 合同审批
   - 合同执行跟踪

7. **回款管理**
   - 回款记录
   - 回款统计

8. **报表统计**
   - 销售趋势分析
   - 商机阶段分布
   - 客户行业分布
   - 项目状态统计
   - 销售排行榜

### 技术特性

1. **响应式设计**
   - 支持PC、平板、手机多端适配
   - 移动端优化布局

2. **性能优化**
   - 路由懒加载
   - 组件按需加载
   - API请求缓存
   - 图片懒加载

3. **代码质量**
   - TypeScript类型检查
   - ESLint代码规范
   - 单元测试覆盖

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问: http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 运行测试

```bash
# 运行测试
npm run test

# 测试UI界面
npm run test:ui

# 测试覆盖率
npm run test:coverage
```

## 项目结构

```
src/
├── api/              # API接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── composables/      # 组合式函数
├── layouts/          # 布局组件
├── router/           # 路由配置
├── stores/           # 状态管理
├── styles/           # 全局样式
├── types/            # 类型定义
├── utils/            # 工具函数
└── views/            # 页面组件
    ├── auth/         # 认证相关
    ├── customer/     # 客户管理
    ├── dashboard/    # 工作台
    ├── lead/         # 线索管理
    ├── opportunity/  # 商机管理
    ├── project/      # 项目管理
    ├── contract/     # 合同管理
    ├── payment/      # 回款管理
    └── report/       # 报表统计
```

## 环境变量

创建 `.env` 文件:

```env
# API基础路径
VITE_API_BASE_URL=http://localhost:3000/api/v1

# 应用标题
VITE_APP_TITLE=企业级CRM系统

# 应用端口
VITE_PORT=5173
```

## 缓存策略

系统实现了多级缓存策略:

1. **内存缓存**: 用于临时数据存储
2. **LocalStorage缓存**: 用于持久化数据存储
3. **API缓存**: 减少重复请求,提升性能

使用示例:

```typescript
import { cacheManager } from '@/utils/cache'

// 设置缓存(5分钟过期)
cacheManager.set('user_data', userData, 5 * 60 * 1000)

// 获取缓存
const data = cacheManager.get('user_data')

// 持久化缓存
cacheManager.set('settings', settings, 24 * 60 * 60 * 1000, true)
```

## 响应式设计

使用 `useResponsive` Hook 实现响应式布局:

```typescript
import { useResponsive } from '@/composables/useResponsive'

const { deviceType, isMobile, isTablet, isDesktop } = useResponsive()

if (isMobile()) {
  // 移动端逻辑
}
```

## 测试

项目使用 Vitest 进行单元测试:

- `src/stores/__tests__/` - Store测试
- `src/utils/__tests__/` - 工具函数测试
- `src/components/__tests__/` - 组件测试

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License
