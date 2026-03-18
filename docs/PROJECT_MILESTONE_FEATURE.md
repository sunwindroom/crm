# 项目管理里程碑功能文档

## 功能概述

为CRM系统的项目管理模块添加了完整的里程碑管理功能,支持里程碑的创建、编辑、删除、状态管理和依赖关系管理。

## 主要功能

### 1. 里程碑列表管理
- 查看项目的所有里程碑
- 显示里程碑的详细信息(名称、描述、计划日期、实际日期、状态、负责人)
- 统计各状态的里程碑数量(已完成、进行中、待开始)
- 显示里程碑的依赖关系

### 2. 里程碑增删改查
- **创建里程碑**: 为项目添加新的里程碑
- **编辑里程碑**: 修改里程碑的基本信息
- **删除里程碑**: 删除不需要的里程碑
- **查看详情**: 在列表中查看里程碑的完整信息

### 3. 里程碑状态管理
- **待开始** (not_started): 里程碑尚未开始
- **进行中** (in_progress): 里程碑正在进行
- **已完成** (completed): 里程碑已完成
- **已延期** (delayed): 里程碑已延期

**状态转换规则**:
- 待开始 → 进行中: 点击"开始"按钮
- 进行中 → 已完成: 点击"完成"按钮,可添加备注
- 进行中 → 已延期: 点击"延期"按钮,必须填写延期原因

### 4. 里程碑依赖管理
- 支持设置里程碑之间的依赖关系
- 一个里程碑可以依赖多个其他里程碑
- 在创建/编辑时选择依赖的里程碑
- 列表中显示依赖数量

### 5. 负责人管理
- 为每个里程碑指定负责人
- 支持从用户列表中选择负责人
- 在列表中显示负责人姓名

## 技术实现

### 新增文件

#### 1. `packages/frontend/src/api/milestone.ts`
里程碑管理API接口,包含:
- `getList()` - 获取项目的里程碑列表
- `getDetail()` - 获取里程碑详情
- `create()` - 创建里程碑
- `update()` - 更新里程碑
- `delete()` - 删除里程碑
- `complete()` - 完成里程碑
- `updateStatus()` - 更新里程碑状态
- `batchDelete()` - 批量删除里程碑
- `updateDependencies()` - 更新里程碑依赖关系

### 修改文件

#### 1. `packages/frontend/src/types/index.ts`
添加里程碑相关类型定义:
- `CreateMilestoneRequest` - 创建里程碑请求接口

#### 2. `packages/frontend/src/views/project/index.vue`
完善项目管理页面:
- 添加里程碑管理对话框
- 添加里程碑表单对话框
- 实现里程碑的增删改查功能
- 实现里程碑状态管理
- 实现里程碑依赖管理
- 添加里程碑统计信息

## UI组件

### 里程碑管理对话框
```vue
<el-dialog v-model="milestoneDialogVisible" title="里程碑管理">
  <div class="milestone-header">
    <el-button @click="handleAddMilestone">添加里程碑</el-button>
    <div class="milestone-summary">
      <el-tag>已完成: {{ completedMilestones }}</el-tag>
      <el-tag>进行中: {{ inProgressMilestones }}</el-tag>
      <el-tag>待开始: {{ pendingMilestones }}</el-tag>
    </div>
  </div>

  <el-table :data="milestones">
    <el-table-column prop="name" label="里程碑名称" />
    <el-table-column prop="description" label="描述" />
    <el-table-column prop="plannedDate" label="计划日期" />
    <el-table-column prop="actualDate" label="实际日期" />
    <el-table-column prop="status" label="状态" />
    <el-table-column prop="assigneeName" label="负责人" />
    <el-table-column label="依赖" />
    <el-table-column label="操作">
      <el-button>开始</el-button>
      <el-button>完成</el-button>
      <el-button>延期</el-button>
      <el-button>编辑</el-button>
      <el-button>删除</el-button>
    </el-table-column>
  </el-table>
</el-dialog>
```

### 里程碑表单对话框
```vue
<el-dialog v-model="milestoneFormDialogVisible" title="新增/编辑里程碑">
  <el-form>
    <el-form-item label="里程碑名称">
      <el-input v-model="milestoneForm.name" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input type="textarea" v-model="milestoneForm.description" />
    </el-form-item>
    <el-form-item label="计划日期">
      <el-date-picker v-model="milestoneForm.plannedDate" />
    </el-form-item>
    <el-form-item label="负责人">
      <el-select v-model="milestoneForm.assignee">
        <!-- 用户选项 -->
      </el-select>
    </el-form-item>
    <el-form-item label="依赖里程碑">
      <el-select v-model="milestoneForm.dependencies" multiple>
        <!-- 里程碑选项 -->
      </el-select>
    </el-form-item>
  </el-form>
</el-dialog>
```

