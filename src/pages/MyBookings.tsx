import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Ticket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMyBookings, cancelBooking } from '../hooks/useBookings'
import { createReview } from '../hooks/useReviews'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { BookingCard } from '../components/shared/BookingCard'
import { StarRating } from '../components/ui/StarRating'

export default function MyBookings() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { bookings, loading, refetch } = useMyBookings()

  const [cancelLoading, setCancelLoading] = useState<string | null>(null)

  // Review modal state
  const [reviewModal, setReviewModal] = useState<{
    bookingId: string
    driverId: string
  } | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const handleCancel = async (bookingId: string) => {
    setCancelLoading(bookingId)
    const { error } = await cancelBooking(bookingId)
    setCancelLoading(null)
    if (error) {
      toast.error(t('toast.error'))
    } else {
      toast.success(t('toast.bookingCancelled'))
      refetch()
    }
  }

  const handleReviewSubmit = async () => {
    if (!reviewModal) return
    setReviewLoading(true)
    const { error } = await createReview(
      reviewModal.bookingId,
      reviewModal.driverId,
      reviewRating,
      reviewComment.trim() || undefined
    )
    setReviewLoading(false)
    if (error) {
      toast.error(t('toast.error'))
    } else {
      toast.success(t('toast.reviewSubmitted'))
      setReviewModal(null)
      setReviewRating(5)
      setReviewComment('')
      refetch()
    }
  }

  const canCancelBooking = (booking: typeof bookings[0]) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') return false
    if (!booking.ride) return true
    return new Date(booking.ride.departure_at) > new Date()
  }

  const canReview = (booking: typeof bookings[0]) => {
    return (
      booking.status === 'confirmed' &&
      booking.ride?.status === 'completed' &&
      booking.ride?.driver_id
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t('myBookings.title')}</h1>

        {loading ? (
          <p className="text-sm text-gray-400">{t('common.loading')}</p>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={<Ticket size={48} />}
            title={t('myBookings.noBookings')}
          />
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                actions={
                  <div className="flex flex-wrap gap-2">
                    {canCancelBooking(booking) && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCancel(booking.id)}
                        loading={cancelLoading === booking.id}
                      >
                        {t('myBookings.cancelBooking')}
                      </Button>
                    )}
                    {canReview(booking) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setReviewModal({
                            bookingId: booking.id,
                            driverId: booking.ride!.driver_id,
                          })
                        }
                      >
                        {t('myBookings.leaveReview')}
                      </Button>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        )}

        {/* Review Modal */}
        <Modal
          isOpen={!!reviewModal}
          onClose={() => setReviewModal(null)}
          title={t('reviews.writeReview')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reviews.rating')}
              </label>
              <StarRating
                rating={reviewRating}
                interactive
                onChange={setReviewRating}
                size={28}
              />
            </div>

            <Input
              label={t('reviews.comment')}
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder={t('reviews.commentPlaceholder')}
            />

            <Button
              onClick={handleReviewSubmit}
              loading={reviewLoading}
              className="w-full"
              size="lg"
            >
              {t('reviews.submit')}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
