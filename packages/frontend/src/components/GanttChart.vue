<template>
  <div class="gantt-chart">
    <div class="gantt-header">
      <div class="gantt-title">项目里程碑甘特图</div>
      <div class="gantt-legend">
        <span class="legend-item">
          <span class="legend-color not-started"></span>
          <span>待开始</span>
        </span>
        <span class="legend-item">
          <span class="legend-color in-progress"></span>
          <span>进行中</span>
        </span>
        <span class="legend-item">
          <span class="legend-color completed"></span>
          <span>已完成</span>
        </span>
        <span class="legend-item">
          <span class="legend-color delayed"></span>
          <span>已延期</span>
        </span>
      </div>
    </div>

    <div class="gantt-container">
      <!-- 时间轴 -->
      <div class="gantt-timeline">
        <div
          v-for="date in timelineDates"
          :key="date"
          class="timeline-date"
          :class="{ 'is-weekend': isWeekend(date) }"
        >
          <div class="date-label">{{ formatDate(date) }}</div>
        </div>
      </div>

      <!-- 里程碑列表 -->
      <div class="gantt-body">
        <div
          v-for="milestone in milestones"
          :key="milestone.id"
          class="gantt-row"
        >
          <!-- 里程碑名称 -->
          <div class="gantt-label">
            <div class="milestone-name">{{ milestone.name }}</div>
            <div class="milestone-info">
              <span class="assignee">{{ milestone.assigneeName || '未分配' }}</span>
              <el-tag size="small" :type="getMilestoneStatusType(milestone.status)">
                {{ getMilestoneStatusText(milestone.status) }}
              </el-tag>
            </div>
          </div>

          <!-- 里程碑进度条 -->
          <div class="gantt-bar-container">
            <div
              class="gantt-bar"
              :class="[
                `status-${milestone.status}`,
                { 'is-delayed': isDelayed(milestone) }
              ]"
              :style="getBarStyle(milestone)"
              @click="handleBarClick(milestone)"
            >
              <div class="bar-label">{{ milestone.name }}</div>
              <div class="bar-dates">
                {{ formatDate(milestone.plannedDate) }}
              </div>
            </div>

            <!-- 依赖线 -->
            <svg class="dependency-lines" v-if="milestone.dependencies && milestone.dependencies.length > 0">
              <line
                v-for="depId in milestone.dependencies"
                :key="depId"
                :x1="getDependencyLineX1(depId)"
                :y1="getDependencyLineY1(depId)"
                :x2="getDependencyLineX2(milestone)"
                :y2="getDependencyLineY2(milestone)"
                stroke="#909399"
                stroke-width="2"
                stroke-dasharray="5,5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="里程碑详情" width="500px">
      <div v-if="selectedMilestone" class="milestone-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="名称">{{ selectedMilestone.name }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ selectedMilestone.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getMilestoneStatusType(selectedMilestone.status)">
              {{ getMilestoneStatusText(selectedMilestone.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="计划日期">{{ selectedMilestone.plannedDate }}</el-descriptions-item>
          <el-descriptions-item label="实际日期">{{ selectedMilestone.actualDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ selectedMilestone.assigneeName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="依赖">
            <el-tag
              v-for="depId in selectedMilestone.dependencies"
              :key="depId"
              size="small"
              style="margin-right: 5px"
            >
              {{ getDependencyName(depId) }}
            </el-tag>
            <span v-if="!selectedMilestone.dependencies || selectedMilestone.dependencies.length === 0">-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Milestone } from '@/types'

interface Props {
  milestones: Milestone[]
  startDate?: string
  endDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  startDate: '',
  endDate: ''
})

const detailDialogVisible = ref(false)
const selectedMilestone = ref<Milestone | null>(null)

// 生成时间轴日期
const timelineDates = computed(() => {
  const start = props.startDate || getMinDate()
  const end = props.endDate || getMaxDate()

  const dates: string[] = []
  const current = new Date(start)
  const endDate = new Date(end)

  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
})

// 获取最小日期
const getMinDate = () => {
  if (props.milestones.length === 0) return new Date().toISOString().split('T')[0]

  const dates = props.milestones.map(m => m.plannedDate)
  return dates.reduce((min, date) => (date < min ? date : min), dates[0])
}

// 获取最大日期
const getMaxDate = () => {
  if (props.milestones.length === 0) {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  const dates = props.milestones.map(m => m.plannedDate)
  const maxDate = dates.reduce((max, date) => (date > max ? date : max), dates[0])

  // 延长30天
  const date = new Date(maxDate)
  date.setDate(date.getDate() + 30)
  return date.toISOString().split('T')[0]
}

// 格式化日期
const formatDate = (date: string) => {
  const d = new Date(date)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

// 判断是否为周末
const isWeekend = (date: string) => {
  const d = new Date(date)
  return d.getDay() === 0 || d.getDay() === 6
}

// 获取里程碑状态文本
const getMilestoneStatusText = (status: string) => {
  const texts: Record<string, string> = {
    not_started: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    delayed: '已延期'
  }
  return texts[status] || status
}

// 获取里程碑状态类型
const getMilestoneStatusType = (status: string) => {
  const types: Record<string, any> = {
    not_started: 'info',
    in_progress: 'warning',
    completed: 'success',
    delayed: 'danger'
  }
  return types[status] || 'info'
}

// 获取进度条样式
const getBarStyle = (milestone: Milestone) => {
  const startDate = props.startDate || getMinDate()
  const totalDays = timelineDates.value.length

  const startDiff = Math.floor(
    (new Date(milestone.plannedDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  const left = (startDiff / totalDays) * 100
  const width = 5 // 固定宽度,表示一天

  return {
    left: `${left}%`,
    width: `${width}%`
  }
}

// 判断是否延期
const isDelayed = (milestone: Milestone) => {
  if (milestone.status === 'completed') return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const plannedDate = new Date(milestone.plannedDate)
  return today > plannedDate
}

// 获取依赖线坐标
const getDependencyLineX1 = (depId: string) => {
  const depMilestone = props.milestones.find(m => m.id === depId)
  if (!depMilestone) return 0

  const startDate = props.startDate || getMinDate()
  const totalDays = timelineDates.value.length

  const startDiff = Math.floor(
    (new Date(depMilestone.plannedDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (startDiff / totalDays) * 100 + 5 // +5 是进度条宽度
}

const getDependencyLineY1 = (depId: string) => {
  const index = props.milestones.findIndex(m => m.id === depId)
  return (index + 1) * 50 // 每行高度50px
}

const getDependencyLineX2 = (milestone: Milestone) => {
  const startDate = props.startDate || getMinDate()
  const totalDays = timelineDates.value.length

  const startDiff = Math.floor(
    (new Date(milestone.plannedDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (startDiff / totalDays) * 100
}

const getDependencyLineY2 = (milestone: Milestone) => {
  const index = props.milestones.findIndex(m => m.id === milestone.id)
  return index * 50
}

// 获取依赖名称
const getDependencyName = (depId: string) => {
  const dep = props.milestones.find(m => m.id === depId)
  return dep ? dep.name : '未知'
}

// 点击进度条
const handleBarClick = (milestone: Milestone) => {
  selectedMilestone.value = milestone
  detailDialogVisible.value = true
}
</script>

<style scoped>
.gantt-chart {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.gantt-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.gantt-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #606266;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.not-started {
  background: #909399;
}

.legend-color.in-progress {
  background: #e6a23c;
}

.legend-color.completed {
  background: #67c23a;
}

.legend-color.delayed {
  background: #f56c6c;
}

.gantt-container {
  position: relative;
  min-width: 1000px;
}

.gantt-timeline {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
  margin-left: 200px;
}

.timeline-date {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-right: 1px solid #ebeef5;
  font-size: 12px;
  color: #606266;
}

.timeline-date.is-weekend {
  background: #fafafa;
}

.gantt-body {
  position: relative;
}

.gantt-row {
  display: flex;
  height: 50px;
  border-bottom: 1px solid #ebeef5;
}

.gantt-label {
  position: sticky;
  left: 0;
  width: 200px;
  padding: 10px;
  background: #fff;
  border-right: 2px solid #dcdfe6;
  z-index: 10;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
}

.milestone-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.milestone-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.assignee {
  color: #909399;
}

.gantt-bar-container {
  flex: 1;
  position: relative;
  height: 100%;
}

.gantt-bar {
  position: absolute;
  top: 10px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.gantt-bar:hover {
  transform: scaleY(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.gantt-bar.status-not-started {
  background: #909399;
}

.gantt-bar.status-in-progress {
  background: #e6a23c;
}

.gantt-bar.status-completed {
  background: #67c23a;
}

.gantt-bar.status-delayed {
  background: #f56c6c;
}

.gantt-bar.is-delayed {
  border: 2px solid #f56c6c;
}

.bar-label {
  padding: 5px;
  font-size: 11px;
  color: #fff;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-dates {
  padding: 0 5px;
  font-size: 10px;
  color: #fff;
  opacity: 0.9;
}

.dependency-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.milestone-detail {
  padding: 10px;
}

.milestone-detail :deep(.el-descriptions__label) {
  width: 100px;
}
</style>
