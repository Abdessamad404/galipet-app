import { useState } from 'react'
import { useRouter } from 'expo-router'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { registerFcmToken } from '../utils/registerFcmToken'
import { LoginRequest, RegisterRequest } from '../types'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser, logout } = useAuthStore()
  const router = useRouter()

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await authService.login(credentials)
      await setUser(data.user, data.token)
      registerFcmToken()
      router.replace(data.user.role === 'admin' ? '/(admin)' : '/(app)')
    } catch (e: unknown) {
      setError(extractMessage(e, 'Connexion échouée'))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload: RegisterRequest) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await authService.register(payload)
      await setUser(data.user, data.token)
      registerFcmToken()
      router.replace(data.user.role === 'admin' ? '/(admin)' : '/(app)')
    } catch (e: unknown) {
      setError(extractMessage(e, 'Inscription échouée'))
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  return { login, register, signOut, isLoading, error }
}

function extractMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const err = e as { response?: { data?: { error?: string; message?: string } }; message?: string; code?: string }
    if (err.response?.data) {
      return err.response.data.error ?? err.response.data.message ?? fallback
    }
    // Network error (no server, timeout, wrong IP…)
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
      return `Serveur inaccessible (${err.code}) — vérifiez que l'API est démarrée et que vous êtes sur le bon réseau WiFi`
    }
    if (err.message) return err.message
  }
  return fallback
}
