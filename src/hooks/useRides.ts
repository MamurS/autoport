import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Ride } from '../types/index'

interface RideFilters {
  origin?: string
  destination?: string
  date?: string
  sort?: 'departure_at' | 'price_per_seat' | 'created_at'
  sortDirection?: 'asc' | 'desc'
  priceMin?: number
  priceMax?: number
}

export function useRides(filters?: RideFilters) {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRides = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('rides')
      .select('*, driver:profiles(*)')
      .eq('status', 'active')

    if (filters?.origin) {
      query = query.eq('origin', filters.origin)
    }
    if (filters?.destination) {
      query = query.eq('destination', filters.destination)
    }
    if (filters?.date) {
      query = query
        .gte('departure_at', `${filters.date}T00:00:00`)
        .lte('departure_at', `${filters.date}T23:59:59`)
    }
    if (filters?.priceMin !== undefined) {
      query = query.gte('price_per_seat', filters.priceMin)
    }
    if (filters?.priceMax !== undefined) {
      query = query.lte('price_per_seat', filters.priceMax)
    }

    const sortField = filters?.sort || 'departure_at'
    const sortDirection = filters?.sortDirection === 'desc'
    query = query.order(sortField, { ascending: !sortDirection })

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRides(data as Ride[])
    }
    setLoading(false)
  }, [filters?.origin, filters?.destination, filters?.date, filters?.sort, filters?.sortDirection, filters?.priceMin, filters?.priceMax])

  useEffect(() => {
    fetchRides()
  }, [fetchRides])

  return { rides, loading, error, refetch: fetchRides }
}

export function useRide(id: string) {
  const [ride, setRide] = useState<Ride | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchRide = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('rides')
        .select('*, driver:profiles(*)')
        .eq('id', id)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setRide(data as Ride)
      }
      setLoading(false)
    }

    fetchRide()
  }, [id])

  return { ride, loading, error }
}

export function useMyRides() {
  const { user } = useAuth()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyRides = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('rides')
      .select('*, driver:profiles(*)')
      .eq('driver_id', user.id)
      .order('departure_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRides(data as Ride[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchMyRides()
  }, [fetchMyRides])

  return { rides, loading, error, refetch: fetchMyRides }
}

export async function createRide(data: {
  origin: string
  destination: string
  intermediate_stops?: string[]
  departure_at: string
  price_per_seat: number
  total_seats: number
  available_seats: number
  notes?: string
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('rides').insert(data)

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

export async function updateRideStatus(
  id: string,
  status: Ride['status']
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('rides')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}
