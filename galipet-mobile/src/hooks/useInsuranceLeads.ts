import { useState, useEffect, useCallback } from 'react'
import { insuranceService } from '../services/insuranceService'
import { InsuranceLead, InsuranceLeadStatus } from '../types'

export function useInsuranceLeads(statusFilter?: InsuranceLeadStatus) {
  const [leads, setLeads] = useState<InsuranceLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await insuranceService.getLeads(statusFilter)
      setLeads(data)
    } catch {
      setError('Impossible de charger les leads')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const updateStatus = async (id: string, status: InsuranceLeadStatus) => {
    setIsUpdating(true)
    try {
      const updated = await insuranceService.updateLeadStatus(id, status)
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)))
    } catch {
      setError('Impossible de mettre à jour le statut')
    } finally {
      setIsUpdating(false)
    }
  }

  return { leads, isLoading, isUpdating, error, updateStatus, refresh: fetchLeads }
}
