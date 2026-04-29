import { useState, useCallback, useEffect, useRef } from 'react'
import { profilesService, ProfileFilters } from '../services/profilesService'
import { Profile } from '../types'

export function useProfiles(defaultFilters: ProfileFilters = {}) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const defaultFiltersRef = useRef(defaultFilters)

  const fetch = useCallback(async (filters: ProfileFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await profilesService.searchProfiles(filters)
      setProfiles(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch(defaultFiltersRef.current)
  }, [fetch])

  const search = useCallback(
    (filters: ProfileFilters) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        fetch({ ...defaultFiltersRef.current, ...filters })
      }, 400)
    },
    [fetch]
  )

  return { profiles, isLoading, error, search, fetch }
}
