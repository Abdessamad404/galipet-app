import { useState, useEffect } from 'react'
import { reviewsService } from '../services/reviewsService'
import { Review } from '../types'

export function useReviews(professionalId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!professionalId) return
    setIsLoading(true)
    setError(null)
    reviewsService
      .getForProfessional(professionalId)
      .then(setReviews)
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Erreur inconnue'
        setError(msg)
        setReviews([])
      })
      .finally(() => setIsLoading(false))
  }, [professionalId])

  return { reviews, isLoading, error }
}
