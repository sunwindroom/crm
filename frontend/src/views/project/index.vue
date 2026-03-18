<template>
  <div class="project-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增项目
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="项目名称/客户名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="售前阶段" value="presale" />
            <el-option label="开发中" value="in_progress" />
            <el-option label="实施中" value="delivery" />
            <el-option label="已验收" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="软件开发" value="software" />
            <el-option label="系统集成" value="integration" />
            <el-option label="IT服务" value="service" />
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
        :data="tableData"
        style="width: 100%"
        border
      >
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="customerName" label="客户" width="150" />
        <el-table-column prop="type" label="项目类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :color="getProgressColor(row.progress)"
              :status="row.progress === 100 ? 'success' : ''"
            />
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="ownerName" label="项目经理" width="100" />
        <el-table-column prop="plannedEndDate" label="计划结束" width="120" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleMilestone(row)">里程碑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
      width="800px"
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
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="formData.customerId" placeholder="请选择客户" filterable>
                <el-option label="科技有限公司" value="1" />
                <el-option label="网络科技公司" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择">
                <el-option label="软件开发" value="software" />
                <el-option label="系统集成" value="integration" />
                <el-option label="IT服务" value="service" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择">
                <el-option label="售前阶段" value="presale" />
                <el-option label="开发中" value="in_progress" />
                <el-option label="实施中" value="delivery" />
                <el-option label="已验收" value="completed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目金额" prop="amount">
              <el-input-number v-model="formData.amount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目经理" prop="ownerId">
              <el-select v-model="formData.ownerId" placeholder="请选择" filterable>
                <el-option label="张三" value="1" />
                <el-option label="李四" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="plannedEndDate">
              <el-date-picker
                v-model="formData.plannedEndDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
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

    <!-- 里程碑管理对话框 -->
    <el-dialog
      v-model="milestoneDialogVisible"
      title="里程碑管理"
      width="1400px"
      @close="handleMilestoneDialogClose"
    >
      <el-tabs v-model="activeMilestoneTab">
        <el-tab-pane label="列表视图" name="list">
          <div class="milestone-header">
            <el-button
              v-if="canCreateMilestone()"
              type="primary"
              @click="handleAddMilestone"
            >
              <el-icon><Plus /></el-icon>
              添加里程碑
            </el-button>
            <div class="milestone-summary">
              <el-tag type="success">已完成: {{ completedMilestones }}</el-tag>
              <el-tag type="warning">进行中: {{ inProgressMilestones }}</el-tag>
              <el-tag type="info">待开始: {{ pendingMilestones }}</el-tag>
              <el-tag type="info">当前角色: {{ currentUserRoleName }}</el-tag>
            </div>
          </div>

      <el-table
        v-loading="milestoneLoading"
        :data="milestones"
        border
        class="milestone-table"
      >
        <el-table-column prop="name" label="里程碑名称" min-width="180" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="plannedDate" label="计划日期" width="120" />
        <el-table-column prop="actualDate" label="实际日期" width="120">
          <template #default="{ row }">
            {{ row.actualDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getMilestoneStatusType(row.status)">
              {{ getMilestoneStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assigneeName" label="负责人" width="100" />
        <el-table-column label="依赖" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.dependencies && row.dependencies.length > 0" type="info" size="small">
              {{ row.dependencies.length }} 个
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'not_started' && canStartMilestone(row.assignee)"
              type="primary"
              link
              @click="handleStartMilestone(row)"
            >
              开始
            </el-button>
            <el-button
              v-if="row.status === 'in_progress' && canCompleteMilestone(row.assignee)"
              type="success"
              link
              @click="handleCompleteMilestone(row)"
            >
              完成
            </el-button>
            <el-button
              v-if="row.status === 'in_progress' && canDelayMilestone(row.assignee)"
              type="warning"
              link
              @click="handleDelayMilestone(row)"
            >
              延期
            </el-button>
            <el-button
              v-if="canEditMilestone(row.assignee)"
              type="primary"
              link
              @click="handleEditMilestone(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canDeleteMilestone(row.assignee)"
              type="danger"
              link
              @click="handleDeleteMilestone(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
        </el-tab-pane>
        <el-tab-pane label="甘特图" name="gantt">
          <div class="milestone-header">
            <el-button type="primary" @click="handleAddMilestone">
              <el-icon><Plus /></el-icon>
              添加里程碑
            </el-button>
            <div class="milestone-summary">
              <el-tag type="success">已完成: {{ completedMilestones }}</el-tag>
              <el-tag type="warning">进行中: {{ inProgressMilestones }}</el-tag>
              <el-tag type="info">待开始: {{ pendingMilestones }}</el-tag>
            </div>
          </div>
          <GanttChart :milestones="milestones" />
        </el-tab-pane>
        <el-tab-pane label="进度分析" name="progress">
          <div class="progress-analysis">
            <el-card class="progress-card">
              <template #header>
                <div class="card-header">
                  <span>项目总进度</span>
                </div>
              </template>
              <div class="progress-content">
                <el-progress
                  type="circle"
                  :percentage="projectProgress"
                  :color="getProgressColor(projectProgress)"
                  :width="200"
                />
                <div class="progress-stats">
                  <div class="stat-item">
                    <span class="stat-label">已完成</span>
                    <span class="stat-value">{{ projectStats.completed }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">进行中</span>
                    <span class="stat-value">{{ projectStats.inProgress }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">待开始</span>
                    <span class="stat-value">{{ projectStats.notStarted }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">已延期</span>
                    <span class="stat-value">{{ projectStats.delayed }}</span>
                  </div>
                </div>
              </div>
            </el-card>

            <el-card class="progress-card">
              <template #header>
                <div class="card-header">
                  <span>时间分析</span>
                </div>
              </template>
              <div class="time-analysis">
                <div class="time-item">
                  <span class="time-label">剩余天数</span>
                  <span class="time-value">{{ projectStats.remainingDays }} 天</span>
                </div>
                <div class="time-item">
                  <span class="time-label">延期里程碑</span>
                  <span class="time-value danger">{{ projectStats.delayedCount }} 个</span>
                </div>
                <div class="time-item">
                  <span class="time-label">项目状态</span>
                  <el-tag :type="projectStats.isDelayed ? 'danger' : 'success'">
                    {{ projectStats.isDelayed ? '已延期' : '正常' }}
                  </el-tag>
                </div>
              </div>
            </el-card>

            <el-card class="progress-card full-width">
              <template #header>
                <div class="card-header">
                  <span>进度建议</span>
                </div>
              </template>
              <div class="progress-suggestion">
                <el-alert
                  :title="progressSuggestion"
                  type="info"
                  :closable="false"
                  show-icon
                />
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 新增/编辑里程碑对话框 -->
    <el-dialog
      v-model="milestoneFormDialogVisible"
      :title="milestoneFormTitle"
      width="600px"
      @close="handleMilestoneFormClose"
    >
      <el-form
        ref="milestoneFormRef"
        :model="milestoneForm"
        :rules="milestoneFormRules"
        label-width="120px"
      >
        <el-form-item label="里程碑名称" prop="name">
          <el-input v-model="milestoneForm.name" placeholder="请输入里程碑名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="milestoneForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入里程碑描述"
          />
        </el-form-item>
        <el-form-item label="计划日期" prop="plannedDate">
          <el-date-picker
            v-model="milestoneForm.plannedDate"
            type="date"
            placeholder="选择计划日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="assignee">
          <el-select v-model="milestoneForm.assignee" placeholder="请选择负责人" filterable clearable>
            <el-option label="张三" value="1" />
            <el-option label="李四" value="2" />
            <el-option label="王五" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="依赖里程碑" prop="dependencies">
          <el-select
            v-model="milestoneForm.dependencies"
            placeholder="请选择依赖的里程碑"
            multiple
            filterable
            clearable
          >
            <el-option
              v-for="m in availableMilestones"
              :key="m.id"
              :label="m.name"
              :value="m.id"
              :disabled="m.id === milestoneForm.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="milestoneFormDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="milestoneSubmitLoading" @click="handleMilestoneSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { milestoneApi } from '@/api/milestone'
import GanttChart from '@/components/GanttChart.vue'
import {
  calculateProjectProgress,
  getProjectStats,
  getProgressColor,
  getProgressSuggestion
} from '@/utils/projectProgress'
import {
  checkAndSendMilestoneNotifications,
  startMilestoneNotificationCheck,
  stopMilestoneNotificationCheck,
  sendMilestoneCompletedNotification
} from '@/utils/notification'
import {
  canManageMilestone,
  canCreateMilestone,
  canEditMilestone,
  canDeleteMilestone,
  canStartMilestone,
  canCompleteMilestone,
  canDelayMilestone,
  getCurrentUser,
  getCurrentUserRole,
  getRoleDisplayName
} from '@/utils/permission'

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const milestoneDialogVisible = ref(false)
const milestoneFormDialogVisible = ref(false)
const milestoneLoading = ref(false)
const milestoneSubmitLoading = ref(false)
const activeMilestoneTab = ref('list')
const dialogTitle = ref('新增项目')
const milestoneFormTitle = ref('新增里程碑')
const formRef = ref<FormInstance>()
const milestoneFormRef = ref<FormInstance>()

// 当前选中的项目ID
const currentProjectId = ref('')

// 里程碑表单
const milestoneForm = reactive({
  id: '',
  projectId: '',
  name: '',
  description: '',
  plannedDate: '',
  assignee: '',
  dependencies: [] as string[]
})

const milestoneFormRules: FormRules = {
  name: [{ required: true, message: '请输入里程碑名称', trigger: 'blur' }],
  plannedDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }]
}

const searchForm = reactive({
  keyword: '',
  status: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: '1',
    name: 'CRM系统开发项目',
    customerName: '科技有限公司',
    type: 'software',
    status: 'in_progress',
    progress: 60,
    amount: 500000,
    ownerName: '张三',
    plannedEndDate: '2024-06-30'
  }
])

const formData = reactive({
  id: '',
  name: '',
  customerId: '',
  type: '',
  status: 'presale',
  amount: 0,
  ownerId: '',
  startDate: '',
  plannedEndDate: '',
  description: ''
})

const milestones = ref([
  {
    id: '1',
    name: '需求确认',
    description: '与客户确认项目需求',
    plannedDate: '2024-01-15',
    actualDate: '2024-01-15',
    status: 'completed',
    assigneeName: '张三',
    dependencies: []
  },
  {
    id: '2',
    name: '系统设计',
    description: '完成系统架构和详细设计',
    plannedDate: '2024-02-15',
    actualDate: '',
    status: 'in_progress',
    assigneeName: '李四',
    dependencies: ['1']
  },
  {
    id: '3',
    name: '开发完成',
    description: '完成功能开发和单元测试',
    plannedDate: '2024-04-30',
    actualDate: '',
    status: 'not_started',
    assigneeName: '王五',
    dependencies: ['2']
  }
])

// 计算属性：统计各状态的里程碑数量
const completedMilestones = computed(() =>
  milestones.value.filter(m => m.status === 'completed').length
)
const inProgressMilestones = computed(() =>
  milestones.value.filter(m => m.status === 'in_progress').length
)
const pendingMilestones = computed(() =>
  milestones.value.filter(m => m.status === 'not_started').length
)

// 可用的里程碑列表（用于依赖选择）
const availableMilestones = computed(() =>
  milestones.value.filter(m => m.id !== milestoneForm.id)
)

// 项目进度
const projectProgress = computed(() => calculateProjectProgress(milestones.value))

// 项目统计信息
const projectStats = computed(() => getProjectStats(milestones.value))

// 进度建议
const progressSuggestion = computed(() => getProgressSuggestion(projectStats.value))

// 当前用户信息
const currentUser = computed(() => getCurrentUser())

// 当前用户角色
const currentUserRole = computed(() => getCurrentUserRole())

// 当前用户角色名称
const currentUserRoleName = computed(() => getRoleDisplayName(currentUserRole.value))

const formRules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }],
  amount: [{ required: true, message: '请输入项目金额', trigger: 'blur' }],
  ownerId: [{ required: true, message: '请选择项目经理', trigger: 'change' }]
}

const formatMoney = (value: number) => {
  return (value / 10000).toFixed(2) + '万'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    software: '软件开发',
    integration: '系统集成',
    service: 'IT服务'
  }
  return texts[type] || type
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    presale: '售前阶段',
    in_progress: '开发中',
    delivery: '实施中',
    completed: '已验收'
  }
  return texts[status] || status
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    presale: 'primary',
    in_progress: 'warning',
    delivery: 'info',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getMilestoneStatusText = (status: string) => {
  const texts: Record<string, string> = {
    not_started: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    delayed: '已延期'
  }
  return texts[status] || status
}

