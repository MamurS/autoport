import { Card, CardContent } from '../ui/Card'
import { StarRating } from '../ui/StarRating'
import { formatDate } from '../../lib/utils'
import type { Review } from '../../types'
import { useTranslation } from 'react-i18next'

interface ReviewCardProps {
  review: Review
  actions?: React.ReactNode
}

export function ReviewCard({ review, actions }: ReviewCardProps) {
  const { i18n } = useTranslation()

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {review.reviewer?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-400">
              {formatDate(review.created_at, i18n.language)}
            </p>
          </div>
          <StarRating rating={review.rating} size={14} />
        </div>
        {review.comment && (
          <p className="text-sm text-gray-600">{review.comment}</p>
        )}
        {actions && <div className="mt-2">{actions}</div>}
      </CardContent>
    </Card>
  )
}
