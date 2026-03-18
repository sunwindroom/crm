<template>
  <div class="report-page">
    <el-row :gutter="20" class="filter-row">
      <el-col :span="18">
        <el-form :model="filterForm" inline>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="部门">
            <el-select v-model="filterForm.department" placeholder="请选择" clearable>
              <el-option label="销售部" value="sales" />
              <el-option label="售前部" value="presale" />
              <el-option label="研发部" value="dev" />
              <el-option label="实施部" value="impl" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">查询</el-button>
            <el-button @click="handleExport">导出报表</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <el-statistic title="新增线索" :value="stats.newLeads">
            <template #suffix>
              <span style="font-size: 14px">条</span>
            </template>
          </el-statistic>
          <div class="stat-footer">
            <span :class="stats.newLeadsTrend >= 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="stats.newLeadsTrend >= 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              {{ Math.abs(stats.newLeadsTrend) }}%
            </span>
            <span class="compare-text">较上期</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <el-statistic title="新增客户" :value="stats.newCustomers">
            <template #suffix>
              <span style="font-size: 14px">家</span>
            </template>
          </el-statistic>
          <div class="stat-footer">
            <span :class="stats.newCustomersTrend >= 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="stats.newCustomersTrend >= 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              {{ Math.abs(stats.newCustomersTrend) }}%
            </span>
            <span class="compare-text">较上期</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <el-statistic title="合同金额" :value="stats.contractAmount" prefix="¥">
            <template #suffix>
              <span style="font-size: 14px">万</span>
            </template>
          </el-statistic>
          <div class="stat-footer">
            <span :class="stats.contractAmountTrend >= 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="stats.contractAmountTrend >= 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              {{ Math.abs(stats.contractAmountTrend) }}%
            </span>
            <span class="compare-text">较上期</span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <el-statistic title="回款金额" :value="stats.paymentAmount" prefix="¥">
            <template #suffix>
              <span style="font-size: 14px">万</span>
            </template>
          </el-statistic>
          <div class="stat-footer">
            <span :class="stats.paymentAmountTrend >= 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="stats.paymentAmountTrend >= 0"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              {{ Math.abs(stats.paymentAmountTrend) }}%
            </span>
            <span class="compare-text">较上期</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
              <el-radio-group v-model="salesChartType" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="salesChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>商机阶段分布</span>
            </div>
          </template>
          <div ref="opportunityChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>客户行业分布</span>
            </div>
          </template>
          <div ref="industryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>项目状态统计</span>
            </div>
          </template>
          <div ref="projectChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="table-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售排行榜</span>
              <el-radio-group v-model="rankType" size="small">
                <el-radio-button label="amount">合同金额</el-radio-button>
                <el-radio-button label="payment">回款金额</el-radio-button>
                <el-radio-button label="customer">客户数量</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <el-table :data="rankData" border>
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="userName" label="姓名" width="120" />
            <el-table-column prop="department" label="部门" width="150" />
            <el-table-column prop="contractCount" label="合同数" width="100" />
            <el-table-column prop="contractAmount" label="合同金额" width="150">
              <template #default="{ row }">¥{{ formatMoney(row.contractAmount) }}</template>
            </el-table-column>
            <el-table-column prop="paymentAmount" label="回款金额" width="150">
              <template #default="{ row }">¥{{ formatMoney(row.paymentAmount) }}</template>
            </el-table-column>
            <el-table-column prop="customerCount" label="客户数" width="100" />
            <el-table-column prop="completionRate" label="完成率" width="150">
              <template #default="{ row }">
                <el-progress :percentage="row.completionRate" :color="getProgressColor(row.completionRate)" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { ElMessage } from 'element-plus'

const salesChartRef = ref<HTMLElement>()
const opportunityChartRef = ref<HTMLElement>()
const industryChartRef = ref<HTMLElement>()
const projectChartRef = ref<HTMLElement>()

let salesChart: ECharts | null = null
let opportunityChart: ECharts | null = null
let industryChart: ECharts | null = null
let projectChart: ECharts | null = null

const filterForm = reactive({
  dateRange: [],
  department: ''
})

const salesChartType = ref('month')
const rankType = ref('amount')

const stats = reactive({
  newLeads: 156,
  newLeadsTrend: 12.5,
  newCustomers: 89,
  newCustomersTrend: 8.3,
  contractAmount: 1256.8,
  contractAmountTrend: 15.2,
  paymentAmount: 986.5,
  paymentAmountTrend: 10.8
})

