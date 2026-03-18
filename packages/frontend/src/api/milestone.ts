import request from '@/utils/request'
import type { Milestone, CreateMilestoneRequest, PageQuery, PageResponse } from '@/types'

export const milestoneApi = {
  // 获取项目的里程碑列表
  getList(projectId: string, params?: PageQuery) {
    return request.get<PageResponse<Milestone>>(`/projects/${projectId}/milestones`, { params })
  },

  // 获取里程碑详情
  getDetail(id: string) {
    return request.get<Milestone>(`/milestones/${id}`)
  },

  // 创建里程碑
  create(data: CreateMilestoneRequest) {
    return request.post<Milestone>('/milestones', data)
  },

  // 更新里程碑
  update(id: string, data: Partial<CreateMilestoneRequest>) {
    return request.put<Milestone>(`/milestones/${id}`, data)
  },

  // 删除里程碑
  delete(id: string) {
    return request.delete(`/milestones/${id}`)
  },

  // 完成里程碑
  complete(id: string, data?: { actualDate?: string; remark?: string }) {
    return request.post<Milestone>(`/milestones/${id}/complete`, data)
  },

  // 更新里程碑状态
  updateStatus(id: string, status: Milestone['status'], data?: { reason?: string }) {
    return request.patch<Milestone>(`/milestones/${id}/status`, { status, ...data })
  },

  // 批量删除里程碑
  batchDelete(ids: string[]) {
    return request.delete('/milestones/batch', { data: { ids } })
  },

  // 更新里程碑依赖关系
  updateDependencies(id: string, dependencies: string[]) {
    return request.put<Milestone>(`/milestones/${id}/dependencies`, { dependencies })
  }
}
