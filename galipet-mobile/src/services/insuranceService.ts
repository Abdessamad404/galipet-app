import api from './api'
import { InsuranceLead, InsuranceLeadStatus } from '../types'

interface LeadsResponse {
  success: boolean
  data: InsuranceLead[]
}

interface LeadResponse {
  success: boolean
  data: InsuranceLead
}

export const insuranceService = {
  getLeads: async (status?: InsuranceLeadStatus): Promise<InsuranceLead[]> => {
    const params = status ? { status } : {}
    const res = await api.get<LeadsResponse>('/insurance/leads', { params })
    return res.data.data
  },

  updateLeadStatus: async (id: string, status: InsuranceLeadStatus): Promise<InsuranceLead> => {
    const res = await api.patch<LeadResponse>(`/insurance/leads/${id}/status`, { status })
    return res.data.data
  },
}
