import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { demoReviews } from '../../lib/demoData'
import type { Review } from '../../types'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/utils'

export default function AdminReviews() {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState<Review[]>(demoReviews)

  function deleteReview(reviewId: string) {
    setReviews(prev => prev.filter(r => r.id !== reviewId))
    toast.success('Review deleted')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.reviews')}</h1>
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews found</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <Badge>{review.rating}/5</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{review.reviewer?.full_name || 'Unknown'}</span>
                    {' → '}
                    <span className="font-medium text-gray-900">{review.reviewee?.full_name || 'Unknown'}</span>
                  </div>
                  {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
                  <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => deleteReview(review.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
