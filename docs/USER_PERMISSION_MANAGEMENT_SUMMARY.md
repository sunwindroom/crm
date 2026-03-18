# CRM系统人员权限管理功能实现总结

## 已完成功能

### 1. ✅ 角色和权限定义更新
- 更新了类型定义,添加了9个角色
- 定义了详细的权限系统
- 实现了角色层级关系

### 2. ✅ 权限控制工具更新
- 创建了完整的权限控制工具 (`packages/frontend/src/utils/permission.ts`)
- 实现了基于角色的权限检查
- 实现了数据权限过滤
- 实现了线索分配权限控制

### 3. ✅ 用户管理API
- 更新了用户管理API接口
- 添加了角色管理相关接口
- 添加了密码管理接口

### 4. ✅ 人员管理页面
- 创建了完整的人员管理页面 (`packages/frontend/src/views/system/UserManagement.vue`)
- 实现了用户增删改查功能
- 实现了角色分配功能
- 实现了上级分配功能
- 实现了权限控制

## 待实现功能

### 5. 🔄 角色管理页面

**实现方案**:
```vue
<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button
            v-if="canManageRoles()"
            type="primary"
            @click="handleAdd"
          >
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 角色列表表格 -->
      <el-table :data="roles" border>
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色代码" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="isSystem" label="系统角色">
          <template #default="{ row }">
            <el-tag :type="row.isSystem ? 'danger' : 'info'">
              {{ row.isSystem ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permissions" label="权限数量">
          <template #default="{ row }">
            {{ row.permissions.length }} 个
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button
              v-if="!row.isSystem && canManageRoles()"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 权限配置对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="权限配置" width="800px">
      <el-checkbox-group v-model="selectedPermissions">
        <el-checkbox
          v-for="permission in allPermissions"
          :key="permission.value"
          :label="permission.value"
        >
          {{ permission.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-dialog>
  </div>
</template>
```

### 6. 🔄 个人中心页面

**实现方案**:
```vue
<template>
  <div class="profile">
    <el-card>
      <template #header>
        <span>个人中心</span>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-form :model="userInfo" label-width="120px">
            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" disabled />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="userInfo.name" />
            </el-form-item>
            <el-form-item label="电话">
              <el-input v-model="userInfo.phone" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email" />
            </el-form-item>
            <el-form-item label="部门">
              <el-input v-model="userInfo.department" />
            </el-form-item>
            <el-form-item label="职位">
              <el-input v-model="userInfo.position" />
            </el-form-item>
            <el-form-item label="角色">
              <el-tag :type="getRoleColor(userInfo.role)">
                {{ getRoleDisplayName(userInfo.role) }}
              </el-tag>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateInfo">
                更新信息
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form :model="passwordForm" label-width="120px">
            <el-form-item label="原密码">
              <el-input v-model="passwordForm.oldPassword" type="password" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
```

### 7. 🔄 线索管理页面权限更新

**需要更新的内容**:
```typescript
// 在线索管理页面中应用权限控制
import {
  hasPermission,
  canEditLead,
  canAssignLead,
  canDeleteLead,
  filterLeadsByPermission,
  getAssignableRoles
} from '@/utils/permission'

// 过滤线索列表
const filteredLeads = computed(() => {
  return filterLeadsByPermission(leads.value)
})

// 控制按钮显示
const canShowAssignButton = (lead: any) => {
  return hasPermission('lead_assign') && canEditLead(lead)
}

const canShowDeleteButton = (lead: any) => {
  return canDeleteLead(lead)
}

// 控制分配目标角色
const assignableRoles = computed(() => {
  return getAssignableRoles()
})
```

### 8. 🔄 路由配置更新

**需要添加的路由**:
```typescript
// packages/frontend/src/router/index.ts
const routes: RouteRecordRaw[] = [
  // ... 其他路由
  {
    path: '/system',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/system/UserManagement.vue'),
        meta: { title: '人员管理', icon: 'User', permission: 'user_view' }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('@/views/system/RoleManagement.vue'),
        meta: { title: '角色管理', icon: 'Key', permission: 'role_view' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/system/Profile.vue'),
        meta: { title: '个人中心', icon: 'UserFilled' }
      }
    ]
  }
]
```

## 角色权限矩阵

| 角色 | 创建线索 | 查看线索 | 编辑线索 | 删除线索 | 分配线索 | 转化线索 | 创建客户 | 查看客户 | 编辑客户 | 删除客户 | 查看项目 | 编辑项目 | 查看合同 | 查看回款 | 管理用户 |
|------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| 管理员 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 总裁 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 技术副总 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 营销副总 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| 销售经理 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 销售 | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 项目经理 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 商务 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| 财务 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |

## 数据权限规则

### 1. 线索查看权限
- **管理员、总裁、副总、商务、财务**: 可以查看所有线索
- **销售经理**: 可以查看自己和下属的线索
- **销售**: 只能查看自己的线索
- **项目经理**: 只能查看项目相关的线索

### 2. 线索分配权限
- **总裁**: 可以分配给除项目经理以外的所有人
- **副总**: 可以分配给除总裁和项目经理以外的所有人
- **销售经理**: 只能分配给自己管辖的销售人员

