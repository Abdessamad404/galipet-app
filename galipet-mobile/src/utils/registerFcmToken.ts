import * as Notifications from 'expo-notifications'
import api from '../services/api'

export async function registerFcmToken() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') return

    const { data: token } = await Notifications.getExpoPushTokenAsync()
    await api.patch('/profiles/me/fcm-token', { fcm_token: token })
  } catch {
    // Silencieux — les notifications push sont optionnelles
  }
}
