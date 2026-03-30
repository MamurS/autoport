-- Atomic confirm_booking function
-- Deducts commission from driver deposit and confirms the booking
CREATE OR REPLACE FUNCTION confirm_booking(booking_id UUID)
RETURNS JSON AS $$
DECLARE
  v_ride rides%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_commission INTEGER;
  v_driver profiles%ROWTYPE;
BEGIN
  -- Get the booking
  SELECT * INTO v_booking FROM bookings WHERE id = booking_id;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Booking not found');
  END IF;

  IF v_booking.status != 'pending' THEN
    RETURN json_build_object('error', 'Booking is not pending');
  END IF;

  -- Get the ride
  SELECT * INTO v_ride FROM rides WHERE id = v_booking.ride_id;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Ride not found');
  END IF;

  -- Verify the caller is the driver
  IF v_ride.driver_id != auth.uid() THEN
    RETURN json_build_object('error', 'Not authorized');
  END IF;

  -- Check available seats
  IF v_ride.available_seats < 1 THEN
    RETURN json_build_object('error', 'No available seats');
  END IF;

  -- Calculate commission (10%)
  v_commission := ROUND(v_ride.price_per_seat * 0.10);

  -- Get driver profile
  SELECT * INTO v_driver FROM profiles WHERE id = v_ride.driver_id;

  -- Check deposit balance
  IF v_driver.deposit_balance < v_commission THEN
    RETURN json_build_object('error', 'Insufficient deposit balance');
  END IF;

  -- Deduct commission from driver deposit
  UPDATE profiles
  SET deposit_balance = deposit_balance - v_commission,
      updated_at = NOW()
  WHERE id = v_ride.driver_id;

  -- Create transaction record
  INSERT INTO deposit_transactions (driver_id, type, amount, balance_after, booking_id, note)
  VALUES (
    v_ride.driver_id,
    'commission',
    -v_commission,
    v_driver.deposit_balance - v_commission,
    booking_id,
    'Commission for booking confirmation'
  );

  -- Update booking status
  UPDATE bookings
  SET status = 'confirmed',
      commission_amount = v_commission,
      updated_at = NOW()
  WHERE id = booking_id;

  -- Decrement available seats
  UPDATE rides
  SET available_seats = available_seats - 1,
      status = CASE WHEN available_seats - 1 = 0 THEN 'full' ELSE status END
  WHERE id = v_ride.ride_id;

  RETURN json_build_object('success', true, 'commission', v_commission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin adjust deposit function
CREATE OR REPLACE FUNCTION admin_adjust_deposit(
  target_driver_id UUID,
  adjustment_amount INTEGER,
  adjustment_type TEXT,
  adjustment_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_driver profiles%ROWTYPE;
  v_new_balance INTEGER;
BEGIN
  -- Verify caller is admin
  IF NOT is_admin() THEN
    RETURN json_build_object('error', 'Not authorized');
  END IF;

  -- Validate type
  IF adjustment_type NOT IN ('top_up', 'refund', 'adjustment') THEN
    RETURN json_build_object('error', 'Invalid adjustment type');
  END IF;

  -- Get driver
  SELECT * INTO v_driver FROM profiles WHERE id = target_driver_id AND role = 'driver';
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Driver not found');
  END IF;

  -- Calculate new balance
  v_new_balance := v_driver.deposit_balance + adjustment_amount;

  -- Update deposit balance
  UPDATE profiles
  SET deposit_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = target_driver_id;

  -- Create transaction record
  INSERT INTO deposit_transactions (driver_id, type, amount, balance_after, note, created_by)
  VALUES (
    target_driver_id,
    adjustment_type,
    adjustment_amount,
    v_new_balance,
    adjustment_note,
    auth.uid()
  );

  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update average rating after review insert
CREATE OR REPLACE FUNCTION update_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET avg_rating = (
    SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE reviewee_id = NEW.reviewee_id
  ),
  rating_count = (
    SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_avg_rating
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_avg_rating();