### 3. 线索编辑权限
- **管理员、总裁、副总**: 可以编辑所有线索
- **销售经理**: 可以编辑自己和下属的线索
- **销售**: 只能编辑自己的线索
- **商务、财务**: 不能编辑线索

### 4. 线索删除权限
- **管理员、总裁、副总**: 可以删除所有线索
- **销售经理**: 可以删除自己和下属的线索
- **销售**: 只能删除自己创建的线索
- **商务、财务**: 不能删除线索

## 后端API要求

### 用户管理API
- `GET /api/v1/users` - 获取用户列表
- `GET /api/v1/users/:id` - 获取用户详情
- `POST /api/v1/users` - 创建用户
- `PUT /api/v1/users/:id` - 更新用户
- `DELETE /api/v1/users/:id` - 删除用户
- `PATCH /api/v1/users/:id/status` - 更新用户状态
- `POST /api/v1/users/change-password` - 修改密码
- `POST /api/v1/users/:id/reset-password` - 重置密码(管理员)
- `GET /api/v1/users/me` - 获取当前用户信息
- `PUT /api/v1/users/me` - 更新当前用户信息
- `GET /api/v1/users/subordinates` - 获取下属列表
- `GET /api/v1/users/superior` - 获取上级信息

### 角色管理API
- `GET /api/v1/roles` - 获取角色列表
- `GET /api/v1/roles/:id` - 获取角色详情
- `PUT /api/v1/roles/:id` - 更新角色权限

### 线索管理API(需要支持权限过滤)
- `GET /api/v1/leads` - 获取线索列表(支持权限过滤)
- `POST /api/v1/leads` - 创建线索
- `PUT /api/v1/leads/:id` - 更新线索
- `DELETE /api/v1/leads/:id` - 删除线索
- `POST /api/v1/leads/:id/assign` - 分配线索

## 数据库设计

### 用户表(users)
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  department VARCHAR(50),
  position VARCHAR(50),
  role VARCHAR(50) NOT NULL,
  superior_id VARCHAR(36),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (superior_id) REFERENCES users(id)
);
```

### 角色表(roles)
```sql
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSON,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 线索表(leads) - 需要添加字段
```sql
ALTER TABLE leads ADD COLUMN created_by VARCHAR(36);
ALTER TABLE leads ADD COLUMN department VARCHAR(50);
ALTER TABLE leads ADD FOREIGN KEY (created_by) REFERENCES users(id);
```

## 部署建议

### 1. 数据库迁移
创建迁移脚本来更新数据库结构:
```sql
-- 添加用户表字段
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'sales';
ALTER TABLE users ADD COLUMN superior_id VARCHAR(36);
ALTER TABLE users ADD COLUMN position VARCHAR(50);
ALTER TABLE users ADD CONSTRAINT fk_superior FOREIGN KEY (superior_id) REFERENCES users(id);

-- 创建角色表
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSON,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认角色
INSERT INTO roles (id, name, code, description, permissions, is_system) VALUES
('1', '管理员', 'admin', '系统管理员，拥有所有权限', '[...]', true),
('2', '总裁', 'ceo', '公司总裁，可以查看所有数据', '[...]', true),
-- ... 其他角色
;

-- 更新线索表
ALTER TABLE leads ADD COLUMN created_by VARCHAR(36);
ALTER TABLE leads ADD COLUMN department VARCHAR(50);
```

### 2. 初始化管理员账户
```sql
-- 确保管理员账户存在
UPDATE users SET role = 'admin', status = 'active' WHERE username = 'admin';
```

### 3. 更新现有用户
为现有用户分配角色和上级:
```sql
-- 根据实际情况更新用户角色
UPDATE users SET role = 'ceo' WHERE name LIKE '%张总%';
UPDATE users SET role = 'cto' WHERE name LIKE '%李总%' AND department LIKE '%技术%';
UPDATE users SET role = 'cmo' WHERE name LIKE '%王总%' AND department LIKE '%营销%';
```

## 测试建议

### 1. 权限测试
- 测试不同角色的登录和权限
- 测试数据过滤是否正确
- 测试操作按钮显示是否正确

### 2. 分配测试
- 测试总裁分配给不同角色
- 测试副总分配权限
- 测试销售经理分配给下属

### 3. 个人中心测试
- 测试修改个人信息
- 测试修改密码
- 测试密码重置功能

### 4. 集成测试
- 测试线索创建和分配
- 测试线索查看权限
- 测试线索编辑和删除权限

## 总结

本次实现完善了CRM系统的人员权限管理功能,包括:

1. ✅ 角色和权限定义更新
2. ✅ 权限控制工具更新
3. ✅ 用户管理API
4. ✅ 人员管理页面
5. 🔄 角色管理页面(待实现)
6. 🔄 个人中心页面(待实现)
7. 🔄 线索管理页面权限更新(待实现)
8. 🔄 路由配置更新(待实现)

所有功能都遵循了项目的编码规范和架构设计,具有良好的可扩展性和维护性。

---

**文档版本**: 1.0
**最后更新**: 2024-03-17
