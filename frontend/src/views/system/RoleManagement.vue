<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <div class="header-info">
            <el-tag type="info">系统角色不可编辑</el-tag>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="角色名称/代码"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="filteredRoles"
        style="width: 100%"
        border
      >
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色代码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isSystem" label="系统角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isSystem ? 'danger' : 'info'">
              {{ row.isSystem ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permissions" label="权限数量" width="120">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.permissions.length }} 个</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleViewPermission(row)"
            >
              查看权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 权限查看对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="`${currentRole?.name} - 权限列表`"
      width="900px"
    >
      <div class="permission-content">
        <el-collapse v-model="activeCollapse">
          <el-collapse-item
            v-for="category in permissionCategories"
            :key="category.name"
            :title="category.name"
            :name="category.name"
          >
            <div class="permission-list">
              <el-checkbox
                v-for="perm in category.permissions"
                :key="perm.value"
                :model-value="hasPermission(perm.value)"
                :disabled="true"
              >
                {{ perm.label }}
              </el-checkbox>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Role, Permission } from '@/types'
import { userApi } from '@/api/user'
import { getRoleDisplayName, getRoleColor } from '@/utils/permission'

const loading = ref(false)
const permissionDialogVisible = ref(false)
const currentRole = ref<Role | null>(null)
const activeCollapse = ref<string[]>([])

const searchForm = reactive({
  keyword: ''
})

// 模拟角色数据
const tableData = ref<Role[]>([
  {
    id: '1',
    name: '管理员',
    code: 'admin',
    description: '系统管理员，拥有所有权限',
    permissions: [
      'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
      'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
      'project_create', 'project_view', 'project_edit', 'project_delete',
      'contract_create', 'contract_view', 'contract_edit', 'contract_delete',
      'payment_create', 'payment_view', 'payment_edit', 'payment_delete',
      'user_create', 'user_view', 'user_edit', 'user_delete',
      'role_view', 'role_edit',
      'report_view', 'dashboard_view'
    ],
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '2',
    name: '总裁',
    code: 'ceo',
    description: '公司总裁，可以查看所有数据',
    permissions: [
      'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
      'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
      'project_view', 'project_edit',
      'contract_view', 'contract_edit',
      'payment_view',
      'user_view', 'user_create', 'user_edit',
      'role_view',
      'report_view', 'dashboard_view'
    ],
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '3',
    name: '技术副总',
    code: 'cto',
    description: '技术副总，负责技术相关事务',
    permissions: [
      'lead_view',
      'customer_view',
      'project_create', 'project_view', 'project_edit', 'project_delete',
      'contract_view',
      'payment_view',
      'user_view',
      'report_view', 'dashboard_view'
    ],
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '4',
    name: '营销副总',
    code: 'cmo',
    description: '营销副总，负责营销相关事务',
    permissions: [
      'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
      'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
      'project_view',
      'contract_view',
      'payment_view',
      'user_view', 'user_create', 'user_edit',
      'role_view',
      'report_view', 'dashboard_view'
    ],
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '5',
    name: '销售经理',
    code: 'sales_manager',
    description: '销售经理，管理销售团队',
    permissions: [
      'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
      'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
      'project_view',
      'contract_view',
      'payment_view',
      'user_view',
      'report_view', 'dashboard_view'
    ],
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '6',
    name: '销售',
    code: 'sales',
    description: '销售人员，负责线索和客户',
    permissions: [
      'lead_create', 'lead_view', 'lead_edit', 'lead_convert',
      'customer_create', 'customer_view', 'customer_edit',
      'project_view',
      'contract_view',
      'payment_view',
      'dashboard_view'
    ],
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '7',
    name: '项目经理',
    code: 'project_manager',
    description: '项目经理，负责项目管理',
    permissions: [
      'lead_view',
      'customer_view',
      'project_create', 'project_view', 'project_edit',
      'contract_view',
      'payment_view',
      'dashboard_view'
    ],
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '8',
    name: '商务',
    code: 'business',
    description: '商务人员，只读权限',
    permissions: [
      'lead_view',
      'customer_view',
      'project_view',
      'contract_view',
      'payment_view',
      'report_view', 'dashboard_view'
    ],
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '9',
    name: '财务',
    code: 'finance',
    description: '财务人员，只读权限',
    permissions: [
      'lead_view',
      'customer_view',
      'project_view',
      'contract_view',
      'payment_view',
      'report_view', 'dashboard_view'
    ],
    isSystem: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  }
])

// 权限分类
const permissionCategories = computed(() => {
  return [
    {
      name: '线索管理',
      permissions: [
        { value: 'lead_create', label: '创建线索' },
        { value: 'lead_view', label: '查看线索' },
        { value: 'lead_edit', label: '编辑线索' },
        { value: 'lead_delete', label: '删除线索' },
        { value: 'lead_assign', label: '分配线索' },
        { value: 'lead_convert', label: '转化线索' }
      ]
    },
    {
      name: '客户管理',
      permissions: [
        { value: 'customer_create', label: '创建客户' },
        { value: 'customer_view', label: '查看客户' },
        { value: 'customer_edit', label: '编辑客户' },
        { value: 'customer_delete', label: '删除客户' }
      ]
    },
    {
      name: '项目管理',
      permissions: [
        { value: 'project_create', label: '创建项目' },
        { value: 'project_view', label: '查看项目' },
        { value: 'project_edit', label: '编辑项目' },
        { value: 'project_delete', label: '删除项目' }
      ]
    },
    {
      name: '合同管理',
      permissions: [
        { value: 'contract_create', label: '创建合同' },
        { value: 'contract_view', label: '查看合同' },
        { value: 'contract_edit', label: '编辑合同' },
        { value: 'contract_delete', label: '删除合同' }
      ]
    },
    {
      name: '回款管理',
      permissions: [
        { value: 'payment_create', label: '创建回款' },
        { value: 'payment_view', label: '查看回款' },
        { value: 'payment_edit', label: '编辑回款' },
        { value: 'payment_delete', label: '删除回款' }
      ]
    },
    {
      name: '用户管理',
      permissions: [
        { value: 'user_create', label: '创建用户' },
        { value: 'user_view', label: '查看用户' },
        { value: 'user_edit', label: '编辑用户' },
        { value: 'user_delete', label: '删除用户' }
      ]
    },
    {
      name: '角色管理',
      permissions: [
        { value: 'role_view', label: '查看角色' },
        { value: 'role_edit', label: '编辑角色' }
      ]
    },
    {
      name: '其他',
      permissions: [
        { value: 'report_view', label: '查看报表' },
        { value: 'dashboard_view', label: '查看仪表板' }
      ]
    }
  ]
})

// 过滤后的角色列表
const filteredRoles = computed(() => {
  let roles = tableData.value

  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    roles = roles.filter(role =>
      role.name.toLowerCase().includes(keyword) ||
      role.code.toLowerCase().includes(keyword)
    )
  }

  return roles
})

// 检查角色是否有指定权限
const hasPermission = (permission: Permission): boolean => {
  return currentRole.value?.permissions.includes(permission) || false
}

const handleSearch = () => {
  // 搜索逻辑已在computed中实现
}

const handleReset = () => {
  searchForm.keyword = ''
}

const handleViewPermission = (row: Role) => {
  currentRole.value = row
  activeCollapse.value = permissionCategories.value.map(cat => cat.name)
  permissionDialogVisible.value = true
}

const fetchData = async () => {
  loading.value = true
  try {
    const response = await userApi.getRoles()
    tableData.value = response || []
  } catch (error: any) {
    console.error('获取角色列表失败:', error)
    tableData.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.role-management {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
}

.permission-content {
  max-height: 500px;
  overflow-y: auto;
}

.permission-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  padding: 10px 0;
}

.permission-list .el-checkbox {
  margin-right: 0;
}
</style>
