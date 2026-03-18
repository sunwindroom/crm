<template>
  <div class="customer-detail">
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>客户基本信息</span>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="客户名称">{{ customer.name }}</el-descriptions-item>
        <el-descriptions-item label="客户类型">{{ getTypeText(customer.type) }}</el-descriptions-item>
        <el-descriptions-item label="客户级别">
          <el-tag :type="getLevelType(customer.level)">
            {{ getLevelText(customer.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系人">{{ customer.contactName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ customer.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ customer.email }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="3">{{ customer.address }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ customer.ownerName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ customer.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="最后更新">{{ customer.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="360度视图" name="360">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card>
              <template #header>
                <span>商机统计</span>
              </template>
              <el-statistic title="总商机数" :value="statistics.totalOpportunities" />
              <el-statistic title="进行中" :value="statistics.activeOpportunities" />
              <el-statistic title="已成交" :value="statistics.wonOpportunities" />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <template #header>
                <span>项目统计</span>
              </template>
              <el-statistic title="总项目数" :value="statistics.totalProjects" />
              <el-statistic title="进行中" :value="statistics.activeProjects" />
              <el-statistic title="已完成" :value="statistics.completedProjects" />
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <template #header>
                <span>财务统计</span>
              </template>
              <el-statistic title="合同总额" :value="statistics.totalContractAmount" prefix="¥" />
              <el-statistic title="回款总额" :value="statistics.totalPaymentAmount" prefix="¥" />
              <el-statistic title="待回款" :value="statistics.pendingPaymentAmount" prefix="¥" />
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="商机" name="opportunities">
        <el-table :data="opportunities" border>
          <el-table-column prop="name" label="商机名称" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">¥{{ row.amount }}</template>
          </el-table-column>
          <el-table-column prop="stage" label="阶段" width="120">
            <template #default="{ row }">
              <el-tag>{{ row.stage }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'won' ? 'success' : 'info'">
                {{ row.status === 'won' ? '已成交' : '进行中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="项目" name="projects">
        <el-table :data="projects" border>
          <el-table-column prop="name" label="项目名称" />
          <el-table-column prop="type" label="项目类型" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getProjectStatusType(row.status)">
                {{ getProjectStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="合同" name="contracts">
        <el-table :data="contracts" border>
          <el-table-column prop="contractNo" label="合同编号" width="150" />
          <el-table-column prop="name" label="合同名称" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">¥{{ row.amount }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getContractStatusType(row.status)">
                {{ getContractStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="signedAt" label="签订日期" width="120" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="回款" name="payments">
        <el-table :data="payments" border>
          <el-table-column prop="paymentNo" label="回款编号" width="150" />
          <el-table-column prop="amount" label="金额" width="120">
            <template #default="{ row }">¥{{ row.amount }}</template>
          </el-table-column>
          <el-table-column prop="paymentMethod" label="付款方式" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'received' ? 'success' : 'warning'">
                {{ row.status === 'received' ? '已到账' : '待确认' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="paymentDate" label="回款日期" width="120" />
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
              <p>负责人: {{ followup.userName }}</p>
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

const route = useRoute()
const activeTab = ref('360')

const customer = reactive({
  id: '1',
  name: '科技有限公司',
  type: 'enterprise',
  level: 'strategic',
  contactName: '张三',
  contactPhone: '13800138000',
  email: 'contact@example.com',
  address: '北京市海淀区中关村大街1号',
  ownerName: '李四',
  createdAt: '2024-01-10 10:00:00',
  updatedAt: '2024-01-15 15:30:00'
})

const statistics = reactive({
  totalOpportunities: 15,
  activeOpportunities: 5,
  wonOpportunities: 8,
  totalProjects: 10,
  activeProjects: 3,
  completedProjects: 7,
  totalContractAmount: 5000000,
  totalPaymentAmount: 3500000,
  pendingPaymentAmount: 1500000
})

const opportunities = ref([
  { id: '1', name: 'CRM系统开发', amount: 500000, stage: '需求确认', status: 'active', createdAt: '2024-01-10' },
  { id: '2', name: 'ERP系统升级', amount: 800000, stage: '已成交', status: 'won', createdAt: '2024-01-05' }
])

const projects = ref([
  { id: '1', name: 'CRM系统开发项目', type: '软件开发', status: 'in_progress', progress: 60, createdAt: '2024-01-10' },
  { id: '2', name: 'ERP系统升级项目', type: '系统集成', status: 'completed', progress: 100, createdAt: '2023-12-01' }
])

const contracts = ref([
  { id: '1', contractNo: 'HT2024001', name: 'CRM系统开发合同', amount: 500000, status: 'active', signedAt: '2024-01-15' },
  { id: '2', contractNo: 'HT2024002', name: 'ERP系统升级合同', amount: 800000, status: 'completed', signedAt: '2023-12-10' }
])

const payments = ref([
  { id: '1', paymentNo: 'HK2024001', amount: 200000, paymentMethod: '银行转账', status: 'received', paymentDate: '2024-01-20' },
  { id: '2', paymentNo: 'HK2024002', amount: 300000, paymentMethod: '银行转账', status: 'pending', paymentDate: '2024-02-20' }
])

const followups = ref([
  { id: '1', type: '电话沟通', content: '与客户确认了项目需求', userName: '李四', createdAt: '2024-01-15 10:00' },
  { id: '2', type: '现场拜访', content: '到客户现场进行需求调研', userName: '王五', createdAt: '2024-01-12 14:00' }
])

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    enterprise: '企业客户',
    government: '政府机构',
    education: '教育机构'
  }
  return texts[type] || type
}

const getLevelText = (level: string) => {
  const texts: Record<string, string> = {
    strategic: '战略客户',
    important: '重要客户',
    normal: '普通客户'
  }
  return texts[level] || level
}

const getLevelType = (level: string) => {
  const types: Record<string, any> = {
    strategic: 'danger',
    important: 'warning',
    normal: 'info'
  }
  return types[level] || 'info'
}

const getProjectStatusType = (status: string) => {
  const types: Record<string, any> = {
    presale: 'primary',
    in_progress: 'warning',
    delivery: 'info',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getProjectStatusText = (status: string) => {
  const texts: Record<string, string> = {
    presale: '售前阶段',
    in_progress: '进行中',
    delivery: '交付中',
    completed: '已完成'
  }
  return texts[status] || status
}

const getContractStatusType = (status: string) => {
  const types: Record<string, any> = {
    draft: 'info',
    active: 'primary',
    completed: 'success',
    terminated: 'danger'
  }
  return types[status] || 'info'
}

const getContractStatusText = (status: string) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    active: '执行中',
    completed: '已完成',
    terminated: '已终止'
  }
  return texts[status] || status
}

const handleEdit = () => {
  // TODO: 编辑客户信息
}

onMounted(() => {
  const view = route.query.view
  if (view) {
    activeTab.value = view as string
  }
})
</script>

<style scoped>
.customer-detail {
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

.el-statistic {
  margin-bottom: 20px;
}
</style>
