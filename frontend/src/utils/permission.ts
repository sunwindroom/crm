import { useAuthStore } from '@/stores/auth'
import type { User, UserRole, Permission } from '@/types'

/**
 * 角色权限配置
 */
const rolePermissions: Record<UserRole, Permission[]> = {
  // 管理员 - 所有权限
  admin: [
    'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
    'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
    'project_create', 'project_view', 'project_edit', 'project_delete',
    'contract_create', 'contract_view', 'contract_edit', 'contract_delete',
    'payment_create', 'payment_view', 'payment_edit', 'payment_delete',
    'user_create', 'user_view', 'user_edit', 'user_delete',
    'role_view', 'role_edit',
    'report_view', 'dashboard_view'
  ],
  // 总裁 - 查看所有数据,分配权限
  ceo: [
    'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
    'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
    'project_view', 'project_edit',
    'contract_view', 'contract_edit',
    'payment_view',
    'user_view', 'user_create', 'user_edit',
    'role_view',
    'report_view', 'dashboard_view'
  ],
  // 技术副总 - 查看所有数据,管理项目
  cto: [
    'lead_view',
    'customer_view',
    'project_create', 'project_view', 'project_edit', 'project_delete',
    'contract_view',
    'payment_view',
    'user_view',
    'report_view', 'dashboard_view'
  ],
  // 营销副总 - 查看所有数据,分配权限
  cmo: [
    'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
    'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
    'project_view',
    'contract_view',
    'payment_view',
    'user_view', 'user_create', 'user_edit',
    'role_view',
    'report_view', 'dashboard_view'
  ],
  // 销售经理 - 查看自己和下属数据,分配给下属
  sales_manager: [
    'lead_create', 'lead_view', 'lead_edit', 'lead_delete', 'lead_assign', 'lead_convert',
    'customer_create', 'customer_view', 'customer_edit', 'customer_delete',
    'project_view',
    'contract_view',
    'payment_view',
    'user_view',
    'report_view', 'dashboard_view'
  ],
  // 销售 - 查看自己数据,基本操作
  sales: [
    'lead_create', 'lead_view', 'lead_edit', 'lead_convert',
    'customer_create', 'customer_view', 'customer_edit',
    'project_view',
    'contract_view',
    'payment_view',
    'dashboard_view'
  ],
  // 项目经理 - 查看项目相关数据
  project_manager: [
    'lead_view',
    'customer_view',
    'project_create', 'project_view', 'project_edit',
    'contract_view',
    'payment_view',
    'dashboard_view'
  ],
  // 商务 - 查看所有数据,只读权限
  business: [
    'lead_view',
    'customer_view',
    'project_view',
    'contract_view',
    'payment_view',
    'report_view', 'dashboard_view'
  ],
  // 财务 - 查看所有数据,只读权限
  finance: [
    'lead_view',
    'customer_view',
    'project_view',
    'contract_view',
    'payment_view',
    'report_view', 'dashboard_view'
  ]
}

/**
 * 角色层级关系
 * 数字越大,级别越高
 */
const roleHierarchy: Record<UserRole, number> = {
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

/**
 * 获取当前用户
 */
export const getCurrentUser = (): User | null => {
  const authStore = useAuthStore()
  return authStore.user
}

/**
 * 获取当前用户角色
 */
export const getCurrentUserRole = (): UserRole => {
  const user = getCurrentUser()
  return user?.role || 'sales'
}

/**
 * 检查用户是否有指定权限
 */
export const hasPermission = (permission: Permission): boolean => {
  const user = getCurrentUser()
  if (!user) return false

  const permissions = rolePermissions[user.role] || []
  return permissions.includes(permission)
}

/**
 * 检查是否可以分配给指定角色
 */
export const canAssignToRole = (targetRole: UserRole): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false

  const currentRole = currentUser.role

  // 管理员可以分配给所有人
  if (currentRole === 'admin') return true

  // 总裁可以分配给除项目经理以外的所有人
  if (currentRole === 'ceo' && targetRole !== 'project_manager') return true

  // 副总可以分配给除总裁、项目经理以外的所有人
  if ((currentRole === 'cto' || currentRole === 'cmo') && 
      targetRole !== 'ceo' && 
      targetRole !== 'admin' && 
      targetRole !== 'project_manager') return true

  // 销售经理只能分配给自己管辖的人(销售)
  if (currentRole === 'sales_manager' && targetRole === 'sales') return true

  return false
}

/**
 * 获取可分配的角色列表
 */
export const getAssignableRoles = (): UserRole[] => {
  const currentUser = getCurrentUser()
  if (!currentUser) return []

  const currentRole = currentUser.role
  const allRoles: UserRole[] = ['admin', 'ceo', 'cto', 'cmo', 'sales_manager', 'sales', 'project_manager', 'business', 'finance']

  return allRoles.filter(role => canAssignToRole(role))
}

/**
 * 获取角色显示名称
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const names: Record<UserRole, string> = {
    admin: '管理员',
    ceo: '总裁',
    cto: '技术副总',
    cmo: '营销副总',
    sales_manager: '销售经理',
    sales: '销售',
    project_manager: '项目经理',
    business: '商务',
    finance: '财务'
  }
  return names[role] || role
}

/**
 * 获取角色显示颜色
 */
export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    admin: 'danger',
    ceo: 'danger',
    cto: 'warning',
    cmo: 'warning',
    sales_manager: 'primary',
    sales: 'success',
    project_manager: 'primary',
    business: 'info',
    finance: 'info'
  }
  return colors[role] || 'info'
}