const rankData = ref([
  { userName: '张三', department: '销售部', contractCount: 15, contractAmount: 5000000, paymentAmount: 3500000, customerCount: 12, completionRate: 95 },
  { userName: '李四', department: '销售部', contractCount: 12, contractAmount: 4200000, paymentAmount: 3000000, customerCount: 10, completionRate: 88 },
  { userName: '王五', department: '销售部', contractCount: 10, contractAmount: 3800000, paymentAmount: 2800000, customerCount: 8, completionRate: 82 },
  { userName: '赵六', department: '销售部', contractCount: 8, contractAmount: 3200000, paymentAmount: 2500000, customerCount: 7, completionRate: 75 },
  { userName: '钱七', department: '销售部', contractCount: 6, contractAmount: 2800000, paymentAmount: 2200000, customerCount: 6, completionRate: 70 }
])

const formatMoney = (value: number) => {
  return (value / 10000).toFixed(2) + '万'
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  return '#f56c6c'
}

const initCharts = () => {
  // 销售趋势图
  if (salesChartRef.value) {
    salesChart = echarts.init(salesChartRef.value)
    updateSalesChart()
  }

  // 商机阶段分布图
  if (opportunityChartRef.value) {
    opportunityChart = echarts.init(opportunityChartRef.value)
    const opportunityOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '商机阶段',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 35, name: '初步接触' },
            { value: 28, name: '需求确认' },
            { value: 22, name: '方案报价' },
            { value: 15, name: '商务谈判' },
            { value: 10, name: '已成交' }
          ]
        }
      ]
    }
    opportunityChart.setOption(opportunityOption)
  }

  // 客户行业分布图
  if (industryChartRef.value) {
    industryChart = echarts.init(industryChartRef.value)
    const industryOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: ['IT/互联网', '金融', '制造业', '教育', '医疗', '政府']
      },
      series: [
        {
          name: '客户数量',
          type: 'bar',
          data: [45, 32, 28, 20, 15, 12],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }
      ]
    }
    industryChart.setOption(industryOption)
  }

  // 项目状态统计图
  if (projectChartRef.value) {
    projectChart = echarts.init(projectChartRef.value)
    const projectOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: '项目状态',
          type: 'pie',
          radius: ['0%', '60%'],
          data: [
            { value: 15, name: '售前阶段', itemStyle: { color: '#409eff' } },
            { value: 25, name: '开发中', itemStyle: { color: '#e6a23c' } },
            { value: 18, name: '实施中', itemStyle: { color: '#67c23a' } },
            { value: 12, name: '已验收', itemStyle: { color: '#909399' } }
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

const updateSalesChart = () => {
  if (!salesChart) return

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const salesOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['合同金额', '回款金额', '新增客户']
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
      data: months
    },
    yAxis: [
      {
        type: 'value',
        name: '金额(万)',
        position: 'left'
      },
      {
        type: 'value',
        name: '客户数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '合同金额',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      },
      {
        name: '回款金额',
        type: 'line',
        smooth: true,
        data: [80, 92, 71, 104, 70, 190, 170, 142, 151, 194, 250, 290],
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '新增客户',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: [8, 10, 7, 12, 6, 15, 13, 11, 14, 16, 18, 20],
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }
  salesChart.setOption(salesOption)
}

const handleResize = () => {
  salesChart?.resize()
  opportunityChart?.resize()
  industryChart?.resize()
  projectChart?.resize()
}

const handleFilter = () => {
  ElMessage.success('筛选条件已更新')
  initCharts()
}

const handleExport = () => {
  ElMessage.success('报表导出功能开发中')
}

watch(salesChartType, () => {
  updateSalesChart()
})

watch(rankType, () => {
  ElMessage.success('排行榜数据已更新')
})

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  salesChart?.dispose()
  opportunityChart?.dispose()
  industryChart?.dispose()
  projectChart?.dispose()
})
</script>

<style scoped>
.report-page {
  padding: 0;
}

.filter-row {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-footer {
  margin-top: 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.trend-up {
  color: #67c23a;
  margin-right: 5px;
}

.trend-down {
  color: #f56c6c;
  margin-right: 5px;
}

.compare-text {
  color: #909399;
}

.chart-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.table-row {
  margin-bottom: 20px;
}
</style>
