import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Review } from '../types/index'

export function useReviews(userId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(*), booking:bookings(*)')
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setReviews(data as Review[])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return { reviews, loading, error, refetch: fetchReviews }
}

export async function createReview(
  bookingId: string,
  revieweeId: string,
  rating: number,
  comment?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reviews').insert({
    booking_id: bookingId,
    reviewee_id: revieweeId,
    rating,
    comment: comment ?? null,
  })

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

export function useCanReview(bookingId: string) {
  const { user } = useAuth()
  const [canReview, setCanReview] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !bookingId) {
      setCanReview(false)
      setLoading(false)
      return
    }

    const check = async () => {
      setLoading(true)

      const { count, error } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('booking_id', bookingId)
        .eq('reviewer_id', user.id)

      if (error) {
        setCanReview(false)
      } else {
        setCanReview(count === 0)
      }
      setLoading(false)
    }

    check()
  }, [user, bookingId])

  return { canReview, loading }
}
