import request from '@/utils/request'
import type { Role, Permission } from '@/types'

export const roleApi = {
  // 获取所有角色列表
  getList() {
    return request.get<Role[]>('/roles')
  },

  // 获取角色详情
  getDetail(id: string) {
    return request.get<Role>(`/roles/${id}`)
  },

  // 根据角色代码获取角色
  getByCode(code: string) {
    return request.get<Role>(`/roles/code/${code}`)
  },

  // 创建角色
  create(data: {
    name: string
    code: string
    description?: string
    permissions: Permission[]
  }) {
    return request.post<Role>('/roles', data)
  },

  // 更新角色
  update(id: string, data: {
    name?: string
    description?: string
    permissions?: Permission[]
  }) {
    return request.put<Role>(`/roles/${id}`, data)
  },

  // 删除角色
  delete(id: string) {
    return request.delete(`/roles/${id}`)
  }
}
