export type UserRole = 'owner' | 'professional' | 'both' | 'admin'

export type InsuranceLeadStatus = 'new' | 'contacted' | 'converted' | 'rejected'

export interface InsuranceLead {
  id: string
  owner_id: string
  pet_id: string
  owner_name: string
  owner_phone: string
  pet_name: string
  pet_species: string
  owner_city: string
  status: InsuranceLeadStatus
  created_at: string
}
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'cancelled' | 'completed'

export interface Profile {
  id: string
  full_name: string
  email?: string
  avatar_url?: string
  phone?: string
  city?: string
  location_text?: string
  role: UserRole
  bio?: string
  services?: string[]
  accepts_insurance?: boolean
  rating_avg?: number
  is_verified?: boolean
  price_per_day?: number
}

export interface Pet {
  id: string
  owner_id: string
  name: string
  species: string
  breed?: string
  age?: number
  weight?: number
  photo_url?: string
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment?: string
  created_at: string
  reviewer?: { id: string; full_name: string; avatar_url?: string }
  booking?: { id: string; service_type: string }
}

export interface ServiceType {
  id: string
  professional_id: string
  name: string
  description?: string
  price: number
  duration_minutes: number
}

export interface AvailabilitySlot {
  id: string
  professional_id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
}

export interface Booking {
  id: string
  owner_id: string
  professional_id: string
  pet_id: string
  service_type: string
  availability_slot_id: string
  status: BookingStatus
  total_price?: number
  notes?: string
  start_date?: string
  end_date?: string
  created_at: string
  professional?: Profile
  owner?: Profile
  pet?: Pet
}

export interface Message {
  id: string
  booking_id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  sent_at: string
}

// Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  role: UserRole
}

export interface AuthResponse {
  user: Profile
  token: string
}
