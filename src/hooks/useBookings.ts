import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Booking } from '../types/index'

export function useMyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyBookings = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select('*, ride:rides(*, driver:profiles(*)), passenger:profiles(*)')
      .eq('passenger_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setBookings(data as Booking[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchMyBookings()
  }, [fetchMyBookings])

  return { bookings, loading, error, refetch: fetchMyBookings }
}

export function useRideBookings(rideId: string) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRideBookings = useCallback(async () => {
    if (!rideId) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select('*, passenger:profiles(*), ride:rides(*)')
      .eq('ride_id', rideId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setBookings(data as Booking[])
    }
    setLoading(false)
  }, [rideId])

  useEffect(() => {
    fetchRideBookings()
  }, [fetchRideBookings])

  return { bookings, loading, error, refetch: fetchRideBookings }
}

export async function createBooking(
  rideId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('bookings')
    .insert({ ride_id: rideId })

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

export async function confirmBooking(
  bookingId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('confirm_booking', {
    booking_id: bookingId,
  })

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

export async function rejectBooking(
  bookingId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

export async function cancelBooking(
  bookingId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}
