import { useState, useEffect } from 'react'
import { availabilityService } from '../services/availabilityService'
import { AvailabilitySlot } from '../types'

export function useAvailability(professionalId: string | undefined) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!professionalId) return
    setIsLoading(true)
    availabilityService
      .getAvailableSlots(professionalId)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setIsLoading(false))
  }, [professionalId])

  return { slots, isLoading }
}
