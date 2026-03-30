import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { demoBookings } from '../lib/demoData'
import type { Booking } from '../types/index'

export function useMyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  const fetchMyBookings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setTimeout(() => {
      setBookings(demoBookings)
      setLoading(false)
    }, 200)
  }, [user])

  useEffect(() => {
    fetchMyBookings()
  }, [fetchMyBookings])

  return { bookings, loading, error, refetch: fetchMyBookings }
}

export function useRideBookings(rideId: string) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  const fetchRideBookings = useCallback(async () => {
    if (!rideId) return
    setLoading(true)
    setTimeout(() => {
      setBookings(demoBookings.filter(b => b.ride_id === rideId))
      setLoading(false)
    }, 200)
  }, [rideId])

  useEffect(() => {
    fetchRideBookings()
  }, [fetchRideBookings])

  return { bookings, loading, error, refetch: fetchRideBookings }
}

export async function createBooking(_rideId: string): Promise<{ error: string | null }> {
  return { error: null }
}

export async function confirmBooking(_bookingId: string): Promise<{ error: string | null }> {
  return { error: null }
}

export async function rejectBooking(_bookingId: string): Promise<{ error: string | null }> {
  return { error: null }
}

export async function cancelBooking(_bookingId: string): Promise<{ error: string | null }> {
  return { error: null }
}
