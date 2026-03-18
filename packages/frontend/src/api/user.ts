import request from '@/utils/request'
import type { User, Role, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, PageQuery, PageResponse } from '@/types'

export const userApi = {
  // 获取用户列表
  getList(params?: PageQuery) {
    return request.get<PageResponse<User>>('/users', { params })
  },

  // 获取用户详情
  getDetail(id: string) {
    return request.get<User>(`/users/${id}`)
  },

  // 获取可分配的销售人员列表
  getSalesUsers(params?: { keyword?: string }) {
    return request.get<User[]>('/users/sales', { params })
  },

  // 获取所有角色列表
  getRoles() {
    return request.get<Role[]>('/roles')
  },

  // 获取角色详情
  getRoleDetail(id: string) {
    return request.get<Role>(`/roles/${id}`)
  },

  // 创建用户
  create(data: CreateUserRequest) {
    return request.post<User>('/users', data)
  },

  // 更新用户
  update(id: string, data: UpdateUserRequest) {
    return request.put<User>(`/users/${id}`, data)
  },

  // 删除用户
  delete(id: string) {
    return request.delete(`/users/${id}`)
  },

  // 更新用户状态
  updateStatus(id: string, status: User['status']) {
    return request.patch(`/users/${id}/status`, { status })
  },

  // 修改密码
  changePassword(data: ChangePasswordRequest) {
    return request.post('/users/change-password', data)
  },

  // 获取当前用户信息
  getCurrentUser() {
    return request.get<User>('/users/me')
  },

  // 更新当前用户信息
  updateCurrentUser(data: Partial<UpdateUserRequest>) {
    return request.put<User>('/users/me', data)
  },

  // 重置密码(管理员)
  resetPassword(id: string, newPassword: string) {
    return request.post(`/users/${id}/reset-password`, { newPassword })
  },

  // 获取下属用户列表
  getSubordinates() {
    return request.get<User[]>('/users/subordinates')
  },

  // 获取上级用户信息
  getSuperior() {
    return request.get<User>('/users/superior')
  }
}