/**
 * 检查是否可以查看指定用户的数据
 */
export const canViewUserData = (targetUserId: string): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false

  const currentRole = currentUser.role

  // 管理员、总裁、副总、商务、财务可以查看所有数据
  if (['admin', 'ceo', 'cto', 'cmo', 'business', 'finance'].includes(currentRole)) {
    return true
  }

  // 销售经理可以查看自己和下属的数据
  if (currentRole === 'sales_manager') {
    return currentUser.id === targetUserId || 
           (currentUser.subordinateIds?.includes(targetUserId) || false)
  }

  // 其他角色只能查看自己的数据
  return currentUser.id === targetUserId
}

/**
 * 检查是否可以编辑指定的线索
 */
export const canEditLead = (lead: any): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false

  const currentRole = currentUser.role

  // 检查基础权限
  if (!hasPermission('lead_edit')) return false

  // 管理员、总裁、副总可以编辑所有线索
  if (['admin', 'ceo', 'cto', 'cmo'].includes(currentRole)) return true

  // 商务、财务不能编辑
  if (['business', 'finance'].includes(currentRole)) return false

  // 销售经理可以编辑自己和下属的线索
  if (currentRole === 'sales_manager') {
    return lead.createdBy === currentUser.id || 
           lead.assignedTo === currentUser.id ||
           (currentUser.subordinateIds?.includes(lead.assignedTo || '') || false)
  }

  // 其他角色只能编辑自己的线索
  return lead.createdBy === currentUser.id || lead.assignedTo === currentUser.id
}

/**
 * 检查是否可以分配指定的线索
 */
export const canAssignLead = (lead: any, targetUserId: string, targetUserRole: UserRole): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false

  // 检查基础权限
  if (!hasPermission('lead_assign')) return false

  // 检查是否可以分配给目标角色
  if (!canAssignToRole(targetUserRole)) return false

  // 检查是否可以编辑该线索
  if (!canEditLead(lead)) return false

  return true
}

/**
 * 检查是否可以删除指定的线索
 */
export const canDeleteLead = (lead: any): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false

  const currentRole = currentUser.role

  // 检查基础权限
  if (!hasPermission('lead_delete')) return false

  // 商务、财务不能删除
  if (['business', 'finance'].includes(currentRole)) return false

  // 管理员、总裁、副总可以删除所有线索
  if (['admin', 'ceo', 'cto', 'cmo'].includes(currentRole)) return true

  // 销售经理可以删除自己和下属的线索
  if (currentRole === 'sales_manager') {
    return lead.createdBy === currentUser.id || 
           (currentUser.subordinateIds?.includes(lead.assignedTo || '') || false)
  }

  // 其他角色只能删除自己创建的线索
  return lead.createdBy === currentUser.id
}

/**
 * 获取用户可查看的数据过滤条件
 */
export const getDataFilter = (): any => {
  const currentUser = getCurrentUser()
  if (!currentUser) return {}

  const currentRole = currentUser.role

  // 管理员、总裁、副总、商务、财务可以查看所有数据
  if (['admin', 'ceo', 'cto', 'cmo', 'business', 'finance'].includes(currentRole)) {
    return {}
  }

  // 销售经理可以查看自己和下属的数据
  if (currentRole === 'sales_manager') {
    const userIds = [currentUser.id, ...(currentUser.subordinateIds || [])]
    return {
      $or: [
        { createdBy: { $in: userIds } },
        { assignedTo: { $in: userIds } }
      ]
    }
  }

  // 项目经理只能查看项目相关的数据(这里简化处理)
  if (currentRole === 'project_manager') {
    return {
      assignedTo: currentUser.id
    }
  }

  // 其他角色只能查看自己的数据
  return {
    $or: [
      { createdBy: currentUser.id },
      { assignedTo: currentUser.id }
    ]
  }
}

/**
 * 过滤线索列表(根据权限)
 */
export const filterLeadsByPermission = (leads: any[]): any[] => {
  const currentUser = getCurrentUser()
  if (!currentUser) return []

  const currentRole = currentUser.role

  // 管理员、总裁、副总、商务、财务可以查看所有线索
  if (['admin', 'ceo', 'cto', 'cmo', 'business', 'finance'].includes(currentRole)) {
    return leads
  }

  // 销售经理可以查看自己和下属的线索
  if (currentRole === 'sales_manager') {
    const userIds = [currentUser.id, ...(currentUser.subordinateIds || [])]
    return leads.filter(lead => 
      userIds.includes(lead.createdBy) || 
      userIds.includes(lead.assignedTo || '')
    )
  }

  // 其他角色只能查看自己的线索
  return leads.filter(lead => 
    lead.createdBy === currentUser.id || 
    lead.assignedTo === currentUser.id
  )
}

/**
 * 检查是否可以管理用户
 */
export const canManageUsers = (): boolean => {
  const currentRole = getCurrentUserRole()
  return ['admin', 'ceo', 'cto', 'cmo'].includes(currentRole)
}

/**
 * 检查是否可以管理角色
 */
export const canManageRoles = (): boolean => {
  const currentRole = getCurrentUserRole()
  return currentRole === 'admin'
}

/**
 * 获取所有角色列表
 */
export const getAllRoles = (): Array<{ value: UserRole; label: string; color: string }> => {
  const roles: UserRole[] = ['admin', 'ceo', 'cto', 'cmo', 'sales_manager', 'sales', 'project_manager', 'business', 'finance']
  return roles.map(role => ({
    value: role,
    label: getRoleDisplayName(role),
    color: getRoleColor(role)
  }))
}
