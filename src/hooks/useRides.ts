import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { demoRides } from '../lib/demoData'
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
  const [error] = useState<string | null>(null)

  const fetchRides = useCallback(async () => {
    setLoading(true)
    let result = [...demoRides].filter(r => r.status === 'active')

    if (filters?.origin) {
      result = result.filter(r => r.origin.toLowerCase().includes(filters.origin!.toLowerCase()))
    }
    if (filters?.destination) {
      result = result.filter(r => r.destination.toLowerCase().includes(filters.destination!.toLowerCase()))
    }
    if (filters?.priceMin !== undefined) {
      result = result.filter(r => r.price_per_seat >= filters.priceMin!)
    }
    if (filters?.priceMax !== undefined) {
      result = result.filter(r => r.price_per_seat <= filters.priceMax!)
    }

    const sortField = filters?.sort || 'departure_at'
    const desc = filters?.sortDirection === 'desc'
    result.sort((a, b) => {
      const av = sortField === 'price_per_seat' ? a.price_per_seat : new Date(a.departure_at).getTime()
      const bv = sortField === 'price_per_seat' ? b.price_per_seat : new Date(b.departure_at).getTime()
      return desc ? bv - av : av - bv
    })

    setTimeout(() => {
      setRides(result)
      setLoading(false)
    }, 300)
  }, [filters?.origin, filters?.destination, filters?.date, filters?.sort, filters?.sortDirection, filters?.priceMin, filters?.priceMax])

  useEffect(() => {
    fetchRides()
  }, [fetchRides])

  return { rides, loading, error, refetch: fetchRides }
}

export function useRide(id: string) {
  const [ride, setRide] = useState<Ride | null>(null)
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setTimeout(() => {
      setRide(demoRides.find(r => r.id === id) || null)
      setLoading(false)
    }, 200)
  }, [id])

  return { ride, loading, error }
}

export function useMyRides() {
  const { user } = useAuth()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  const fetchMyRides = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setTimeout(() => {
      setRides(demoRides.filter(r => r.driver_id === user.id))
      setLoading(false)
    }, 200)
  }, [user])

  useEffect(() => {
    fetchMyRides()
  }, [fetchMyRides])

  return { rides, loading, error, refetch: fetchMyRides }
}

export async function createRide(_data: {
  origin: string
  destination: string
  intermediate_stops?: string[]
  departure_at: string
  price_per_seat: number
  total_seats: number
  available_seats: number
  notes?: string
}): Promise<{ error: string | null }> {
  return { error: null }
}

export async function updateRideStatus(
  _id: string,
  _status: Ride['status']
): Promise<{ error: string | null }> {
  return { error: null }
}