## 数据流

### 里程碑管理流程
1. 用户点击项目的"里程碑"按钮
2. 打开里程碑管理对话框
3. 显示该项目的所有里程碑
4. 用户可以执行以下操作:
   - 添加新里程碑
   - 编辑现有里程碑
   - 删除里程碑
   - 开始/完成/延期里程碑

### API调用
```typescript
// 获取里程碑列表
milestoneApi.getList(projectId)

// 创建里程碑
milestoneApi.create({
  projectId,
  name,
  description,
  plannedDate,
  assignee,
  dependencies
})

// 更新里程碑
milestoneApi.update(id, data)

// 删除里程碑
milestoneApi.delete(id)

// 完成里程碑
milestoneApi.complete(id, { actualDate, remark })

// 更新状态
milestoneApi.updateStatus(id, status, { reason })
```

## 数据结构

### 里程碑
```typescript
{
  id: string
  projectId: string
  name: string
  description?: string
  plannedDate: string
  actualDate?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed'
  assignee?: string
  assigneeUser?: User
  dependencies?: string[]
  createdAt: string
  updatedAt: string
}
```

### 创建里程碑请求
```typescript
{
  projectId: string
  name: string
  description?: string
  plannedDate: string
  assignee?: string
  dependencies?: string[]
}
```

## 使用说明

### 前端使用
1. 在项目管理页面,点击项目的"里程碑"按钮
2. 查看该项目的所有里程碑
3. 添加新里程碑:
   - 点击"添加里程碑"按钮
   - 填写里程碑信息
   - 选择负责人和依赖
   - 提交保存
4. 管理里程碑:
   - 根据状态执行相应操作(开始/完成/延期)
   - 编辑里程碑信息
   - 删除不需要的里程碑

### 后端API要求
需要实现以下API接口:
- `GET /api/v1/projects/:projectId/milestones` - 获取项目的里程碑列表
- `GET /api/v1/milestones/:id` - 获取里程碑详情
- `POST /api/v1/milestones` - 创建里程碑
- `PUT /api/v1/milestones/:id` - 更新里程碑
- `DELETE /api/v1/milestones/:id` - 删除里程碑
- `POST /api/v1/milestones/:id/complete` - 完成里程碑
- `PATCH /api/v1/milestones/:id/status` - 更新里程碑状态
- `DELETE /api/v1/milestones/batch` - 批量删除里程碑
- `PUT /api/v1/milestones/:id/dependencies` - 更新依赖关系

## 优化建议

1. **甘特图展示**
   - 使用甘特图可视化展示里程碑时间线
   - 显示里程碑之间的依赖关系
   - 标注延期和完成的里程碑

2. **进度计算**
   - 根据里程碑完成情况自动计算项目进度
   - 实时更新项目进度条
   - 提供进度预警功能

3. **通知提醒**
   - 里程碑到期前发送提醒
   - 里程碑延期时通知相关人员
   - 里程碑完成时发送通知

4. **权限控制**
   - 只有项目经理可以管理里程碑
   - 负责人只能查看和更新自己的里程碑
   - 普通用户只能查看里程碑

5. **历史记录**
   - 记录里程碑状态变更历史
   - 记录里程碑延期原因
   - 支持查看里程碑操作日志

6. **统计分析**
   - 统计项目里程碑完成率
   - 分析里程碑延期率
   - 对比计划与实际进度

7. **批量操作**
   - 批量更新里程碑状态
   - 批量分配负责人
   - 批量调整计划日期

## 注意事项

1. 当前使用模拟数据展示里程碑列表
2. 实际部署时需要对接后端API
3. 需要确保后端API返回正确的数据格式
4. 依赖关系需要避免循环依赖
5. 里程碑状态转换需要符合业务规则
6. 删除里程碑时需要检查是否被其他里程碑依赖

## 测试建议

1. 测试里程碑的增删改查功能
2. 测试里程碑状态转换
3. 测试里程碑依赖关系
4. 测试表单验证(必填项)
5. 测试网络错误处理
6. 测试权限控制
7. 测试里程碑统计功能
8. 测试批量操作功能

## 版本记录

- v1.0.0 (2024-03-17)
  - 初始版本
  - 实现里程碑的增删改查功能
  - 实现里程碑状态管理
  - 实现里程碑依赖管理
  - 添加里程碑统计信息
  - 集成API接口
