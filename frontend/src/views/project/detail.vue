<template>
  <div class="project-detail">
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>项目基本信息</span>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ project.customerName }}</el-descriptions-item>
        <el-descriptions-item label="项目类型">
          <el-tag>{{ getTypeText(project.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="项目状态">
          <el-tag :type="getStatusType(project.status)">
            {{ getStatusText(project.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="项目金额">¥{{ formatMoney(project.amount) }}</el-descriptions-item>
        <el-descriptions-item label="项目经理">{{ project.ownerName }}</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ project.startDate }}</el-descriptions-item>
        <el-descriptions-item label="计划结束">{{ project.plannedEndDate }}</el-descriptions-item>
        <el-descriptions-item label="实际结束">{{ project.actualEndDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="3">{{ project.description }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>项目进度</span>
              <el-button type="primary" @click="handleUpdateProgress">更新进度</el-button>
            </div>
          </template>
          <el-progress
            :percentage="project.progress"
            :status="project.progress === 100 ? 'success' : ''"
            :stroke-width="20"
          />
          <div style="margin-top: 20px">
            <el-steps :active="getActiveStep()" align-center>
              <el-step title="售前阶段" description="需求确认" />
              <el-step title="开发阶段" description="系统开发" />
              <el-step title="实施阶段" description="系统部署" />
              <el-step title="验收阶段" description="项目验收" />
            </el-steps>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>项目统计</span>
          </template>
          <el-statistic title="已完成里程碑" :value="statistics.completedMilestones" suffix="/ 5" />
          <el-statistic title="团队成员" :value="statistics.teamMembers" style="margin-top: 20px" />
          <el-statistic title="已用工时" :value="statistics.totalHours" suffix="小时" style="margin-top: 20px" />
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="里程碑" name="milestones">
        <el-button type="primary" @click="handleAddMilestone" style="margin-bottom: 20px">
          <el-icon><Plus /></el-icon>
          添加里程碑
        </el-button>
        <el-timeline>
          <el-timeline-item
            v-for="milestone in milestones"
            :key="milestone.id"
            :timestamp="milestone.plannedDate"
            :type="getMilestoneColor(milestone.status)"
            placement="top"
          >
            <el-card>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <div>
                  <h4>{{ milestone.name }}</h4>
                  <p v-if="milestone.actualDate">实际完成: {{ milestone.actualDate }}</p>
                </div>
                <div>
                  <el-tag :type="getMilestoneStatusType(milestone.status)">
                    {{ getMilestoneStatusText(milestone.status) }}
                  </el-tag>
                  <el-button
                    v-if="milestone.status !== 'completed'"
                    type="success"
                    size="small"
                    style="margin-left: 10px"
                    @click="handleCompleteMilestone(milestone)"
                  >
                    完成
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>

      <el-tab-pane label="团队成员" name="team">
        <el-button type="primary" @click="handleAddMember" style="margin-bottom: 20px">
          <el-icon><Plus /></el-icon>
          添加成员
        </el-button>
        <el-table :data="teamMembers" border>
          <el-table-column prop="userName" label="姓名" width="120" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag>{{ getRoleText(row.role) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="joinDate" label="加入时间" width="120" />
          <el-table-column prop="workHours" label="已用工时" width="120">
            <template #default="{ row }">{{ row.workHours }}小时</template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditMember(row)">编辑</el-button>
              <el-button type="danger" link @click="handleRemoveMember(row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="工时记录" name="workhours">
        <el-button type="primary" @click="handleAddWorkHour" style="margin-bottom: 20px">
          <el-icon><Plus /></el-icon>
          记录工时
        </el-button>
        <el-table :data="workHours" border>
          <el-table-column prop="userName" label="姓名" width="120" />
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="hours" label="工时" width="100">
            <template #default="{ row }">{{ row.hours }}小时</template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag>{{ getWorkTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="createdAt" label="记录时间" width="160" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="项目文档" name="documents">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          @change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处,或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持上传项目相关文档,如需求文档、设计文档、测试报告等
            </div>
          </template>
        </el-upload>
        <el-table :data="documents" border style="margin-top: 20px">
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="size" label="大小" width="120">
            <template #default="{ row }">{{ formatFileSize(row.size) }}</template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="uploaderName" label="上传者" width="100" />
          <el-table-column prop="uploadedAt" label="上传时间" width="160" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleDownload(row)">下载</el-button>
              <el-button type="danger" link @click="handleDeleteDocument(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="跟进记录" name="followups">
        <el-timeline>
          <el-timeline-item
            v-for="followup in followups"
            :key="followup.id"
            :timestamp="followup.createdAt"
            placement="top"
          >
            <el-card>
              <h4>{{ followup.type }}</h4>
              <p>{{ followup.content }}</p>
              <p>记录人: {{ followup.userName }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const activeTab = ref('milestones')

const project = reactive({
  id: '1',
  name: 'CRM系统开发项目',
  customerName: '科技有限公司',
  type: 'software',
  status: 'in_progress',
  progress: 60,
  amount: 500000,
  ownerName: '张三',
  startDate: '2024-01-01',
  plannedEndDate: '2024-06-30',
  actualEndDate: '',
  description: '为客户开发一套企业级CRM系统,包含线索管理、客户管理、项目管理、合同管理等核心功能模块'
})

const statistics = reactive({
  completedMilestones: 2,
  teamMembers: 8,
  totalHours: 1200
})

const milestones = ref([
  { id: '1', name: '需求确认', plannedDate: '2024-01-15', actualDate: '2024-01-15', status: 'completed' },
  { id: '2', name: '系统设计', plannedDate: '2024-02-15', actualDate: '2024-02-20', status: 'completed' },
  { id: '3', name: '开发完成', plannedDate: '2024-04-30', actualDate: '', status: 'in_progress' },
  { id: '4', name: '系统测试', plannedDate: '2024-05-31', actualDate: '', status: 'pending' },
  { id: '5', name: '项目验收', plannedDate: '2024-06-30', actualDate: '', status: 'pending' }
])

const teamMembers = ref([
  { id: '1', userName: '张三', role: 'pm', department: '研发部', joinDate: '2024-01-01', workHours: 200 },
  { id: '2', userName: '李四', role: 'dev', department: '研发部', joinDate: '2024-01-05', workHours: 180 },
  { id: '3', userName: '王五', role: 'dev', department: '研发部', joinDate: '2024-01-05', workHours: 160 }
])

const workHours = ref([
  { id: '1', userName: '张三', date: '2024-01-20', hours: 8, type: 'dev', description: '完成用户管理模块开发', createdAt: '2024-01-20 18:00' },
  { id: '2', userName: '李四', date: '2024-01-20', hours: 8, type: 'dev', description: '完成权限管理模块开发', createdAt: '2024-01-20 18:00' }
])

const documents = ref([
  { id: '1', name: '需求规格说明书.docx', size: 2048000, type: 'docx', uploaderName: '张三', uploadedAt: '2024-01-15 10:00' },
  { id: '2', name: '系统设计文档.pdf', size: 5120000, type: 'pdf', uploaderName: '李四', uploadedAt: '2024-02-20 14:00' }
])

const followups = ref([
  { id: '1', type: '需求评审', content: '与客户进行了需求评审会议,确认了核心功能需求', userName: '张三', createdAt: '2024-01-10 16:00' },
  { id: '2', type: '技术方案', content: '完成技术方案设计,已提交客户审核', userName: '李四', createdAt: '2024-02-15 10:00' }
])

const formatMoney = (value: number) => {
  return (value / 10000).toFixed(2) + '万'
}

const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
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

const getActiveStep = () => {
  const statusMap: Record<string, number> = {
    presale: 0,
    in_progress: 1,
    delivery: 2,
    completed: 3
  }
  return statusMap[project.status] || 0
}

const getMilestoneStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成'
  }
  return texts[status] || status
}

const getMilestoneStatusType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getMilestoneColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'info',
    in_progress: 'primary',
    completed: 'success'
  }
  return colors[status] || 'info'
}

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    pm: '项目经理',
    dev: '开发工程师',
    test: '测试工程师',
    design: '设计师'
  }
  return texts[role] || role
}

const getWorkTypeText = (type: string) => {
  const texts: Record<string, string> = {
    dev: '开发',
    test: '测试',
    design: '设计',
    meeting: '会议'
  }
  return texts[type] || type
}

const handleEdit = () => {
  ElMessage.info('编辑功能开发中')
}

const handleUpdateProgress = () => {
  ElMessage.info('更新进度功能开发中')
}

const handleAddMilestone = () => {
  ElMessage.info('添加里程碑功能开发中')
}

const handleCompleteMilestone = (milestone: any) => {
  ElMessageBox.confirm('确定要完成此里程碑吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    milestone.status = 'completed'
    milestone.actualDate = new Date().toISOString().split('T')[0]
    ElMessage.success('里程碑已完成')
  })
}

const handleAddMember = () => {
  ElMessage.info('添加成员功能开发中')
}

const handleEditMember = (row: any) => {
  ElMessage.info('编辑成员功能开发中')
}

const handleRemoveMember = (row: any) => {
  ElMessageBox.confirm('确定要移除此成员吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = teamMembers.value.findIndex(m => m.id === row.id)
    if (index > -1) {
      teamMembers.value.splice(index, 1)
      ElMessage.success('移除成功')
    }
  })
}

const handleAddWorkHour = () => {
  ElMessage.info('记录工时功能开发中')
}

const handleFileChange = (file: any) => {
  ElMessage.info('文件上传功能开发中')
}

const handleDownload = (row: any) => {
  ElMessage.info('下载功能开发中')
}

const handleDeleteDocument = (row: any) => {
  ElMessageBox.confirm('确定要删除此文档吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = documents.value.findIndex(d => d.id === row.id)
    if (index > -1) {
      documents.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

onMounted(() => {
  const tab = route.query.tab
  if (tab) {
    activeTab.value = tab as string
  }
})
</script>

<style scoped>
.project-detail {
  padding: 0;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-tabs {
  margin-top: 20px;
}
</style>
