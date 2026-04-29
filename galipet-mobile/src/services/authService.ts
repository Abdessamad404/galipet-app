import api from './api'
import { LoginRequest, RegisterRequest, AuthResponse, Profile } from '../types'

interface ApiWrapper<T> {
  success: boolean
  data: T
}

export const authService = {
  login: (data: LoginRequest) =>
    api
      .post<ApiWrapper<{ profile: Profile; token: string }>>('/auth/login', data)
      .then((r) => ({ user: r.data.data.profile, token: r.data.data.token } as AuthResponse)),

  register: (data: RegisterRequest) =>
    api
      .post<ApiWrapper<{ profile: Profile; token: string }>>('/auth/register', data)
      .then((r) => ({ user: r.data.data.profile, token: r.data.data.token } as AuthResponse)),

  me: () =>
    api
      .get<ApiWrapper<Profile>>('/auth/me')
      .then((r) => r.data.data),
}
