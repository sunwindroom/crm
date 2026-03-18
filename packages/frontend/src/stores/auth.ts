import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { User, LoginParams } from '@/types/auth'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  // 从 localStorage 读取 token 和用户信息
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(() => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  })

  const isAuthenticated = computed(() => !!token.value)

  async function login(params: LoginParams) {
    try {
      console.log('AuthStore: 开始登录请求', params)
      const response = await authApi.login(params)
      console.log('AuthStore: 登录响应', response)

      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      console.log('AuthStore: Token 已保存', token.value)
      console.log('AuthStore: 用户信息已保存', user.value)
      console.log('AuthStore: 认证状态', isAuthenticated.value)

      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      console.error('AuthStore: 登录失败', error)
      ElMessage.error(error.message || '登录失败')
      return false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  async function fetchProfile() {
    try {
      const response = await authApi.getProfile()
      user.value = response
      return response
    } catch (error) {
      logout()
      throw error
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    fetchProfile
  }
})
