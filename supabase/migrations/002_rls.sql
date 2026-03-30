-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- RIDES
CREATE POLICY "Anyone can read active rides"
  ON rides FOR SELECT
  USING (true);

CREATE POLICY "Drivers can insert their own rides"
  ON rides FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own rides"
  ON rides FOR UPDATE
  USING (auth.uid() = driver_id);

CREATE POLICY "Admins can update any ride"
  ON rides FOR UPDATE
  USING (is_admin());

-- BOOKINGS
CREATE POLICY "Passengers can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Passengers see their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = passenger_id
    OR EXISTS (
      SELECT 1 FROM rides WHERE rides.id = bookings.ride_id AND rides.driver_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "Drivers can update bookings for their rides"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rides WHERE rides.id = bookings.ride_id AND rides.driver_id = auth.uid()
    )
    OR auth.uid() = passenger_id
    OR is_admin()
  );

-- DEPOSIT TRANSACTIONS
CREATE POLICY "Drivers see their own transactions"
  ON deposit_transactions FOR SELECT
  USING (auth.uid() = driver_id OR is_admin());

CREATE POLICY "System/admin can insert transactions"
  ON deposit_transactions FOR INSERT
  WITH CHECK (is_admin());

-- REVIEWS
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
      AND (bookings.passenger_id = auth.uid() OR EXISTS (
        SELECT 1 FROM rides WHERE rides.id = bookings.ride_id AND rides.driver_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  USING (is_admin());

-- CITIES
CREATE POLICY "Anyone can read cities"
  ON cities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage cities"
  ON cities FOR ALL
  USING (is_admin());
