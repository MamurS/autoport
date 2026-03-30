import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import type { Review } from '../../types'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/utils'

export default function AdminReviews() {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(*), reviewee:profiles!reviewee_id(*)')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(t('admin.fetchError', 'Failed to load reviews'))
    } else {
      setReviews(data || [])
    }
    setLoading(false)
  }

  async function deleteReview(reviewId: string) {
    const confirmed = window.confirm(
      t('admin.confirmDeleteReview', 'Are you sure you want to delete this review?')
    )
    if (!confirmed) return

    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
    if (error) {
      toast.error(t('admin.deleteError', 'Failed to delete review'))
    } else {
      toast.success(t('admin.reviewDeleted', 'Review deleted'))
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    }
  }

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        {t('admin.reviews', 'Reviews')}
      </h1>

      {loading ? (
        <p className="text-gray-500 text-center py-8">{t('common.loading', 'Loading...')}</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('admin.noReviews', 'No reviews found')}</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {renderStars(review.rating)}
                    <Badge>{review.rating}/5</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      {review.reviewer?.full_name || t('admin.unknown', 'Unknown')}
                    </span>
                    {' '}&rarr;{' '}
                    <span className="font-medium text-gray-900">
                      {review.reviewee?.full_name || t('admin.unknown', 'Unknown')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteReview(review.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t('admin.delete', 'Delete')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
