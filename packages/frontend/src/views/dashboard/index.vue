<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalLeads }}</div>
              <div class="stat-label">总线索数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCustomers }}</div>
              <div class="stat-label">总客户数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon><Files /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeProjects }}</div>
              <div class="stat-label">进行中项目</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatMoney(stats.totalRevenue) }}</div>
              <div class="stat-label">本月回款</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
            </div>
          </template>
          <div ref="salesChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>项目状态分布</span>
            </div>
          </template>
          <div ref="projectChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="list-row">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待跟进线索</span>
              <el-button type="primary" link @click="$router.push('/leads')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="pendingLeads" style="width: 100%">
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="company" label="公司" />
            <el-table-column prop="source" label="来源" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getLeadStatusType(row.status)">
                  {{ getLeadStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>近期里程碑</span>
              <el-button type="primary" link @click="$router.push('/projects')">
                查看全部
              </el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="milestone in recentMilestones"
              :key="milestone.id"
              :timestamp="milestone.plannedDate"
              placement="top"
            >
              <el-card>
                <h4>{{ milestone.name }}</h4>
                <p>项目: {{ milestone.projectName }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

const salesChartRef = ref<HTMLElement>()
const projectChartRef = ref<HTMLElement>()
let salesChart: ECharts | null = null
let projectChart: ECharts | null = null

const stats = ref({
  totalLeads: 156,
  totalCustomers: 89,
  activeProjects: 23,
  totalRevenue: 1256800
})

const pendingLeads = ref([
  { id: 1, name: '张三', company: '科技有限公司', source: '官网', status: 'new' },
  { id: 2, name: '李四', company: '网络科技公司', source: '推荐', status: 'contacted' },
  { id: 3, name: '王五', company: '信息技术公司', source: '展会', status: 'new' }
])

const recentMilestones = ref([
  { id: 1, name: '需求确认', projectName: 'CRM系统开发', plannedDate: '2024-01-15' },
  { id: 2, name: '系统上线', projectName: 'ERP系统升级', plannedDate: '2024-01-20' },
  { id: 3, name: '验收测试', projectName: '移动APP开发', plannedDate: '2024-01-25' }
])

const formatMoney = (value: number) => {
  return (value / 10000).toFixed(2) + '万'
}

const getLeadStatusType = (status: string) => {
  const types: Record<string, any> = {
    new: 'primary',
    contacted: 'warning',
    qualified: 'success',
    lost: 'danger'
  }
  return types[status] || 'info'
}

const getLeadStatusText = (status: string) => {
  const texts: Record<string, string> = {
    new: '新线索',
    contacted: '已联系',
    qualified: '已验证',
    lost: '已丢失'
  }
  return texts[status] || status
}

const initCharts = () => {
  // 销售趋势图
  if (salesChartRef.value) {
    salesChart = echarts.init(salesChartRef.value)
    const salesOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['线索数', '客户数', '合同金额']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '线索数',
          type: 'line',
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '客户数',
          type: 'line',
          data: [20, 18, 31, 34, 40, 50, 45]
        },
        {
          name: '合同金额',
          type: 'line',
          data: [50, 80, 60, 120, 150, 180, 200]
        }
      ]
    }
    salesChart.setOption(salesOption)
  }

  // 项目状态分布图
  if (projectChartRef.value) {
    projectChart = echarts.init(projectChartRef.value)
    const projectOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '项目状态',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 10, name: '售前阶段' },
            { value: 15, name: '开发中' },
            { value: 8, name: '实施中' },
            { value: 5, name: '已验收' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    projectChart.setOption(projectOption)
  }
}

const handleResize = () => {
  salesChart?.resize()
  projectChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  salesChart?.dispose()
  projectChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.list-row {
  margin-bottom: 20px;
}
</style>
