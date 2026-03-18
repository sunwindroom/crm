import { ElNotification } from 'element-plus'
import type { Milestone } from '@/types'

/**
 * 通知类型
 */
export type NotificationType = 'milestone_due' | 'milestone_delayed' | 'milestone_completed' | 'assignment' | 'system'

/**
 * 通知接口
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
}

/**
 * 检查里程碑是否即将到期(7天内)
 */
export const checkMilestoneDue = (milestone: Milestone): boolean => {
  if (milestone.status === 'completed') return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const plannedDate = new Date(milestone.plannedDate)
  plannedDate.setHours(0, 0, 0, 0)

  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

  return plannedDate >= today && plannedDate <= sevenDaysLater
}

/**
 * 检查里程碑是否已延期
 */
export const checkMilestoneDelayed = (milestone: Milestone): boolean => {
  if (milestone.status === 'completed') return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const plannedDate = new Date(milestone.plannedDate)
  plannedDate.setHours(0, 0, 0, 0)

  return today > plannedDate
}

/**
 * 获取剩余天数
 */
export const getRemainingDays = (plannedDate: string): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(plannedDate)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

/**
 * 发送里程碑到期提醒
 */
export const sendMilestoneDueNotification = (milestone: Milestone) => {
  const remainingDays = getRemainingDays(milestone.plannedDate)

  ElNotification({
    title: '里程碑即将到期',
    message: `里程碑"${milestone.name}"将在 ${remainingDays} 天后到期,请注意跟进。`,
    type: 'warning',
    duration: 0,
    position: 'top-right'
  })
}

/**
 * 发送里程碑延期提醒
 */
export const sendMilestoneDelayedNotification = (milestone: Milestone) => {
  const delayedDays = Math.abs(getRemainingDays(milestone.plannedDate))

  ElNotification({
    title: '里程碑已延期',
    message: `里程碑"${milestone.name}"已延期 ${delayedDays} 天,请及时处理。`,
    type: 'error',
    duration: 0,
    position: 'top-right'
  })
}

/**
 * 发送里程碑完成通知
 */
export const sendMilestoneCompletedNotification = (milestone: Milestone) => {
  ElNotification({
    title: '里程碑已完成',
    message: `恭喜!里程碑"${milestone.name}"已成功完成。`,
    type: 'success',
    duration: 3000,
    position: 'top-right'
  })
}

/**
 * 发送分配通知
 */
export const sendAssignmentNotification = (assigneeName: string, itemType: string, itemName: string) => {
  ElNotification({
    title: '新的分配',
    message: `您被分配了新的${itemType}: ${itemName}`,
    type: 'info',
    duration: 5000,
    position: 'top-right'
  })
}

/**
 * 检查并发送里程碑提醒
 */
export const checkAndSendMilestoneNotifications = (milestones: Milestone[]) => {
  milestones.forEach(milestone => {
    // 检查即将到期
    if (checkMilestoneDue(milestone)) {
      sendMilestoneDueNotification(milestone)
    }

    // 检查已延期
    if (checkMilestoneDelayed(milestone)) {
      sendMilestoneDelayedNotification(milestone)
    }
  })
}

/**
 * 定时检查里程碑提醒
 */
let notificationTimer: number | null = null

export const startMilestoneNotificationCheck = (
  milestones: Milestone[],
  interval: number = 60000 // 默认每分钟检查一次
) => {
  // 清除之前的定时器
  if (notificationTimer !== null) {
    clearInterval(notificationTimer)
  }

  // 立即检查一次
  checkAndSendMilestoneNotifications(milestones)

  // 启动定时检查
  notificationTimer = window.setInterval(() => {
    checkAndSendMilestoneNotifications(milestones)
  }, interval)
}

/**
 * 停止里程碑提醒检查
 */
export const stopMilestoneNotificationCheck = () => {
  if (notificationTimer !== null) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }
}

/**
 * 创建通知记录
 */
export const createNotificationRecord = (
  type: NotificationType,
  title: string,
  message: string,
  data?: any
): Notification => {
  return {
    id: Date.now().toString(),
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString()
  }
}

/**
 * 保存通知到本地存储
 */
export const saveNotification = (notification: Notification) => {
  const notifications = getNotifications()
  notifications.unshift(notification)

  // 只保留最近100条通知
  if (notifications.length > 100) {
    notifications.length = 100
  }

  localStorage.setItem('notifications', JSON.stringify(notifications))
}

/**
 * 获取所有通知
 */
export const getNotifications = (): Notification[] => {
  const notifications = localStorage.getItem('notifications')
  return notifications ? JSON.parse(notifications) : []
}

/**
 * 标记通知为已读
 */
export const markNotificationAsRead = (id: string) => {
  const notifications = getNotifications()
  const notification = notifications.find(n => n.id === id)

  if (notification) {
    notification.read = true
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }
}

/**
 * 标记所有通知为已读
 */
export const markAllNotificationsAsRead = () => {
  const notifications = getNotifications()
  notifications.forEach(n => n.read = true)
  localStorage.setItem('notifications', JSON.stringify(notifications))
}

/**
 * 清除已读通知
 */
export const clearReadNotifications = () => {
  const notifications = getNotifications()
  const unreadNotifications = notifications.filter(n => !n.read)
  localStorage.setItem('notifications', JSON.stringify(unreadNotifications))
}

/**
 * 获取未读通知数量
 */
export const getUnreadNotificationCount = (): number => {
  const notifications = getNotifications()
  return notifications.filter(n => !n.read).length
}
