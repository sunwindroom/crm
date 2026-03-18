export interface User {
  id: string
  username: string
  name: string
  phone?: string
  email?: string
  department?: string
  avatar?: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}
