// 用户相关类型
export interface User {
  id: string
  username: string
  name: string
  phone: string
  email?: string
  department?: string
  position?: string
  avatar?: string
  role: UserRole
  status: UserStatus
  superiorId?: string // 上级ID
  superiorName?: string // 上级名称
  subordinateIds?: string[] // 下属ID列表
  createdAt: string
  updatedAt: string
}

export type UserRole = 
  | 'admin'         // 管理员
  | 'ceo'            // 总裁
  | 'cto'            // 技术副总
  | 'cmo'            // 营销副总
  | 'sales_manager'  // 销售经理
  | 'sales'          // 销售
  | 'project_manager' // 项目经理
  | 'business'       // 商务
  | 'finance'        // 财务

export type UserStatus = 'active' | 'inactive' | 'locked'

// 权限相关类型
export type Permission = 
  | 'lead_create'      // 创建线索
  | 'lead_view'        // 查看线索
  | 'lead_edit'        // 编辑线索
  | 'lead_delete'      // 删除线索
  | 'lead_assign'      // 分配线索
  | 'lead_convert'     // 转化线索
  | 'customer_create'  // 创建客户
  | 'customer_view'    // 查看客户
  | 'customer_edit'    // 编辑客户
  | 'customer_delete'  // 删除客户
  | 'project_create'   // 创建项目
  | 'project_view'     // 查看项目
  | 'project_edit'     // 编辑项目
  | 'project_delete'   // 删除项目
  | 'contract_create'  // 创建合同
  | 'contract_view'    // 查看合同
  | 'contract_edit'    // 编辑合同
  | 'contract_delete'  // 删除合同
  | 'payment_create'   // 创建回款
  | 'payment_view'     // 查看回款
  | 'payment_edit'     // 编辑回款
  | 'payment_delete'   // 删除回款
  | 'user_create'      // 创建用户
  | 'user_view'        // 查看用户
  | 'user_edit'        // 编辑用户
  | 'user_delete'      // 删除用户
  | 'role_view'        // 查看角色
  | 'role_edit'        // 编辑角色
  | 'report_view'      // 查看报表
  | 'dashboard_view'   // 查看仪表板

export interface Role {
  id: string
  name: string
  code: UserRole
  description: string
  permissions: Permission[]
  isSystem: boolean // 是否系统角色
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  username: string
  password: string
  name: string
  phone: string
  email?: string
  department?: string
  position?: string
  role: UserRole
  superiorId?: string
}

export interface UpdateUserRequest {
  name?: string
  phone?: string
  email?: string
  department?: string
  position?: string
  role?: UserRole
  superiorId?: string
  status?: UserStatus
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

// 线索相关类型
export interface Lead {
  id: string
  name: string
  company: string
  phone: string
  email?: string
  source: LeadSource
  industry?: string
  region?: string
  requirement?: string
  status: LeadStatus
  assignedTo?: string
  assignedUser?: User
  assignedAt?: string
  createdBy: string
  creator?: User
  department?: string // 部门
  lostReason?: string
  createdAt: string
  updatedAt: string
}

export type LeadSource = 'website' | 'referral' | 'advertisement' | 'exhibition' | 'cold_call' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

export interface CreateLeadRequest {
  name: string
  company: string
  phone: string
  email?: string
  source?: LeadSource
  industry?: string
  region?: string
  requirement?: string
}

// 客户相关类型
export interface Customer {
  id: string
  name: string
  industry?: string
  scale?: string
  address?: string
  phone?: string
  email?: string
  level: CustomerLevel
  status: CustomerStatus
  customFields?: Record<string, any>
  createdBy: string
  creator?: User
  contacts?: Contact[]
  createdAt: string
  updatedAt: string
}

export type CustomerLevel = 'vip' | 'important' | 'normal' | 'potential'
export type CustomerStatus = 'active' | 'inactive' | 'blacklist'

export interface Contact {
  id: string
  customerId: string
  name: string
  position?: string
  phone?: string
  email?: string
  department?: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerRequest {
  name: string
  industry?: string
  scale?: string
  address?: string
  phone?: string
  email?: string
  level?: CustomerLevel
  status?: CustomerStatus
  customFields?: Record<string, any>
}

// 项目相关类型
export interface Project {
  id: string
  customerId: string
  customer?: Customer
  opportunityId?: string
  contractId?: string
  name: string
  type: ProjectType
  status: ProjectStatus
  manager: string
  managerUser?: User
  startDate: string
  endDate: string
  description?: string
  milestones?: Milestone[]
  createdAt: string
  updatedAt: string
}

export type ProjectType = 'presales' | 'development' | 'implementation'
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'

export interface Milestone {
  id: string
  projectId: string
  name: string
  description?: string
  plannedDate: string
  actualDate?: string
  status: MilestoneStatus
  assignee: string
  assigneeUser?: User
  dependencies?: string[]
  createdAt: string
  updatedAt: string
}

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed'

export interface CreateMilestoneRequest {
  projectId: string
  name: string
  description?: string
  plannedDate: string
  assignee?: string
  dependencies?: string[]
}

export interface CreateProjectRequest {
  customerId: string
  opportunityId?: string
  contractId?: string
  name: string
  type: ProjectType
  manager: string
  startDate: string
  endDate: string
  description?: string
}

// 回款相关类型
export interface Payment {
  id: string
  contractId: string
  contract?: any
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: string
  expectedDate?: string
  status: PaymentStatus
  remark?: string
  confirmedBy?: string
  confirmedUser?: User
  confirmedAt?: string
  rejectionReason?: string
  attachments?: string[]
  createdBy: string
  creator?: User
  createdAt: string
  updatedAt: string
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'online' | 'other'
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected'

export interface CreatePaymentRequest {
  contractId: string
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: string
  expectedDate?: string
  remark?: string
  attachments?: string[]
}

// 分页查询参数
export interface PageQuery {
  page?: number
  pageSize?: number
  keyword?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  [key: string]: any
}

// 分页响应
export interface PageResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
