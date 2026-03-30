-- AutoPort Taxi - Database Schema

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('passenger', 'driver', 'admin')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  -- Driver-specific fields
  car_model TEXT,
  car_color TEXT,
  license_plate TEXT,
  seats_total INTEGER,
  -- Deposit
  deposit_balance INTEGER DEFAULT 0,
  -- Rating
  avg_rating NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  --
  language TEXT DEFAULT 'ru' CHECK (language IN ('ru', 'uz')),
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rides
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  intermediate_stops TEXT[],
  departure_at TIMESTAMPTZ NOT NULL,
  price_per_seat INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  commission_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deposit Transactions
CREATE TABLE deposit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('top_up', 'commission', 'refund', 'adjustment')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  note TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id)
);

-- Cities lookup (for autocomplete)
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  region_ru TEXT,
  region_uz TEXT
);

-- Indexes
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_departure_at ON rides(departure_at);
CREATE INDEX idx_bookings_ride_id ON bookings(ride_id);
CREATE INDEX idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX idx_deposit_transactions_driver_id ON deposit_transactions(driver_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
