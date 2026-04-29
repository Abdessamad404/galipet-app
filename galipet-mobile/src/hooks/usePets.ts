import { useState, useEffect, useCallback } from 'react'
import { petsService } from '../services/petsService'
import { Pet } from '../types'

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await petsService.getMyPets()
      setPets(data)
    } catch {
      setPets([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { pets, isLoading, refresh: load }
}
