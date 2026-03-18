<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>人员管理</span>
          <el-button
            v-if="canManageUsers()"
            type="primary"
            @click="handleAdd"
          >
            <el-icon><Plus /></el-icon>
            新增人员
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="姓名/用户名/电话"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择" clearable>
            <el-option
              v-for="role in getAllRoles()"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="锁定" value="locked" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="filteredUsers"
        style="width: 100%"
        border
      >
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleColor(row.role)">
              {{ getRoleDisplayName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="superiorName" label="上级" width="120">
          <template #default="{ row }">
            {{ row.superiorName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="canEditUser(row)"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canManageUsers() && row.id !== currentUser?.id"
              type="warning"
              link
              @click="handleResetPassword(row)"
            >
              重置密码
            </el-button>
            <el-button
              v-if="canDeleteUser(row)"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入用户名"
                :disabled="!!formData.id"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="!formData.id" :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="formData.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-input v-model="formData.department" placeholder="请输入部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="formData.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
                <el-option
                  v-for="role in getAssignableRoles()"
                  :key="role"
                  :label="getRoleDisplayName(role)"
                  :value="role"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级" prop="superiorId">
              <el-select
                v-model="formData.superiorId"
                placeholder="请选择上级"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="user in getAvailableSuperiors()"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="inactive">禁用</el-radio>
            <el-radio label="locked">锁定</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { userApi } from '@/api/user'
import type { User, UserRole, CreateUserRequest, UpdateUserRequest } from '@/types'
import {
  canManageUsers,
  getRoleDisplayName,
  getRoleColor,
  getAllRoles,
  getAssignableRoles,
  getCurrentUser
} from '@/utils/permission'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增人员')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  role: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 模拟用户数据
const tableData = ref<User[]>([
  {
    id: '1',
    username: 'admin',
    name: '管理员',
    phone: '13800138000',
    email: 'admin@example.com',
    department: '管理部',
    position: '系统管理员',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '2',
    username: 'ceo',
    name: '张总',
    phone: '13800138001',
    email: 'ceo@example.com',
    department: '总裁办',
    position: '总裁',
    role: 'ceo',
    status: 'active',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  },
  {
    id: '3',
    username: 'cto',
    name: '李总',
    phone: '13800138002',
    email: 'cto@example.com',
    department: '技术部',
    position: '技术副总',
    role: 'cto',
    status: 'active',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00'
  }
])

const formData = reactive({
  id: '',
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  email: '',
  department: '',
  position: '',
  role: 'sales' as UserRole,
  superiorId: '',
  status: 'active' as User['status']
})

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 当前用户
const currentUser = computed(() => getCurrentUser())

// 过滤后的用户列表
const filteredUsers = computed(() => {
  return tableData.value
})

// 获取可选择的上级
const getAvailableSuperiors = () => {
  const currentRole = formData.role
  const currentHierarchy = {
    admin: 100,
    ceo: 90,
    cto: 80,
    cmo: 80,
    sales_manager: 60,
    sales: 40,
    project_manager: 50,
    business: 30,
    finance: 30
  }

  return tableData.value.filter(user => {
    if (user.id === formData.id) return false
    const userHierarchy = currentHierarchy[user.role as keyof typeof currentHierarchy] || 0
    const roleHierarchy = currentHierarchy[currentRole as keyof typeof currentHierarchy] || 0
    return userHierarchy > roleHierarchy
  })
}

// 检查是否可以编辑用户
const canEditUser = (user: User) => {
  if (!canManageUsers()) return false
  if (user.id === currentUser.value?.id) return true // 可以编辑自己

  // 只能编辑级别比自己低的用户
  const hierarchy = {
    admin: 100,
    ceo: 90,
    cto: 80,
    cmo: 80,
    sales_manager: 60,
    sales: 40,
    project_manager: 50,
    business: 30,
    finance: 30
  }

  const currentLevel = hierarchy[currentUser.value?.role || 'sales'] || 0
  const userLevel = hierarchy[user.role] || 0

  return currentLevel > userLevel
}

// 检查是否可以删除用户
const canDeleteUser = (user: User) => {
  if (!canManageUsers()) return false
  if (user.id === currentUser.value?.id) return false
  if (user.role === 'admin') return false // 不能删除管理员

  return canEditUser(user)
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '正常',
    inactive: '禁用',
    locked: '锁定'
  }
  return texts[status] || status
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    active: 'success',
    inactive: 'info',
    locked: 'danger'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.role = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增人员'
  Object.assign(formData, {
    id: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    role: 'sales',
    superiorId: '',
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  dialogTitle.value = '编辑人员'
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    name: row.name,
    phone: row.phone,
    email: row.email,
    department: row.department,
    position: row.position,
    role: row.role,
    superiorId: row.superiorId || '',
    status: row.status,
    password: '',
    confirmPassword: ''
  })
  dialogVisible.value = true
}

const handleResetPassword = (row: User) => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password',
    inputValidator: (value) => {
      if (!value || value.length < 6) {
        return '密码长度不能少于6位'
      }
      return true
    }
  }).then(async ({ value }) => {
    try {
      await userApi.resetPassword(row.id, value)
      ElMessage.success('密码重置成功')
    } catch (error: any) {
      ElMessage.error(error.message || '密码重置失败')
    }
  })
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm('确定要删除此人员吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await userApi.delete(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    role: 'sales',
    superiorId: '',
    status: 'active'
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (formData.id) {
          // 编辑
          const updateData: UpdateUserRequest = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            department: formData.department,
            position: formData.position,
            role: formData.role,
            superiorId: formData.superiorId || undefined,
            status: formData.status
          }
          await userApi.update(formData.id, updateData)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          const createData: CreateUserRequest = {
            username: formData.username,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            department: formData.department,
            position: formData.position,
            role: formData.role,
            superiorId: formData.superiorId || undefined
          }
          await userApi.create(createData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      role: searchForm.role || undefined,
      status: searchForm.status || undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const
    }

    const response = await userApi.getList(params)
    tableData.value = response.data || []
    pagination.total = response.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.user-management {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
