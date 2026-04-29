import api from './api'
import { Pet } from '../types'

interface ApiWrapper<T> {
  success: boolean
  data: T
}

export interface CreatePetPayload {
  name: string
  species: string
  breed?: string
  age?: number
  weight?: number
}

export const petsService = {
  getMyPets: () =>
    api.get<ApiWrapper<Pet[]>>('/pets').then((r) => r.data.data),

  createPet: (payload: CreatePetPayload) =>
    api.post<ApiWrapper<Pet>>('/pets', payload).then((r) => r.data.data),

  deletePet: (id: string) =>
    api.delete(`/pets/${id}`),
}
