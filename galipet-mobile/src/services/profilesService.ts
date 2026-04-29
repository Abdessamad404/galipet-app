import api from './api'
import { Profile } from '../types'

interface ApiWrapper<T> {
  success: boolean
  data: T
}

export interface ProfileFilters {
  city?: string
  service?: string
  service_type_id?: string
  is_verified?: boolean
  limit?: number
  offset?: number
}

export interface UpdateProfilePayload {
  full_name?: string
  phone?: string
  city?: string
  bio?: string
  price_per_day?: number
}

export const profilesService = {
  searchProfiles: (filters: ProfileFilters = {}) =>
    api
      .get<ApiWrapper<Profile[]>>('/profiles/search', { params: filters })
      .then((r) => r.data.data),

  getProfile: (id: string) =>
    api
      .get<ApiWrapper<Profile>>(`/profiles/${id}`)
      .then((r) => r.data.data),

  updateMyProfile: (payload: UpdateProfilePayload) =>
    api
      .put<ApiWrapper<Profile>>('/profiles/me', payload)
      .then((r) => r.data.data),
}
