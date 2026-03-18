# 线索管理分配功能文档

## 功能概述

为CRM系统的线索管理模块添加了完整的分配功能,支持单个分配和批量分配。

## 主要功能

### 1. 单个线索分配
- 点击线索列表中的"分配"按钮
- 弹出分配对话框,可选择销售人员
- 支持添加分配备注
- 提交后更新线索的负责人信息

### 2. 批量线索分配
- 在表格中选中多个线索
- 点击"批量分配"按钮
- 统一分配给同一个销售人员
- 提高工作效率

### 3. 销售人员选择
- 从用户列表中筛选销售人员
- 显示用户姓名和部门信息
- 支持搜索过滤
- 下拉选项展示详细信息

## 技术实现

### 新增文件

#### 1. `packages/frontend/src/api/user.ts`
用户管理API接口,包含:
- `getList()` - 获取用户列表
- `getDetail()` - 获取用户详情
- `getSalesUsers()` - 获取可分配的销售人员列表
- `create()` - 创建用户
- `update()` - 更新用户
- `delete()` - 删除用户
- `updateStatus()` - 更新用户状态

### 修改文件

#### 1. `packages/frontend/src/api/lead.ts`
更新线索API接口:
- `assign()` - 分配单个线索,支持备注参数
- `batchAssign()` - 批量分配线索

#### 2. `packages/frontend/src/views/lead/index.vue`
完善线索管理页面:
- 添加表格多选功能
- 添加批量分配按钮
- 实现分配对话框组件
- 集成销售人员选择
- 实现分配逻辑和API调用

## UI组件

### 分配对话框
```vue
<el-dialog v-model="assignDialogVisible" title="分配线索">
  <el-form>
    <el-form-item label="分配给">
      <el-select v-model="assignForm.userId" filterable>
        <el-option v-for="user in salesUsers">
          显示用户姓名和部门
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="备注">
      <el-input type="textarea" />
    </el-form-item>
  </el-form>
</el-dialog>
```

### 批量操作按钮
```vue
<el-button
  type="success"
  :disabled="selectedLeads.length === 0"
  @click="handleBatchAssign"
>
  批量分配
</el-button>
```

## 数据流

### 分配流程
1. 用户点击分配按钮
2. 打开分配对话框
3. 获取销售人员列表
4. 用户选择销售人员和填写备注
5. 提交分配请求
6. 更新线索负责人信息
7. 刷新列表数据

### API调用
```typescript
// 单个分配
leadApi.assign(leadId, { userId, remark })

// 批量分配
leadApi.batchAssign(leadIds, { userId, remark })
```

## 数据结构

### 分配表单
```typescript
{
  leadIds: string[]      // 线索ID数组
  userId: string         // 销售人员ID
  remark: string         // 分配备注
}
```

### 销售人员
```typescript
{
  id: string
  name: string
  department: string
  phone: string
  email: string
  status: 'active' | 'inactive' | 'locked'
  createdAt: string
  updatedAt: string
}
```

## 使用说明

### 前端使用
1. 在线索管理页面,点击单条线索的"分配"按钮
2. 或选中多条线索后点击"批量分配"按钮
3. 在对话框中选择销售人员
4. 可选填写分配备注
5. 点击确定完成分配

### 后端API要求
需要实现以下API接口:
- `GET /api/v1/users/sales` - 获取销售人员列表
- `POST /api/v1/leads/:id/assign` - 分配单个线索
- `POST /api/v1/leads/batch-assign` - 批量分配线索

## 优化建议

1. **权限控制**
   - 只有销售经理或管理员可以分配线索
   - 销售人员只能查看自己负责的线索

2. **分配规则**
   - 支持按地区自动分配
   - 支持按工作量平衡分配
   - 支持按客户类型分配

3. **通知功能**
   - 分配后通知销售人员
   - 支持邮件和站内消息

4. **历史记录**
   - 记录线索分配历史
   - 支持查看分配轨迹

5. **统计分析**
   - 统计各销售人员线索数量
   - 分析线索转化率

## 注意事项

1. 当前使用模拟数据展示销售人员列表
2. 实际部署时需要对接后端API
3. 需要确保后端API返回正确的数据格式
4. 分配成功后需要刷新页面数据

## 测试建议

1. 测试单个线索分配功能
2. 测试批量分配功能
3. 测试表单验证(必填项)
4. 测试网络错误处理
5. 测试权限控制
6. 测试分配后数据更新

## 版本记录

- v1.0.0 (2024-03-17)
  - 初始版本
  - 实现单个和批量分配功能
  - 添加销售人员选择组件
  - 集成API接口
