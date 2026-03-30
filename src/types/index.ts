export type UserRole = 'passenger' | 'driver' | 'admin'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string
  avatar_url: string | null
  car_model: string | null
  car_color: string | null
  license_plate: string | null
  seats_total: number | null
  deposit_balance: number
  avg_rating: number
  rating_count: number
  language: 'ru' | 'uz'
  is_banned: boolean
  created_at: string
  updated_at: string
}

export type RideStatus = 'active' | 'full' | 'completed' | 'cancelled'

export interface Ride {
  id: string
  driver_id: string
  origin: string
  destination: string
  intermediate_stops: string[] | null
  departure_at: string
  price_per_seat: number
  total_seats: number
  available_seats: number
  notes: string | null
  status: RideStatus
  created_at: string
  driver?: Profile
}

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled'

export interface Booking {
  id: string
  ride_id: string
  passenger_id: string
  status: BookingStatus
  commission_amount: number | null
  created_at: string
  updated_at: string
  ride?: Ride
  passenger?: Profile
}

export type TransactionType = 'top_up' | 'commission' | 'refund' | 'adjustment'

export interface DepositTransaction {
  id: string
  driver_id: string
  type: TransactionType
  amount: number
  balance_after: number
  booking_id: string | null
  note: string | null
  created_by: string | null
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: Profile
  reviewee?: Profile
  booking?: Booking
}

export interface City {
  id: number
  name_ru: string
  name_uz: string
  region_ru: string | null
  region_uz: string | null
}
