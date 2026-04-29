import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { Profile } from '../types'

const TOKEN_KEY = 'galipet_token'
const USER_KEY = 'galipet_user'

interface AuthState {
  user: Profile | null
  token: string | null
  isHydrated: boolean
  setUser: (user: Profile, token: string) => Promise<void>
  updateUser: (user: Profile) => Promise<void>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  setUser: async (user, token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
    set({ user, token })
  },

  updateUser: async (user) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
    set({ user })
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_KEY)
    set({ user: null, token: null })
  },

  // Appelé au démarrage de l'app pour restaurer la session
  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    const raw = await SecureStore.getItemAsync(USER_KEY)
    const user: Profile | null = raw ? (JSON.parse(raw) as Profile) : null
    set({ token, user, isHydrated: true })
  },
}))
