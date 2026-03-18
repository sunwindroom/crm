import request from '@/utils/request'
import type { Payment, CreatePaymentRequest, PageQuery, PageResponse } from '@/types'

export const paymentApi = {
  // 获取回款列表
  getList(params?: PageQuery) {
    return request.get<PageResponse<Payment>>('/payments', { params })
  },

  // 获取合同的回款列表
  getByContractId(contractId: string, params?: PageQuery) {
    return request.get<PageResponse<Payment>>(`/contracts/${contractId}/payments`, { params })
  },

  // 获取回款详情
  getDetail(id: string) {
    return request.get<Payment>(`/payments/${id}`)
  },

  // 创建回款
  create(data: CreatePaymentRequest) {
    return request.post<Payment>('/payments', data)
  },

  // 更新回款
  update(id: string, data: Partial<CreatePaymentRequest>) {
    return request.put<Payment>(`/payments/${id}`, data)
  },

  // 删除回款
  delete(id: string) {
    return request.delete(`/payments/${id}`)
  },

  // 确认回款
  confirm(id: string, data?: { remark?: string }) {
    return request.post<Payment>(`/payments/${id}/confirm`, data)
  },

  // 拒绝回款
  reject(id: string, data: { reason: string }) {
    return request.post<Payment>(`/payments/${id}/reject`, data)
  },

  // 批量确认回款
  batchConfirm(ids: string[], data?: { remark?: string }) {
    return request.post<Payment>('/payments/batch-confirm', {
      ids,
      ...data
    })
  },

  // 获取回款统计
  getStats(contractId?: string) {
    const url = contractId ? `/contracts/${contractId}/payments/stats` : '/payments/stats'
    return request.get(url)
  }
}
