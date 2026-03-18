import request from '@/utils/request'
import type { Lead, CreateLeadRequest, PageQuery, PageResponse } from '@/types'

export const leadApi = {
  // 获取线索列表
  getList(params?: PageQuery) {
    return request.get<PageResponse<Lead>>('/leads', { params })
  },

  // 获取线索详情
  getDetail(id: string) {
    return request.get<Lead>(`/leads/${id}`)
  },

  // 创建线索
  create(data: CreateLeadRequest) {
    return request.post<Lead>('/leads', data)
  },

  // 更新线索
  update(id: string, data: Partial<CreateLeadRequest>) {
    return request.put<Lead>(`/leads/${id}`, data)
  },

  // 删除线索
  delete(id: string) {
    return request.delete(`/leads/${id}`)
  },

  // 分配线索
  assign(id: string, data: { userId: string; remark?: string }) {
    return request.post<Lead>(`/leads/${id}/assign`, data)
  },

  // 批量分配线索
  batchAssign(leadIds: string[], data: { userId: string; remark?: string }) {
    return request.post<Lead>('/leads/batch-assign', {
      leadIds,
      ...data
    })
  },

  // 转化线索
  convert(id: string, data: { customerId: string; opportunityId?: string }) {
    return request.post<Lead>(`/leads/${id}/convert`, data)
  },

  // 标记流失
  markAsLost(id: string, reason: string) {
    return request.post<Lead>(`/leads/${id}/lost`, { reason })
  }
}
