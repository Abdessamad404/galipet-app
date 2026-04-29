import api from './api'
import { Review } from '../types'

interface ApiWrapper<T> {
  success: boolean
  data: T
}

export const reviewsService = {
  getForProfessional: (professionalId: string, limit = 20) =>
    api
      .get<ApiWrapper<Review[]>>(`/reviews/professional/${professionalId}`, { params: { limit } })
      .then((r) => r.data.data),
}
