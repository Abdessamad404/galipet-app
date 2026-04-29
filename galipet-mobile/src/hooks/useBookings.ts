import { useState, useCallback, useEffect } from 'react'
import { bookingsService } from '../services/bookingsService'
import { Booking, BookingStatus } from '../types'

export function useBookings(asRole: 'owner' | 'professional' = 'owner') {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await bookingsService.getMyBookings(asRole)
      setBookings(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }, [asRole])

  useEffect(() => {
    load()
  }, [load])

  const byStatus = useCallback(
    (status: BookingStatus) => bookings.filter((b) => b.status === status),
    [bookings]
  )

  return { bookings, isLoading, error, refresh: load, byStatus }
}
