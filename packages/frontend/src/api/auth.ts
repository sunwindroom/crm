import { request } from '@/utils/request'
import type { LoginParams, LoginResponse, User } from '@/types/auth'

export const authApi = {
  login(params: LoginParams): Promise<LoginResponse> {
    return request.post('/auth/login', params)
  },

  logout(): Promise<void> {
    return request.post('/auth/logout')
  },

  getProfile(): Promise<User> {
    return request.get('/auth/profile')
  }
}
