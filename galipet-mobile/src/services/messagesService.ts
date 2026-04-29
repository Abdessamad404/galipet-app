import api from './api'
import { Message } from '../types'

interface ApiWrapper<T> {
  success: boolean
  data: T
}

export const messagesService = {
  getBookingMessages: (bookingId: string) =>
    api
      .get<ApiWrapper<Message[]>>(`/messages/booking/${bookingId}`)
      .then((r) => r.data.data),

  sendMessage: (bookingId: string, receiverId: string, content: string) =>
    api
      .post<ApiWrapper<Message>>('/messages', { booking_id: bookingId, receiver_id: receiverId, content })
      .then((r) => r.data.data),

  getUnreadCount: () =>
    api
      .get<ApiWrapper<{ unread_count: number }>>('/messages/unread-count')
      .then((r) => r.data.data.unread_count ?? 0),

  deleteMessage: (id: string) =>
    api.delete(`/messages/${id}`),
}
