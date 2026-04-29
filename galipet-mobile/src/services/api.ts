import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  console.log(`[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data ?? '')
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ← ${response.status} ${response.config.url}`, response.data)
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error(`[API] ← ${error.response.status} ${error.config?.url}`, error.response.data)
      if (error.response.status === 401) {
        useAuthStore.getState().logout()
      }
    } else {
      console.warn(`[API] ✗ ${error.config?.url ?? '?'} — ${error.code}: ${error.message}`)
    }
    return Promise.reject(error)
  },
)

export default api
