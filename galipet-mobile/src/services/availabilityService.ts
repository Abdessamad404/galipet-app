import api from './api'
import { AvailabilitySlot } from '../types'

interface ApiWrapper<T> {
  success: boolean
  data: T
}

export const availabilityService = {
  getAvailableSlots: (professionalId: string) =>
    api
      .get<ApiWrapper<AvailabilitySlot[]>>(`/availability/professional/${professionalId}`)
      .then((r) => r.data.data),
}
