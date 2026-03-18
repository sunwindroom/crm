import type { Milestone } from '@/types'

/**
 * 计算项目进度百分比
 * @param milestones 里程碑列表
 * @returns 进度百分比 (0-100)
 */
export const calculateProjectProgress = (milestones: Milestone[]): number => {
  if (!milestones || milestones.length === 0) {
    return 0
  }

  const completedCount = milestones.filter(m => m.status === 'completed').length
  const totalCount = milestones.length

  return Math.round((completedCount / totalCount) * 100)
}

/**
 * 计算加权项目进度(考虑里程碑重要程度)
 * @param milestones 里程碑列表
 * @returns 加权进度百分比 (0-100)
 */
export const calculateWeightedProgress = (milestones: Milestone[]): number => {
  if (!milestones || milestones.length === 0) {
    return 0
  }

  // 假设每个里程碑权重为1,可以根据需要调整
  const totalWeight = milestones.length
  const completedWeight = milestones.filter(m => m.status === 'completed').length

  return Math.round((completedWeight / totalWeight) * 100)
}

/**
 * 获取项目进度状态
 * @param progress 进度百分比
 * @returns 进度状态
 */
export const getProgressStatus = (progress: number): 'normal' | 'warning' | 'danger' => {
  if (progress >= 80) return 'normal'
  if (progress >= 50) return 'warning'
  return 'danger'
}

/**
 * 获取项目进度颜色
 * @param progress 进度百分比
 * @returns 进度颜色
 */
export const getProgressColor = (progress: number): string => {
  if (progress === 100) return '#67c23a'
  if (progress >= 80) return '#409eff'
  if (progress >= 50) return '#e6a23c'
  return '#f56c6c'
}

/**
 * 计算项目预计剩余时间
 * @param milestones 里程碑列表
 * @returns 剩余天数
 */
export const calculateRemainingDays = (milestones: Milestone[]): number => {
  if (!milestones || milestones.length === 0) {
    return 0
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 找到最后一个未完成的里程碑
  const pendingMilestones = milestones
    .filter(m => m.status !== 'completed')
    .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())

  if (pendingMilestones.length === 0) {
    return 0
  }

  const lastPendingMilestone = pendingMilestones[pendingMilestones.length - 1]
  const lastDate = new Date(lastPendingMilestone.plannedDate)
  lastDate.setHours(0, 0, 0, 0)

  const diffTime = lastDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

/**
 * 检查项目是否延期
 * @param milestones 里程碑列表
 * @returns 是否延期
 */
export const isProjectDelayed = (milestones: Milestone[]): boolean => {
  if (!milestones || milestones.length === 0) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 检查是否有未完成且已过期的里程碑
  return milestones.some(m => {
    if (m.status === 'completed') return false

    const plannedDate = new Date(m.plannedDate)
    plannedDate.setHours(0, 0, 0, 0)

    return today > plannedDate
  })
}

/**
 * 获取延期里程碑数量
 * @param milestones 里程碑列表
 * @returns 延期里程碑数量
 */
export const getDelayedMilestoneCount = (milestones: Milestone[]): number => {
  if (!milestones || milestones.length === 0) {
    return 0
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return milestones.filter(m => {
    if (m.status === 'completed' || m.status === 'delayed') return false

    const plannedDate = new Date(m.plannedDate)
    plannedDate.setHours(0, 0, 0, 0)

    return today > plannedDate
  }).length
}

/**
 * 获取项目统计信息
 * @param milestones 里程碑列表
 * @returns 统计信息
 */
export const getProjectStats = (milestones: Milestone[]) => {
  const total = milestones.length
  const completed = milestones.filter(m => m.status === 'completed').length
  const inProgress = milestones.filter(m => m.status === 'in_progress').length
  const notStarted = milestones.filter(m => m.status === 'not_started').length
  const delayed = milestones.filter(m => m.status === 'delayed').length
  const delayedCount = getDelayedMilestoneCount(milestones)

  const progress = calculateProjectProgress(milestones)
  const remainingDays = calculateRemainingDays(milestones)
  const isDelayed = isProjectDelayed(milestones)

  return {
    total,
    completed,
    inProgress,
    notStarted,
    delayed,
    delayedCount,
    progress,
    remainingDays,
    isDelayed
  }
}

/**
 * 获取即将到期的里程碑(7天内)
 * @param milestones 里程碑列表
 * @returns 即将到期的里程碑列表
 */
export const getUpcomingMilestones = (milestones: Milestone[]): Milestone[] => {
  if (!milestones || milestones.length === 0) {
    return []
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

  return milestones.filter(m => {
    if (m.status === 'completed') return false

    const plannedDate = new Date(m.plannedDate)
    plannedDate.setHours(0, 0, 0, 0)

    return plannedDate >= today && plannedDate <= sevenDaysLater
  })
}

/**
 * 获取进度建议
 * @param stats 项目统计信息
 * @returns 进度建议
 */
export const getProgressSuggestion = (stats: ReturnType<typeof getProjectStats>): string => {
  if (stats.progress === 100) {
    return '项目已完成,恭喜!'
  }

  if (stats.isDelayed) {
    return `项目已延期,有 ${stats.delayedCount} 个里程碑未按计划完成,建议加快进度。`
  }

  if (stats.remainingDays <= 7 && stats.progress < 80) {
    return '项目即将到期,进度较慢,建议优先处理关键里程碑。'
  }

  if (stats.progress >= 80) {
    return '项目进展顺利,继续保持。'
  }

  if (stats.progress >= 50) {
    return '项目进展正常,注意控制进度。'
  }

  return '项目刚开始,建议制定详细的执行计划。'
}
