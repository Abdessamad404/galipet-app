import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="pro/[id]" />
      <Stack.Screen name="book/[proId]" />
      <Stack.Screen name="my-pets" />
      <Stack.Screen name="edit-profile" />
    </Stack>
  )
}
