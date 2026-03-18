<template>
  <div class="lead-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>线索管理</span>
          <div class="header-actions">
            <el-button
              type="success"
              :disabled="selectedLeads.length === 0"
              @click="handleBatchAssign"
            >
              <el-icon><User /></el-icon>
              批量分配
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增线索
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="姓名/公司/电话"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="新线索" value="new" />
            <el-option label="已联系" value="contacted" />
            <el-option label="已验证" value="qualified" />
            <el-option label="已丢失" value="lost" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="searchForm.source" placeholder="请选择" clearable>
            <el-option label="官网" value="website" />
            <el-option label="推荐" value="referral" />
            <el-option label="展会" value="exhibition" />
            <el-option label="电话营销" value="telemarketing" />
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
        :data="filteredLeads"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="company" label="公司" min-width="180" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="source" label="来源" width="100">
          <template #default="{ row }">
            <el-tag>{{ getSourceText(row.source) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ownerName" label="负责人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="canEditLead(row)"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasPermission('lead_assign') && canEditLead(row)"
              type="success"
              link
              @click="handleAssign(row)"
            >
              分配
            </el-button>
            <el-button
              v-if="hasPermission('lead_convert') && canEditLead(row)"
              type="warning"
              link
              @click="handleConvert(row)"
            >
              转化
            </el-button>
            <el-button
              v-if="canDeleteLead(row)"
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
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="公司" prop="company">
          <el-input v-model="formData.company" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="来源" prop="source">
          <el-select v-model="formData.source" placeholder="请选择来源">
            <el-option label="官网" value="website" />
            <el-option label="推荐" value="referral" />
            <el-option label="展会" value="exhibition" />
            <el-option label="电话营销" value="telemarketing" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="新线索" value="new" />
            <el-option label="已联系" value="contacted" />
            <el-option label="已验证" value="qualified" />
            <el-option label="已丢失" value="lost" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      :title="assignDialogTitle"
      width="500px"
      @close="handleAssignDialogClose"
    >
      <el-form
        ref="assignFormRef"
        :model="assignForm"
        :rules="assignFormRules"
        label-width="100px"
      >
        <el-form-item label="分配给" prop="userId">
          <el-select
            v-model="assignForm.userId"
            placeholder="请选择销售人员"
            filterable
            :loading="usersLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in assignableUsers"
              :key="user.id"
              :label="`${user.name} (${user.department || '未分配部门'})`"
              :value="user.id"
            >
              <div class="user-option">
                <span class="user-name">{{ user.name }}</span>
                <el-tag :type="getRoleColor(user.role)" size="small">
                  {{ getRoleDisplayName(user.role) }}
                </el-tag>
                <span class="user-dept">{{ user.department || '未分配部门' }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="assignForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入分配备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignLoading" @click="handleAssignSubmit">
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
import { leadApi } from '@/api/lead'
import { userApi } from '@/api/user'
import type { User } from '@/types'
import {
  hasPermission,
  canEditLead,
  canDeleteLead,
  filterLeadsByPermission,
  getAssignableRoles,
  getRoleDisplayName,
  getRoleColor,
  getCurrentUser
} from '@/utils/permission'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增线索')
const formRef = ref<FormInstance>()

// 分配相关
const assignDialogVisible = ref(false)
const assignDialogTitle = ref('分配线索')
const assignFormRef = ref<FormInstance>()
const assignLoading = ref(false)
const usersLoading = ref(false)
const selectedLeads = ref<any[]>([])
const salesUsers = ref<User[]>([])

const assignForm = reactive({
  leadIds: [] as string[],
  userId: '',
  remark: ''
})

const assignFormRules: FormRules = {
  userId: [{ required: true, message: '请选择销售人员', trigger: 'change' }]
}

const searchForm = reactive({
  keyword: '',
  status: '',
  source: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: '1',
    name: '张三',
    company: '科技有限公司',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    source: 'website',
    status: 'new',
    ownerName: '李四',
    createdAt: '2024-01-10 10:00:00'
  }
])

// 过滤后的线索列表(基于权限)
const filteredLeads = computed(() => {
  return filterLeadsByPermission(tableData.value)
})

// 当前用户
const currentUser = computed(() => getCurrentUser())

const formData = reactive({
  id: '',
  name: '',
  company: '',
  phone: '',
  email: '',
  source: '',
  status: 'new',
  remark: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const getSourceText = (source: string) => {
  const texts: Record<string, string> = {
    website: '官网',
    referral: '推荐',
    exhibition: '展会',
    telemarketing: '电话营销'
  }
  return texts[source] || source
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    new: '新线索',
    contacted: '已联系',
    qualified: '已验证',
    lost: '已丢失'
  }
  return texts[status] || status
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    new: 'primary',
    contacted: 'warning',
    qualified: 'success',
    lost: 'danger'
  }
  return types[status] || 'info'
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.source = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增线索'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑线索'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleAssign = async (row: any) => {
  assignDialogTitle.value = '分配线索'
  assignForm.leadIds = [row.id]
  assignDialogVisible.value = true
  await fetchSalesUsers()
}

const handleConvert = (row: any) => {
  ElMessageBox.confirm('确定要将此线索转化为客户吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('转化成功')
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除此线索吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleBatchAssign = async () => {
  assignDialogTitle.value = '批量分配线索'
  assignForm.leadIds = selectedLeads.value.map(lead => lead.id)
  assignDialogVisible.value = true
  await fetchSalesUsers()
}

const handleSelectionChange = (selection: any[]) => {
  selectedLeads.value = selection
}

const fetchSalesUsers = async () => {
  usersLoading.value = true
  try {
    // 模拟数据，实际应该调用API
    salesUsers.value = [
      { id: '1', name: '张三', department: '销售一部', phone: '13800138000', email: 'zhangsan@example.com', status: 'active', role: 'sales', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: '2', name: '李四', department: '销售一部', phone: '13800138001', email: 'lisi@example.com', status: 'active', role: 'sales', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: '3', name: '王五', department: '销售二部', phone: '13800138002', email: 'wangwu@example.com', status: 'active', role: 'sales', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: '4', name: '赵六', department: '销售二部', phone: '13800138003', email: 'zhaoliu@example.com', status: 'active', role: 'sales', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: '5', name: '钱七', department: '销售一部', phone: '13800138004', email: 'qianqi@example.com', status: 'active', role: 'sales_manager', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
    ]
    // 实际调用API的代码（注释掉，使用模拟数据）
    // const response = await userApi.getSalesUsers()
    // salesUsers.value = response
  } catch (error) {
    ElMessage.error('获取销售人员列表失败')
  } finally {
    usersLoading.value = false
  }
}

// 可分配的用户列表(根据权限过滤)
const assignableUsers = computed(() => {
  if (!currentUser.value) return []

  // 管理员、总裁、副总可以分配给所有销售相关人员
  if (['admin', 'ceo', 'cto', 'cmo'].includes(currentUser.value.role)) {
    return salesUsers.value.filter(user =>
      ['sales', 'sales_manager'].includes(user.role)
    )
  }

  // 销售经理只能分配给自己管辖的人
  if (currentUser.value.role === 'sales_manager') {
    return salesUsers.value.filter(user =>
      user.id === currentUser.value.id ||
      (currentUser.value.subordinateIds?.includes(user.id) || false)
    )
  }

  return []
})

const handleAssignDialogClose = () => {
  assignFormRef.value?.resetFields()
  Object.assign(assignForm, {
    leadIds: [],
    userId: '',
    remark: ''
  })
}

const handleAssignSubmit = async () => {
  if (!assignFormRef.value) return

  await assignFormRef.value.validate(async (valid) => {
    if (valid) {
      assignLoading.value = true
      try {
        // 批量分配
        await leadApi.batchAssign(assignForm.leadIds, {
          userId: assignForm.userId,
          remark: assignForm.remark
        })
        ElMessage.success(`成功分配 ${assignForm.leadIds.length} 条线索`)
        assignDialogVisible.value = false
        fetchData()
      } catch (error: any) {
        ElMessage.error(error.message || '分配失败')
      } finally {
        assignLoading.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: '',
    name: '',
    company: '',
    phone: '',
    email: '',
    source: '',
    status: 'new',
    remark: ''
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        ElMessage.success(formData.id ? '编辑成功' : '新增成功')
        dialogVisible.value = false
        submitLoading.value = false
        fetchData()
      }, 500)
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

const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    pagination.total = 100
  }, 500)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.lead-management {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.user-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.user-name {
  font-weight: 500;
}

.user-dept {
  color: #909399;
  font-size: 12px;
}
</style>
