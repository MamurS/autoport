import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { demoReviews } from '../lib/demoData'
import type { Review } from '../types/index'

export function useReviews(userId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setTimeout(() => {
      setReviews(demoReviews.filter(r => r.reviewee_id === userId || true))
      setLoading(false)
    }, 200)
  }, [userId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return { reviews, loading, error, refetch: fetchReviews }
}

export async function createReview(
  _bookingId: string,
  _revieweeId: string,
  _rating: number,
  _comment?: string
): Promise<{ error: string | null }> {
  return { error: null }
}

export function useCanReview(_bookingId: string) {
  return { canReview: true, loading: false }
}