const getMilestoneStatusType = (status: string) => {
  const types: Record<string, any> = {
    not_started: 'info',
    in_progress: 'warning',
    completed: 'success',
    delayed: 'danger'
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
  searchForm.type = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增项目'
  dialogVisible.value = true
}

const handleView = (row: any) => {
  router.push(`/projects/${row.id}`)
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑项目'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleMilestone = async (row: any) => {
  currentProjectId.value = row.id
  milestoneDialogVisible.value = true
  await fetchMilestones(row.id)
  // 启动通知检查
  startMilestoneNotificationCheck(milestones.value)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除此项目吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleMilestoneDialogClose = () => {
  currentProjectId.value = ''
  // 停止通知检查
  stopMilestoneNotificationCheck()
}

const handleAddMilestone = () => {
  milestoneFormTitle.value = '新增里程碑'
  Object.assign(milestoneForm, {
    id: '',
    projectId: currentProjectId.value,
    name: '',
    description: '',
    plannedDate: '',
    assignee: '',
    dependencies: []
  })
  milestoneFormDialogVisible.value = true
}

const handleEditMilestone = (row: any) => {
  milestoneFormTitle.value = '编辑里程碑'
  Object.assign(milestoneForm, {
    id: row.id,
    projectId: currentProjectId.value,
    name: row.name,
    description: row.description || '',
    plannedDate: row.plannedDate,
    assignee: row.assignee || '',
    dependencies: row.dependencies || []
  })
  milestoneFormDialogVisible.value = true
}

const handleMilestoneFormClose = () => {
  milestoneFormRef.value?.resetFields()
  Object.assign(milestoneForm, {
    id: '',
    projectId: '',
    name: '',
    description: '',
    plannedDate: '',
    assignee: '',
    dependencies: []
  })
}

const handleMilestoneSubmit = async () => {
  if (!milestoneFormRef.value) return

  await milestoneFormRef.value.validate(async (valid) => {
    if (valid) {
      milestoneSubmitLoading.value = true
      try {
        if (milestoneForm.id) {
          // 编辑
          await milestoneApi.update(milestoneForm.id, {
            name: milestoneForm.name,
            description: milestoneForm.description,
            plannedDate: milestoneForm.plannedDate,
            assignee: milestoneForm.assignee,
            dependencies: milestoneForm.dependencies
          })
          ElMessage.success('编辑成功')
        } else {
          // 新增
          await milestoneApi.create({
            projectId: milestoneForm.projectId,
            name: milestoneForm.name,
            description: milestoneForm.description,
            plannedDate: milestoneForm.plannedDate,
            assignee: milestoneForm.assignee,
            dependencies: milestoneForm.dependencies
          })
          ElMessage.success('新增成功')
        }
        milestoneFormDialogVisible.value = false
        await fetchMilestones(currentProjectId.value)
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        milestoneSubmitLoading.value = false
      }
    }
  })
}

const handleStartMilestone = async (row: any) => {
  try {
    await milestoneApi.updateStatus(row.id, 'in_progress')
    row.status = 'in_progress'
    ElMessage.success('里程碑已开始')
    await fetchMilestones(currentProjectId.value)
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleCompleteMilestone = async (row: any) => {
  ElMessageBox.prompt('请输入完成备注', '完成里程碑', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '可选'
  }).then(async ({ value }) => {
    try {
      await milestoneApi.complete(row.id, { remark: value })
      ElMessage.success('里程碑已完成')
      // 发送完成通知
      sendMilestoneCompletedNotification(row)
      await fetchMilestones(currentProjectId.value)
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

const handleDelayMilestone = (row: any) => {
  ElMessageBox.prompt('请输入延期原因', '延期里程碑', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入延期原因',
    inputValidator: (value) => {
      if (!value) {
        return '请输入延期原因'
      }
      return true
    }
  }).then(async ({ value }) => {
    try {
      await milestoneApi.updateStatus(row.id, 'delayed', { reason: value })
      ElMessage.success('里程碑已延期')
      await fetchMilestones(currentProjectId.value)
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

const handleDeleteMilestone = (row: any) => {
  ElMessageBox.confirm('确定要删除此里程碑吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await milestoneApi.delete(row.id)
      ElMessage.success('删除成功')
      await fetchMilestones(currentProjectId.value)
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const fetchMilestones = async (projectId: string) => {
  milestoneLoading.value = true
  try {
    // 模拟数据，实际应该调用API
    // const response = await milestoneApi.getList(projectId)
    // milestones.value = response.data
    // 暂时使用模拟数据
    milestoneLoading.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '获取里程碑列表失败')
  } finally {
    milestoneLoading.value = false
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: '',
    name: '',
    customerId: '',
    type: '',
    status: 'presale',
    amount: 0,
    ownerId: '',
    startDate: '',
    plannedEndDate: '',
    description: ''
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
.project-management {
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

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.milestone-summary {
  display: flex;
  gap: 10px;
}

.milestone-table {
  margin-top: 0;
}

.progress-analysis {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.progress-card {
  margin-bottom: 20px;
}

.progress-card.full-width {
  grid-column: span 2;
}

.progress-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

.progress-stats {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.time-analysis {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.time-label {
  font-size: 14px;
  color: #606266;
}

.time-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.time-value.danger {
  color: #f56c6c;
}

.progress-suggestion {
  padding: 10px 0;
}
</style>
