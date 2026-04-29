export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "owner" | "professional" | "both" | "admin";
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  city?: string;
  role: "owner" | "professional" | "both" | "admin";
  bio?: string;
  service_type_ids?: string[];
  rating_avg?: number;
  rating_count?: number;
  is_verified?: boolean;
  accepts_insurance?: boolean;
  location_text?: string;
  price_per_day?: number;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed?: string;
  age_months?: number;
  photo_url?: string;
  notes?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  owner_id: string;
  professional_id: string;
  pet_id: string;
  service_type_id: string;
  slot_id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  price?: number;
  notes?: string;
  booked_at: string;
  deleted_at?: string;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  sent_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  professional_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface InsuranceLead {
  id: string;
  owner_id: string;
  pet_id: string;
  full_name: string;
  email: string;
  phone: string;
  pet_name: string;
  pet_species: string;
  city: string;
  status: "pending" | "contacted" | "converted" | "rejected";
  created_at: string;
}

// Request enrichie avec l'utilisateur connecté
export interface AuthRequest extends Express.Request {
  user?: AuthUser;
}
