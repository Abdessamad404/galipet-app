import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '../src/store/authStore'
import { colors } from '../src/constants/colors'

export default function RootLayout() {
  const { user, isHydrated, hydrate } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()

  // Restaurer la session depuis le stockage sécurisé au démarrage
  useEffect(() => { hydrate() }, [])

  useEffect(() => {
    if (!isHydrated) return
    const inAuth = segments[0] === '(auth)'
    if (!user && !inAuth) {
      router.replace('/(auth)/login')
    } else if (user && inAuth) {
      router.replace(user.role === 'admin' ? '/(admin)' : '/(app)')
    }
  }, [user, segments, isHydrated])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
