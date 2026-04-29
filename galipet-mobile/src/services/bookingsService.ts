import api from './api'
import { Booking, BookingStatus } from '../types'

interface ApiWrapper<T> {
  success: boolean
  data: T
}

export interface CreateBookingPayload {
  professional_id: string
  pet_id: string
  service_type: string
  slot_id: string
  notes?: string
}

export const bookingsService = {
  getMyBookings: (asRole: 'owner' | 'professional' = 'owner') =>
    api
      .get<ApiWrapper<Booking[]>>('/bookings', { params: { asRole } })
      .then((r) => r.data.data),

  getBooking: (id: string) =>
    api
      .get<ApiWrapper<Booking>>(`/bookings/${id}`)
      .then((r) => r.data.data),

  createBooking: (payload: CreateBookingPayload) =>
    api
      .post<ApiWrapper<Booking>>('/bookings', payload)
      .then((r) => r.data.data),

  updateStatus: (id: string, status: BookingStatus) =>
    api
      .patch<ApiWrapper<Booking>>(`/bookings/${id}/status`, { status })
      .then((r) => r.data.data),
}
